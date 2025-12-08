'use strict'

const db = uniCloud.database()
const dbCmd = db.command

const USER_COLLECTION = 'user_profile'
const LEDGER_COLLECTION = 'point_ledger'
const LEVEL_COLLECTION = 'member_level_rule'
const GOODS_COLLECTION = 'point_goods'
const POINT_RULE_COLLECTION = 'point_rule'
const POINT_ORDER_COLLECTION = 'point_order'

const DEFAULT_AVATAR_URL = 'https://mp-a83aee34-7c6d-40e3-a241-85ab45b7ff6e.cdn.bspapp.com/cloudstorage/static/my/avatarurl.jpg'
const DEFAULT_NICKNAME_PREFIX = '微信用户'

const DEFAULT_LEVELS = [
	{ level: 1, name: 'V1', require_points: 0, benefits: ['生日礼', '基础积分'] },
	{ level: 2, name: 'V2', require_points: 200, benefits: ['95 折', '优先排队'] },
	{ level: 3, name: 'V3', require_points: 600, benefits: ['免配送费', '专属客服'] }
]

const DEFAULT_GOODS = [
	{ name: '精品茶歇券', cost_points: 300, stock: 99, cover: 'https://mp-a83aee34-7c6d-40e3-a241-85ab45b7ff6e.cdn.bspapp.com/cloudstorage/static/points/goods-tea.jpg', desc: '堂食茶歇一份', status: 'on' },
	{ name: '20 元抵扣券', cost_points: 500, stock: 50, cover: 'https://mp-a83aee34-7c6d-40e3-a241-85ab45b7ff6e.cdn.bspapp.com/cloudstorage/static/points/goods-coupon.jpg', desc: '全场通用抵扣', status: 'on' }
]

const DEFAULT_POINT_RULES = [
	{
		event: 'daily_sign',
		name: '每日签到',
		calc_type: 'fixed',
		value: 10,
		change_direction: 'increase',
		limit: 1,
		limit_period: 'day',
		limit_tip: '今日已签到',
		description: '每天首次签到可得 10 积分',
		status: 'active'
	},
	{
		event: 'order_pay',
		name: '下单积分',
		calc_type: 'ratio',
		ratio: 1,
		change_direction: 'increase',
		description: '支付金额 1 元 = 1 积分，结果向下取整',
		status: 'active'
	},
	{
		event: 'review_post',
		name: '评价奖励',
		calc_type: 'fixed',
		value: 20,
		change_direction: 'increase',
		limit: 3,
		limit_period: 'day',
		limit_tip: '今日评价奖励已达上限',
		description: '每天前 3 条评价可获得 20 积分',
		status: 'active'
	},
	{
		event: 'invite_friend',
		name: '邀请好友',
		calc_type: 'fixed',
		value: 50,
		change_direction: 'increase',
		limit: 10,
		limit_period: 'total',
		limit_tip: '邀请奖励已达上限',
		description: '成功邀请好友注册可得 50 积分，每人限 10 次',
		status: 'active'
	}
]

let levelCache = null
let pointRuleCache = null

async function ensureLevelRules() {
	if (levelCache) return levelCache
	const countRes = await db.collection(LEVEL_COLLECTION).count()
	if (!countRes.total) {
		const now = Date.now()
		await db.collection(LEVEL_COLLECTION).add(DEFAULT_LEVELS.map(item => ({
			...item,
			created_at: now,
			updated_at: now
		})))
	}
	const res = await db.collection(LEVEL_COLLECTION).orderBy('level', 'asc').get()
	levelCache = res.data || DEFAULT_LEVELS
	return levelCache
}

async function ensurePointGoods() {
	const countRes = await db.collection(GOODS_COLLECTION).count()
	if (!countRes.total) {
		const now = Date.now()
		await db.collection(GOODS_COLLECTION).add(DEFAULT_GOODS.map(item => ({
			...item,
			created_at: now,
			updated_at: now
		})))
	}

async function ensurePointRules() {
	if (pointRuleCache) return pointRuleCache
	const countRes = await db.collection(POINT_RULE_COLLECTION).count()
	if (!countRes.total) {
		const now = Date.now()
		await db.collection(POINT_RULE_COLLECTION).add(DEFAULT_POINT_RULES.map(item => ({
			...item,
			created_at: now,
			updated_at: now
		})))
	}
	const ruleRes = await db.collection(POINT_RULE_COLLECTION).get()
	pointRuleCache = ruleRes.data || DEFAULT_POINT_RULES
	return pointRuleCache
}
}

async function getUserById(userId) {
	if (!userId) {
		throw new Error('userId is required')
	}
	const res = await db.collection(USER_COLLECTION).doc(userId).get()
	if (!res.data || !res.data.length) {
		throw new Error('user not found')
	}
	return res.data[0]
}

