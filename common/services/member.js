import authService from '@/common/services/auth.js'

const hasUniCloud = typeof uniCloud !== 'undefined' && uniCloud && typeof uniCloud.importObject === 'function'
const hasUni = typeof uni !== 'undefined'

const PROFILE_KEY = 'memberProfile'
const TOKEN_KEY = 'memberToken'
const LEDGER_KEY = 'memberPointLedgerMock'
const ORDER_KEY = 'memberPointOrdersMock'

const LOCAL_LEVEL_RULES = [
	{ level: 1, name: 'V1', require_points: 0, benefits: ['生日礼遇', '积分入门'] },
	{ level: 2, name: 'V2', require_points: 200, benefits: ['95折', '优先排队'] },
	{ level: 3, name: 'V3', require_points: 600, benefits: ['免配送费', '专属客服'] }
]

const LOCAL_POINT_RULES = [
	{ event: 'daily_sign', name: '每日签到', description: '每天首次签到 +10 积分', calc_type: 'fixed', value: 10 },
	{ event: 'order_pay', name: '下单消费', description: '每消费 1 元获 1 积分', calc_type: 'ratio', ratio: 1 },
	{ event: 'review_post', name: '评价奖励', description: '每日前 3 条评价各 +20 积分', calc_type: 'fixed', value: 20 },
	{ event: 'invite_friend', name: '邀请好友', description: '成功邀请好友注册 +50 积分', calc_type: 'fixed', value: 50 }
]

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

function getMockLedger() {
	const list = []
	const now = Date.now()
	for (let i = 0; i < 8; i += 1) {
		list.push({
			_id: `ledger_${i}`,
			change: i % 2 === 0 ? 10 : -20,
			balance: 500 - i * 5,
			event: i % 2 === 0 ? 'daily_sign' : 'exchange_goods',
			remark: i % 2 === 0 ? '每日签到' : '兑换礼品',
			created_at: now - i * 3600 * 1000
		})
	}
	return list
}

function getMockPointOrders() {
	const now = Date.now()
	return [
		{
			orderId: 'mock_order_1',
			goods_name: '精品茶歇券',
			goods_cover: 'https://mp-a83aee34-7c6d-40e3-a241-85ab45b7ff6e.cdn.bspapp.com/cloudstorage/static/points/goods-tea.jpg',
			status: 'pending',
			cost_points: 300,
			created_at: now - 3600 * 1000
		},
		{
			orderId: 'mock_order_2',
			goods_name: '甄选饮品券',
			goods_cover: 'https://mp-a83aee34-7c6d-40e3-a241-85ab45b7ff6e.cdn.bspapp.com/cloudstorage/static/points/goods-coupon.jpg',
			status: 'completed',
			cost_points: 200,
			created_at: now - 3600 * 5 * 1000
		}
	]
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
		profile: updated,
		pointOrder: res.pointOrder
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

async function getLevelRules() {
	const memberObj = getMemberObject()
	if (!memberObj) {
		return LOCAL_LEVEL_RULES
	}
	try {
		const res = await memberObj.levelRules()
		return (res && res.list) || LOCAL_LEVEL_RULES
	} catch (err) {
		console.warn('getLevelRules failed', err)
		return LOCAL_LEVEL_RULES
	}
}

async function fetchPointLedger(limit = 20) {
	const profile = getStoredProfile()
	if (!profile || !profile.userId) return []
	const memberObj = getMemberObject()
	if (!memberObj) {
		if (hasUni) {
			const cached = uni.getStorageSync(LEDGER_KEY)
			if (cached && cached.length) return cached
			uni.setStorageSync(LEDGER_KEY, getMockLedger())
			return getMockLedger()
		}
		return getMockLedger()
	}
	try {
		const res = await memberObj.pointLedger({
			userId: profile.userId,
			limit
		})
		return (res && res.list) || []
	} catch (err) {
		console.warn('fetchPointLedger failed', err)
		return []
	}
}

async function listPointOrders(limit = 10) {
	const profile = getStoredProfile()
	if (!profile || !profile.userId) return []
	const memberObj = getMemberObject()
	if (!memberObj) {
		return getMockPointOrders()
	}
	try {
		const res = await memberObj.pointOrders({
			userId: profile.userId,
			limit
		})
		return (res && res.list) || []
	} catch (err) {
		console.warn('listPointOrders failed', err)
		return []
	}
}

async function getPointRules() {
	const memberObj = getMemberObject()
	if (!memberObj) {
		return LOCAL_POINT_RULES
	}
	try {
		const res = await memberObj.pointRules()
		return (res && res.list) || LOCAL_POINT_RULES
	} catch (err) {
		console.warn('getPointRules failed', err)
		return LOCAL_POINT_RULES
	}
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
	updateProfile,
	getLevelRules,
	fetchPointLedger,
	listPointOrders,
	getPointRules
}
