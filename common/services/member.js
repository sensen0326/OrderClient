import authService from '@/common/services/auth.js'

const hasUniCloud = typeof uniCloud !== 'undefined' && uniCloud && typeof uniCloud.importObject === 'function'
const hasUni = typeof uni !== 'undefined'

const PROFILE_KEY = 'memberProfile'
const TOKEN_KEY = 'memberToken'

const getMemberObject = (() => {
	let instance = null
	return () => {
		if (!hasUniCloud) return null
		if (!instance) {
			instance = uniCloud.importObject('member', {
				customUI: true
			})
		}
		return instance
	}
})()

function getStoredProfile() {
	if (!hasUni) return null
	try {
		return uni.getStorageSync(PROFILE_KEY) || null
	} catch (err) {
		console.warn('getStoredProfile failed', err)
		return null
	}
}

function getStoredToken() {
	if (!hasUni) return ''
	try {
		return uni.getStorageSync(TOKEN_KEY) || ''
	} catch (err) {
		return ''
	}
}

function saveProfile(profile, token) {
	if (!hasUni) return
	try {
		if (profile) {
			uni.setStorageSync(PROFILE_KEY, profile)
		}
		if (token) {
			uni.setStorageSync(TOKEN_KEY, token)
		}
	} catch (err) {
		console.warn('saveProfile failed', err)
	}
}

async function login(payload = {}) {
	const memberObj = getMemberObject()
	if (!memberObj) {
		const displayNickname = payload.nickname || (payload.userInfo && (payload.userInfo.nickname || payload.userInfo.nickName)) || '本地会员'
		const displayAvatar = payload.avatar || (payload.userInfo && (payload.userInfo.avatar || payload.userInfo.avatarUrl)) || ''
		const mockProfile = {
			userId: payload.userId || `local_${Date.now()}`,
			nickname: displayNickname,
			avatar: displayAvatar,
			points: 680,
			level_name: 'V2',
			level_progress: 45,
			level_benefits: ['95 折', '免预约']
		}
		saveProfile(mockProfile, 'LOCAL_TOKEN')
		return mockProfile
	}
	let authSession = payload.authSession
	if (!authSession && authService && typeof authService.ensureLogin === 'function') {
		try {
			authSession = await authService.ensureLogin(payload.userInfo || {
				nickName: payload.nickname,
				avatarUrl: payload.avatar
			})
		} catch (err) {
			console.warn('ensureLogin failed', err)
		}
	}
	const loginPayload = {}
	if (authSession && authSession.openid) {
		loginPayload.openid = authSession.openid
		if (authSession.unionid) {
			loginPayload.unionid = authSession.unionid
		}
	}
	if (payload.openid) {
		loginPayload.openid = payload.openid
	}
	if (payload.unionid) {
		loginPayload.unionid = payload.unionid
	}
	const res = await memberObj.login(loginPayload)
	const profile = res.profile || {}
	profile.userId = profile.userId || res.userId
	saveProfile(profile, res.token)
	return {
		profile,
		isNew: !!res.isNew
	}
}

async function fetchProfile() {
	const stored = getStoredProfile()
	const memberObj = getMemberObject()
	if (!memberObj) {
		return stored
	}
	if (!stored || !stored.userId) {
		return null
	}
	try {
		const res = await memberObj.profile({
			userId: stored.userId
		})
		if (res && res.profile) {
			saveProfile(res.profile, getStoredToken())
			return res.profile
		}
		return stored
	} catch (err) {
		console.warn('fetchProfile failed', err)
		return stored
	}
}

async function signIn() {
	const profile = getStoredProfile()
	if (!profile || !profile.userId) {
		throw new Error('请先登录')
	}
	const memberObj = getMemberObject()
	if (!memberObj) {
		const next = Object.assign({}, profile, {
			points: (profile.points || 0) + 10
		})
		saveProfile(next, getStoredToken())
		return {
			points: next.points,
			profile: next,
			mock: true
		}
	}
	const res = await memberObj.signIn({
		userId: profile.userId
	})
	const updated = res.profile || Object.assign({}, profile, { points: res.points })
	saveProfile(updated, getStoredToken())
	return {
		points: updated.points,
		profile: updated
	}
}

async function listPointGoods() {
	const memberObj = getMemberObject()
	if (!memberObj) {
		return [
			{
				_id: 'local_goods_1',
				name: '精品茶点',
				cost_points: 300,
				stock: 999,
				cover: 'https://mp-a83aee34-7c6d-40e3-a241-85ab45b7ff6e.cdn.bspapp.com/cloudstorage/static/points/goods-tea.jpg',
				desc: '线下兑换茶点'
			},
			{
				_id: 'local_goods_2',
				name: '20 元抵扣券',
				cost_points: 500,
				stock: 200,
				cover: 'https://mp-a83aee34-7c6d-40e3-a241-85ab45b7ff6e.cdn.bspapp.com/cloudstorage/static/points/goods-coupon.jpg',
				desc: '订单抵扣券'
			}
		]
	}
	const res = await memberObj.listPointGoods()
	return (res && res.list) || []
}

async function exchangeGoods(goodsId) {
	const profile = getStoredProfile()
	if (!profile || !profile.userId) {
		throw new Error('请先登录')
	}
	const memberObj = getMemberObject()
	if (!memberObj) {
		if ((profile.points || 0) < 100) {
			throw new Error('积分不足')
		}
		const next = Object.assign({}, profile, {
			points: profile.points - 100
		})
		saveProfile(next, getStoredToken())
		return {
			profile: next,
			mock: true
		}
	}
	const res = await memberObj.exchangeGoods({
		userId: profile.userId,
		goodsId
	})
	const updated = res.profile || profile
	saveProfile(updated, getStoredToken())
	return {
		profile: updated
	}
}

async function updateProfile(payload = {}) {
	const stored = getStoredProfile()
	const memberObj = getMemberObject()
	const userId = payload.userId || (stored && stored.userId)
	if (!userId) {
		throw new Error('请先登录')
	}
	if (!memberObj) {
		const next = Object.assign({}, stored || {}, {
			nickname: payload.nickname || (stored && stored.nickname) || '微信顾客',
			avatar: payload.avatar || (stored && stored.avatar) || ''
		})
		saveProfile(next, getStoredToken())
		return next
	}
	const res = await memberObj.updateProfile({
		userId,
		nickname: payload.nickname,
		avatar: payload.avatar
	})
	const profile = res && res.profile ? res.profile : stored
	saveProfile(profile, getStoredToken())
	return profile
}

export default {
	login,
	fetchProfile,
	getStoredProfile,
	getStoredToken,
	signIn,
	listPointGoods,
	exchangeGoods,
	saveProfile,
	updateProfile
}