async function changePoints(userId, delta, event, remark) {
	const user = await getUserById(userId)
	const nextPoints = Math.max(0, Number(user.points || 0) + Number(delta || 0))
	const now = Date.now()
	await db.collection(USER_COLLECTION).doc(user._id).update({
		points: nextPoints,
		updated_at: now
	})
	await db.collection(LEDGER_COLLECTION).add({
		user_id: userId,
		change: delta,
		balance: nextPoints,
		event,
		remark,
		created_at: now
	})
	return nextPoints
}

async function attachLevelInfo(profile) {
	const levels = await ensureLevelRules()
	const sorted = levels.slice().sort((a, b) => a.level - b.level)
	let current = sorted[0]
	for (const rule of sorted) {
		if ((profile.points || 0) >= rule.require_points) {
			current = rule
		}
	}
	const nextIndex = sorted.findIndex(rule => rule.level === current.level) + 1
	const nextRule = sorted[nextIndex]
	profile.level_name = current.name
	profile.level_benefits = current.benefits || []
	if (nextRule) {
		const progressBase = current.require_points
		const progressTarget = nextRule.require_points
		const currentPoints = profile.points || 0
		const percent = ((currentPoints - progressBase) / (progressTarget - progressBase)) * 100
		profile.level_progress = Math.min(100, Math.max(0, Number(percent.toFixed(2))))
		profile.next_level_name = nextRule.name
		profile.next_level_need = Math.max(0, progressTarget - currentPoints)
	} else {
		profile.level_progress = 100
		profile.next_level_name = 'MAX'
		profile.next_level_need = 0
	}
	return profile
}

function normalizeProfile(doc) {
	const profile = Object.assign({}, doc, {
		userId: doc._id
	})
	return profile
}

async function getPointRule(event) {
	const rules = await ensurePointRules()
	return rules.find(rule => rule.event === event)
}

function resolveLimitWindow(rule) {
	if (!rule || !rule.limit || rule.limit <= 0) return null
	if (rule.limit_period === 'day') {
		const d = new Date()
		d.setHours(0, 0, 0, 0)
		return d.getTime()
	}
	return null
}

async function guardRuleLimit(rule, userId) {
	if (!rule || !rule.limit || rule.limit <= 0) return
	const where = {
		user_id: userId,
		event: rule.event
	}
	const start = resolveLimitWindow(rule)
	if (start) {
		where.created_at = dbCmd.gte(start)
	}
	const countRes = await db.collection(LEDGER_COLLECTION).where(where).count()
	if (countRes.total >= rule.limit) {
		throw new Error(rule.limit_tip || '积分奖励已达上限')
	}
}

function calcRulePoints(rule, payload = {}) {
	if (!rule) return 0
	let change = 0
	if (rule.calc_type === 'fixed') {
		change = Number(rule.value || 0)
	} else if (rule.calc_type === 'ratio') {
		const ratio = Number(rule.ratio || 0)
		const amount = Number(payload.amount || payload.orderAmount || 0)
		change = Math.floor(amount * ratio)
	}
	if (rule.max_points) {
		change = Math.min(change, Number(rule.max_points))
	}
	if (rule.change_direction === 'decrease') {
		change = -Math.abs(change)
	} else {
		change = Math.abs(change)
	}
	return change
}

async function applyPointRuleInternal(payload = {}) {
	if (!payload.userId) throw new Error('userId is required')
	if (!payload.event) throw new Error('event is required')
	const rule = await getPointRule(payload.event)
	if (!rule || rule.status !== 'active') {
		throw new Error('积分规则未启用')
	}
	await guardRuleLimit(rule, payload.userId)
	const change = calcRulePoints(rule, payload)
	if (!change) {
		const user = await getUserById(payload.userId)
		return {
			change: 0,
			balance: user.points || 0,
			rule
		}
	}
	const balance = await changePoints(payload.userId, change, rule.event, payload.remark || rule.name)
	return {
		change,
		balance,
		rule
	}
}

function normalizePointOrder(doc) {
	if (!doc) return null
	return Object.assign({}, doc, {
		orderId: doc._id
	})
}


