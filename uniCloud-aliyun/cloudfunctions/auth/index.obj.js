'use strict'

const crypto = require('crypto')

const db = uniCloud.database()
const httpClient = uniCloud.httpclient

const USER_COLLECTION = 'user_profile'
const SESSION_COLLECTION = 'user_session'

const DEFAULT_AVATAR_URL = 'https://mp-a83aee34-7c6d-40e3-a241-85ab45b7ff6e.cdn.bspapp.com/cloudstorage/static/my/avatarurl.jpg'
const DEFAULT_NICKNAME_PREFIX = '微信用户'

const config = require('./config')
const SESSION_GRACE_MS = 120 * 1000
let accessTokenCache = {
	token: '',
	expiresAt: 0,
	appId: ''
}

function maskAppId(appId = '') {
	if (!appId) return 'EMPTY'
	if (appId.length <= 6) return appId
	return `${appId.slice(0, 4)}***${appId.slice(-4)}`
}

function assertConfig() {
	if (!config.appId || !config.appSecret) {
		const source = config.meta && config.meta.source ? config.meta.source : 'unknown'
		throw new Error(`[auth] missing appId/appSecret (source: ${source})`)
	}
	if (!/^wx[a-zA-Z0-9]{16}$/.test(config.appId)) {
		const source = config.meta && config.meta.source ? config.meta.source : 'unknown'
		throw new Error(`[auth] invalid appId format: ${maskAppId(config.appId)} (source: ${source})`)
	}
}

async function requestWeixinAPI(url, {
	method = 'GET',
	dataType = 'json',
	contentType = method === 'POST' ? 'json' : 'form',
	data,
	...rest
} = {}) {
	const requestData = typeof data !== 'undefined' ? data : rest
	const res = await httpClient.request(url, {
		method,
		data: requestData,
		dataType,
		contentType,
		timeout: 5000
	})
	if (!res || res.status !== 200) {
		throw new Error('请求微信接口失败')
	}
	const body = res.data
	if (body.errcode && body.errcode !== 0) {
		throw new Error(`${body.errmsg || '微信接口报错'} (errcode: ${body.errcode})`)
	}
	return body
}

async function getAccessToken() {
	if (
		accessTokenCache.token &&
		accessTokenCache.expiresAt > Date.now() &&
		accessTokenCache.appId === config.appId
	) {
		return accessTokenCache.token
	}
	let res
	try {
		res = await requestWeixinAPI('https://api.weixin.qq.com/cgi-bin/token', {
			appid: config.appId,
			secret: config.appSecret,
			grant_type: 'client_credential'
		})
	} catch (err) {
		const source = config.meta && config.meta.source ? config.meta.source : 'unknown'
		throw new Error(`[auth] getAccessToken failed, appId=${maskAppId(config.appId)}, source=${source}, reason=${err.message}`)
	}
	accessTokenCache = {
		token: res.access_token,
		expiresAt: Date.now() + (res.expires_in || 3600) * 1000 - 60000,
		appId: config.appId
	}
	return accessTokenCache.token
}

async function code2Session(code) {
	assertConfig()
	if (!code) {
		throw new Error('code is required')
	}
	const data = await requestWeixinAPI('https://api.weixin.qq.com/sns/jscode2session', {
		appid: config.appId,
		secret: config.appSecret,
		js_code: code,
		grant_type: 'authorization_code'
	})
	return {
		openid: data.openid,
		session_key: data.session_key,
		unionid: data.unionid,
		expires_in: data.expires_in || 7200
	}
}

async function saveSession(openid, sessionKey, unionid, expiresIn) {
	const now = Date.now()
	const ttl = Math.max(60, expiresIn || 7200) * 1000
	const doc = {
		openid,
		unionid: unionid || '',
		session_key: sessionKey,
		app_id: config.appId,
		expires_at: now + ttl,
		updated_at: now,
		created_at: now
	}
	const grace = Math.min(SESSION_GRACE_MS, Math.floor(ttl / 2))
	const safeExpiresAt = doc.expires_at - grace
	const existing = await db.collection(SESSION_COLLECTION).where({
		openid
	}).limit(1).get()
	if (existing.data && existing.data.length) {
		const sessionId = existing.data[0]._id
		await db.collection(SESSION_COLLECTION).doc(sessionId).update({
			session_key: sessionKey,
			unionid: unionid || '',
			expires_at: doc.expires_at,
			updated_at: now
		})
		return {
			sessionId,
			expiresAt: safeExpiresAt
		}
	}
	const addRes = await db.collection(SESSION_COLLECTION).add(doc)
	return {
		sessionId: addRes.id || addRes._id,
		expiresAt: safeExpiresAt
	}
}

async function upsertUserProfile({ openid, unionid, userInfo = {} }) {
	const now = Date.now()
	const profileRes = await db.collection(USER_COLLECTION).where({
		openid
	}).limit(1).get()
	if (profileRes.data && profileRes.data.length) {
		const profile = profileRes.data[0]
		await db.collection(USER_COLLECTION).doc(profile._id).update({
			unionid: unionid || profile.unionid || '',
			last_login_at: now,
			updated_at: now
		})
		return profile._id
	}
	const rand = String(Math.floor(Math.random() * 1000000)).padStart(6, '0')
	const nickname = `${DEFAULT_NICKNAME_PREFIX}${rand}`
	const doc = {
		openid,
		unionid: unionid || '',
		nickname,
		avatar: DEFAULT_AVATAR_URL,
		mobile: '',
		level: 1,
		points: 400,
		experience: 0,
		created_at: now,
		updated_at: now,
		last_login_at: now
	}
	const addRes = await db.collection(USER_COLLECTION).add(doc)
	return addRes.id || addRes._id
}

