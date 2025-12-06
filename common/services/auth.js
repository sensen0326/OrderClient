const hasUniCloud = typeof uniCloud !== 'undefined' && uniCloud && typeof uniCloud.importObject === 'function'
const hasUni = typeof uni !== 'undefined'

const AUTH_STORAGE_KEY = 'authSession'

const getAuthObject = (() => {
	let instance = null
	return () => {
		if (!hasUniCloud) return null
		if (!instance) {
			instance = uniCloud.importObject('auth', {
				customUI: true
			})
		}
		return instance
	}
})()

function getStoredSession() {
	if (!hasUni) return null
	try {
		return uni.getStorageSync(AUTH_STORAGE_KEY) || null
	} catch (err) {
		console.warn('getStoredSession failed', err)
		return null
	}
}

function saveSession(session) {
	if (!hasUni) return
	try {
		uni.setStorageSync(AUTH_STORAGE_KEY, session)
	} catch (err) {
		console.warn('saveSession failed', err)
	}
}

function clearSession() {
	if (!hasUni) return
	try {
		uni.removeStorageSync(AUTH_STORAGE_KEY)
	} catch (err) {
		console.warn('clearSession failed', err)
	}
}

function isSessionValid(session) {
	if (!session || !session.sessionKey) return false
	if (!session.expiresAt) return false
	return session.expiresAt > Date.now()
}

function requestLoginCode() {
	return new Promise((resolve, reject) => {
		const useUniLogin = hasUni && typeof uni.login === 'function'
		const useWxLogin = typeof wx !== 'undefined' && wx && typeof wx.login === 'function'
		if (!useUniLogin && !useWxLogin) {
			reject(new Error('当前运行环境不支持微信登录'))
			return
		}
		const loginFn = useUniLogin ? uni.login : wx.login
		loginFn({
			provider: 'weixin',
			success: res => {
				if (res && res.code) {
					resolve(res.code)
				} else {
					reject(new Error('未获取到登录 code'))
				}
			},
			fail: err => reject(err)
		})
	})
}

async function requestAuthSession(userInfo = {}) {
	if (!hasUniCloud) {
		const mock = {
			openid: 'mock_openid',
			unionid: '',
			sessionKey: `mock_session_${Date.now()}`,
			expiresAt: Date.now() + 3600 * 1000,
			mock: true
		}
		saveSession(mock)
		return mock
	}
	const authObj = getAuthObject()
	if (!authObj) {
		throw new Error('auth 云对象不可用')
	}
	const code = await requestLoginCode()
	const res = await authObj.login({
		code,
		userInfo
	})
	const session = {
		openid: res.openid,
		unionid: res.unionid || '',
		sessionKey: res.sessionKey,
		sessionId: res.sessionId,
		expiresAt: res.expiresAt || (Date.now() + (res.expiresIn || 7200) * 1000)
	}
	saveSession(session)
	return session
}

async function ensureLogin(userInfo = {}) {
	const stored = getStoredSession()
	if (isSessionValid(stored)) {
		return stored
	}
	return requestAuthSession(userInfo)
}

async function verifySession() {
	if (!hasUniCloud) {
		return {
			valid: !!getStoredSession(),
			mock: true
		}
	}
	const session = getStoredSession()
	if (!session) {
		return {
			valid: false
		}
	}
	const authObj = getAuthObject()
	try {
		await authObj.checkSession({
			sessionKey: session.sessionKey,
			openid: session.openid
		})
		return {
			valid: true
		}
	} catch (err) {
		return {
			valid: false,
			error: err
		}
	}
}

async function bindPhoneNumber(code, userId) {
	if (!code) {
		throw new Error('缺少授权码')
	}
	const authObj = getAuthObject()
	if (!authObj) {
		throw new Error('auth 云对象不可用')
	}
	const res = await authObj.getPhoneNumber({
		code,
		userId
	})
	return res
}

export default {
	ensureLogin,
	login: requestAuthSession,
	verifySession,
	getStoredSession,
	saveSession,
	clearSession,
	bindPhoneNumber
}