module.exports = {
	async login(payload = {}) {
		await ensureLevelRules()
		const seedNickname = payload.nickname || DEFAULT_NICKNAME_PREFIX
		const openid = payload.openid || payload.unionid || payload.mobile || `guest_${seedNickname}_${Date.now()}`
		let profileRes = await db.collection(USER_COLLECTION).where({
			openid
		}).limit(1).get()
		let profile
		const now = Date.now()
		let isNew = false
		if (!profileRes.data || !profileRes.data.length) {
			const rand = String(Math.floor(Math.random() * 1000000)).padStart(6, '0')
			const nickname = `${DEFAULT_NICKNAME_PREFIX}${rand}`
			const doc = {
				openid,
				nickname,
				avatar: DEFAULT_AVATAR_URL,
				mobile: payload.mobile || '',
				level: 1,
				points: 400,
				experience: 0,
				created_at: now,
				updated_at: now,
				last_login_at: now
			}
			console.log('[member.login] create profile', openid, nickname, DEFAULT_AVATAR_URL)
			const addRes = await db.collection(USER_COLLECTION).add(doc)
			profile = Object.assign({}, doc, { _id: addRes.id || addRes._id })
			isNew = true
		} else {
			profile = profileRes.data[0]
			await db.collection(USER_COLLECTION).doc(profile._id).update({
				last_login_at: now,
				updated_at: now
			})
			profile.last_login_at = now
		}
		const token = `tk_${profile._id}_${Date.now()}`
		await db.collection(USER_COLLECTION).doc(profile._id).update({
			token
		})
		const decorated = await attachLevelInfo(normalizeProfile(profile))
		return {
			token,
			userId: profile._id,
			profile: decorated,
			isNew
		}
	},
	async profile(payload = {}) {
		const user = await getUserById(payload.userId)
		return {
			profile: await attachLevelInfo(normalizeProfile(user))
		}
	},
async signIn(payload = {}) {
	if (!payload.userId) {
		throw new Error('userId is required')
	}
	const result = await applyPointRuleInternal({
		userId: payload.userId,
		event: 'daily_sign',
		remark: '每日签到'
	})
	const user = await getUserById(payload.userId)
	user.points = result.balance
	return {
		points: result.balance,
		profile: await attachLevelInfo(normalizeProfile(user))
	}
},
	async listPointGoods() {
		await ensurePointGoods()
		const res = await db.collection(GOODS_COLLECTION).where({
			status: 'on'
		}).get()
		return {
			list: res.data || []
		}
	},
	async exchangeGoods(payload = {}) {
		if (!payload.userId || !payload.goodsId) {
			throw new Error('userId and goodsId are required')
		}
		const goodsRes = await db.collection(GOODS_COLLECTION).doc(payload.goodsId).get()
		if (!goodsRes.data || !goodsRes.data.length) {
			throw new Error('商品不存在')
		}
		const goods = goodsRes.data[0]
		if (goods.status !== 'on') {
			throw new Error('商品已下架')
		}
		if (goods.stock <= 0) {
			throw new Error('库存不足')
		}
		const user = await getUserById(payload.userId)
		if ((user.points || 0) < goods.cost_points) {
			throw new Error('积分不足')
		}
		await changePoints(payload.userId, -goods.cost_points, 'exchange_goods', goods.name)
		await db.collection(GOODS_COLLECTION).doc(goods._id).update({
			stock: dbCmd.inc(-1),
			updated_at: Date.now()
		})
		const now = Date.now()
		const orderDoc = {
			user_id: payload.userId,
			goods_id: goods._id,
			goods_name: goods.name,
			goods_cover: goods.cover || '',
			delivery_type: payload.deliveryType || goods.delivery_type || 'self_pick',
			contact: payload.contact || '',
			address: payload.address || '',
			remark: payload.remark || '',
			cost_points: goods.cost_points,
			status: 'pending',
			created_at: now,
			updated_at: now
		}
		const orderRes = await db.collection(POINT_ORDER_COLLECTION).add(orderDoc)
		const updatedUser = await getUserById(payload.userId)
		return {
			success: true,
			points: updatedUser.points,
			profile: await attachLevelInfo(normalizeProfile(updatedUser)),
			pointOrder: normalizePointOrder(Object.assign({}, orderDoc, { _id: orderRes.id || orderRes._id }))
		}
	},
	async updateProfile(payload = {}) {
		if (!payload.userId) {
			throw new Error('userId is required')
		}
		const doc = await getUserById(payload.userId)
		const updateData = {
			updated_at: Date.now()
		}
		if (payload.nickname) {
			updateData.nickname = payload.nickname
		}
		if (payload.avatar) {
			updateData.avatar = payload.avatar
		}
		await db.collection(USER_COLLECTION).doc(doc._id).update(updateData)
		const refreshed = await getUserById(payload.userId)
		return {
			profile: await attachLevelInfo(normalizeProfile(refreshed))
		}
	},
	async pointLedger(payload = {}) {
		if (!payload.userId) {
			throw new Error('userId is required')
		}
		const pageSize = Math.min(50, Math.max(1, Number(payload.limit || 20)))
		const res = await db.collection(LEDGER_COLLECTION)
			.where({
				user_id: payload.userId
			})
			.orderBy('created_at', 'desc')
			.limit(pageSize)
			.get()
		return {
			list: res.data || []
		}
	},
	async pointOrders(payload = {}) {
		if (!payload.userId) {
			throw new Error('userId is required')
		}
		const res = await db.collection(POINT_ORDER_COLLECTION)
			.where({
				user_id: payload.userId
			})
			.orderBy('created_at', 'desc')
			.limit(Math.min(50, Math.max(1, Number(payload.limit || 10))))
			.get()
		return {
			list: (res.data || []).map(normalizePointOrder)
		}
	},
	async levelRules() {
		const list = await ensureLevelRules()
		return {
			list
		}
	},
	async pointRules() {
		const list = await ensurePointRules()
		return {
			list
		}
	},
	async applyPointRule(payload = {}) {
		return applyPointRuleInternal(payload)
	}
}