async function updateMobile(userId, phoneNumber) {
	if (!userId || !phoneNumber) return
	await db.collection(USER_COLLECTION).doc(userId).update({
		mobile: phoneNumber,
		updated_at: Date.now()
	})
}

async function checkSessionKey(sessionKey) {
	assertConfig()
	if (!sessionKey || !sessionKey.openid || !sessionKey.sessionKey) {
		throw new Error('sessionKey and openid are required')
	}
	const signature = crypto.createHash('sha256').update(sessionKey.sessionKey, 'utf8').digest('hex')
	const res = await requestWeixinAPI('https://api.weixin.qq.com/wxa/checksession', {
		method: 'POST',
		data: {
			appid: config.appId,
			signature,
			openid: sessionKey.openid,
			sig_method: 'hmac_sha256'
		}
	})
	return res
}

async function resetSessionKey(payload = {}) {
	assertConfig()
	if (!payload.openid) {
		throw new Error('openid is required')
	}
	const res = await requestWeixinAPI('https://api.weixin.qq.com/wxa/resetusersessionkey', {
		method: 'POST',
		data: {
			appid: config.appId,
			secret: config.appSecret,
			openid: payload.openid,
			session_key: payload.sessionKey
		}
	})
	return res
}

module.exports = {
	async code2Session(payload = {}) {
		return code2Session(payload.code)
	},
	async login(payload = {}) {
		const code = payload.code
		if (!code) {
			throw new Error('code is required')
		}
		const sessionInfo = await code2Session(code)
		const sessionRecord = await saveSession(sessionInfo.openid, sessionInfo.session_key, sessionInfo.unionid, sessionInfo.expires_in)
		const userId = await upsertUserProfile({
			openid: sessionInfo.openid,
			unionid: sessionInfo.unionid,
			userInfo: payload.userInfo || {}
		})
		return {
			userId,
			openid: sessionInfo.openid,
			unionid: sessionInfo.unionid || '',
			sessionKey: sessionInfo.session_key,
			expiresIn: sessionInfo.expires_in || 7200,
			sessionId: sessionRecord.sessionId,
			expiresAt: sessionRecord.expiresAt
		}
	},
	async checkSession(payload = {}) {
		if (!payload.sessionKey || !payload.openid) {
			throw new Error('sessionKey and openid are required')
		}
		const stored = await checkSessionKey({
			openid: payload.openid,
			sessionKey: payload.sessionKey
		})
		return {
			valid: true,
			apiResponse: stored
		}
	},
	async resetSession(payload = {}) {
		await resetSessionKey(payload)
		return {
			success: true
		}
	},
	async getPhoneNumber(payload = {}) {
		const code = payload.code
		const runtimeAppId = typeof payload.runtimeAppId === 'string' ? payload.runtimeAppId.trim() : ''
		if (!code) {
			throw new Error('code is required')
		}
		assertConfig()
		if (runtimeAppId && runtimeAppId !== config.appId) {
			throw new Error(`[auth] runtime mini-program appid mismatch, runtime=${runtimeAppId}, server=${config.appId}`)
		}
		let token = await getAccessToken()
		let phoneRes
		try {
			phoneRes = await requestWeixinAPI(`https://api.weixin.qq.com/wxa/business/getuserphonenumber?access_token=${token}`, {
				method: 'POST',
				contentType: 'json',
				data: {
					code
				}
			})
		} catch (err) {
			const msg = err && err.message ? err.message : ''
			if (msg.includes('errcode: 40013') || msg.toLowerCase().includes('invalid appid')) {
				// Force refresh token once to avoid stale token from previous appId config.
				accessTokenCache = { token: '', expiresAt: 0, appId: '' }
				token = await getAccessToken()
				try {
					phoneRes = await requestWeixinAPI(`https://api.weixin.qq.com/wxa/business/getuserphonenumber?access_token=${token}`, {
						method: 'POST',
						contentType: 'json',
						data: {
							code
						}
					})
				} catch (retryErr) {
					const source = config.meta && config.meta.source ? config.meta.source : 'unknown'
					const retryMsg = retryErr && retryErr.message ? retryErr.message : 'unknown error'
					throw new Error(
						`[auth] getPhoneNumber failed after token refresh, runtime=${runtimeAppId || 'EMPTY'}, server=${config.appId}, source=${source}, reason=${retryMsg}`
					)
				}
			} else {
				throw err
			}
		}
		const phoneNumber = phoneRes?.phone_info?.purePhoneNumber || ''
		if (phoneNumber && payload.userId) {
			await updateMobile(payload.userId, phoneNumber)
		}
		return {
			phoneInfo: phoneRes.phone_info || null,
			phoneNumber
		}
	}
}
