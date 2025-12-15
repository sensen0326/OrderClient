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
const DEFAULT_NICKNAME_PREFIX = 'Guest'

const DEFAULT_LEVELS = [
	{ level: 1, name: 'V1', require_points: 0, benefits: ['欢迎礼', '基础积分'] },
	{ level: 2, name: 'V2', require_points: 200, benefits: ['95折', '优先排队'] },
	{ level: 3, name: 'V3', require_points: 600, benefits: ['免配送费', '专属客服'] }
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
		limit_tip: '今日签到奖励已达上限',
		description: '每天首次签到可得10积分',
		status: 'active'
	},
	{
		event: 'order_pay',
		name: '下单积分',
		calc_type: 'ratio',
		ratio: 1,
		change_direction: 'increase',
		description: '支付金额1元=1积分，结果向下取整',
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
		description: '每天前3条评价可获得20积分',
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
		description: '成功邀请好友注册可得50积分，每人限10次',
		status: 'active'
	}
]

const DEFAULT_GOODS = [
	{
		name: '精品茶歇',
		cost_points: 300,
		stock: 99,
		cover: 'https://mp-a83aee34-7c6d-40e3-a241-85ab45b7ff6e.cdn.bspapp.com/cloudstorage/static/points/goods-tea.jpg',
		desc: '门店茶歇兑换券',
		status: 'on'
	},
	{
		name: '20元抵扣券',
		cost_points: 500,
		stock: 50,
		cover: 'https://mp-a83aee34-7c6d-40e3-a241-85ab45b7ff6e.cdn.bspapp.com/cloudstorage/static/points/goods-coupon.jpg',
		desc: '全场可用抵扣券',
		status: 'on'
	}
]

let levelCache = null
let pointRuleCache = null

function resetLevelCache() {
	levelCache = null
}

function resetPointRuleCache() {
	pointRuleCache = null
}

async function ensureLevelRules() {
	if (levelCache) return levelCache
	const countRes = await db.collection(LEVEL_COLLECTION).count()
	if (!countRes.total) {
		const now = Date.now()
		await db.collection(LEVEL_COLLECTION).add(
			DEFAULT_LEVELS.map(item => ({
				...item,
				created_at: now,
				updated_at: now
			}))
		)
	}
	const res = await db.collection(LEVEL_COLLECTION).orderBy('level', 'asc').get()
	levelCache = res.data || DEFAULT_LEVELS
	return levelCache
}

async function ensurePointRules() {
	if (pointRuleCache) return pointRuleCache
	const countRes = await db.collection(POINT_RULE_COLLECTION).count()
	if (!countRes.total) {
		const now = Date.now()
		await db.collection(POINT_RULE_COLLECTION).add(
			DEFAULT_POINT_RULES.map(item => ({
				...item,
				created_at: now,
				updated_at: now
			}))
		)
	}
	const res = await db.collection(POINT_RULE_COLLECTION).get()
	pointRuleCache = res.data || DEFAULT_POINT_RULES
	return pointRuleCache
}

async function ensurePointGoods() {
	const countRes = await db.collection(GOODS_COLLECTION).count()
	if (!countRes.total) {
		const now = Date.now()
		await db.collection(GOODS_COLLECTION).add(
			DEFAULT_GOODS.map(item => ({
				...item,
				created_at: now,
				updated_at: now
			}))
		)
	}
}

async function getUserById(userId) {
	if (!userId) throw new Error('userId is required')
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
		if ((profile.points || 0) >= Number(rule.require_points || 0)) {
			current = rule
		}
	}
	const nextIndex = sorted.findIndex(rule => rule.level === current.level) + 1
	const nextRule = sorted[nextIndex]
	profile.level_name = current.name
	profile.level_benefits = current.benefits || []
	if (nextRule) {
		const base = Number(current.require_points || 0)
		const target = Number(nextRule.require_points || 0)
		const currentPoints = Number(profile.points || 0)
		const percent = target === base ? 100 : ((currentPoints - base) / (target - base)) * 100
		profile.level_progress = Math.max(0, Math.min(100, Number(percent.toFixed(2))))
		profile.next_level_name = nextRule.name
		profile.next_level_need = Math.max(0, target - currentPoints)
	} else {
		profile.level_progress = 100
		profile.next_level_name = 'MAX'
		profile.next_level_need = 0
	}
	return profile
}

function normalizeProfile(doc) {
	return Object.assign({}, doc, { userId: doc._id })
}

async function getPointRuleByEvent(event) {
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
	const rule = await getPointRuleByEvent(payload.event)
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
	return Object.assign({}, doc, { orderId: doc._id })
}

function buildPagination(params = {}) {
	const page = Math.max(1, Number(params.page) || 1)
	const pageSize = Math.min(100, Math.max(1, Number(params.pageSize) || 20))
	return { page, pageSize }
}

function mergeFilters(filters = []) {
	if (!filters.length) return {}
	if (filters.length === 1) return filters[0]
	return dbCmd.and(filters)
}

module.exports = {
	async login(payload = {}) {
		await ensureLevelRules()
		const seedNickname = payload.nickname || DEFAULT_NICKNAME_PREFIX
		const openid = payload.openid || payload.unionid || payload.mobile || `guest_${seedNickname}_${Date.now()}`
		let profileRes = await db.collection(USER_COLLECTION).where({ openid }).limit(1).get()
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
		await db.collection(USER_COLLECTION).doc(profile._id).update({ token })
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
		if (!payload.userId) throw new Error('userId is required')
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
		const res = await db.collection(GOODS_COLLECTION).where({ status: 'on' }).orderBy('created_at', 'desc').get()
		return { list: res.data || [] }
	},
	async exchangeGoods(payload = {}) {
		if (!payload.userId || !payload.goodsId) {
			throw new Error('userId and goodsId are required')
		}
		const goodsRes = await db.collection(GOODS_COLLECTION).doc(payload.goodsId).get()
		if (!goodsRes.data || !goodsRes.data.length) throw new Error('商品不存在')
		const goods = goodsRes.data[0]
		if (goods.status !== 'on') throw new Error('商品已下架')
		if (goods.stock <= 0) throw new Error('库存不足')
		const user = await getUserById(payload.userId)
		if ((user.points || 0) < goods.cost_points) throw new Error('积分不足')
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
		if (!payload.userId) throw new Error('userId is required')
		const updateData = { updated_at: Date.now() }
		if (payload.nickname) updateData.nickname = payload.nickname
		if (payload.avatar) updateData.avatar = payload.avatar
		if (payload.mobile) updateData.mobile = payload.mobile
		await db.collection(USER_COLLECTION).doc(payload.userId).update(updateData)
		const refreshed = await getUserById(payload.userId)
		return {
			profile: await attachLevelInfo(normalizeProfile(refreshed))
		}
	},
	async pointLedger(payload = {}) {
		if (!payload.userId) throw new Error('userId is required')
		const limit = Math.min(50, Math.max(1, Number(payload.limit || 20)))
		const res = await db.collection(LEDGER_COLLECTION)
			.where({ user_id: payload.userId })
			.orderBy('created_at', 'desc')
			.limit(limit)
			.get()
		return { list: res.data || [] }
	},
	async pointOrders(payload = {}) {
		if (!payload.userId) throw new Error('userId is required')
		const limit = Math.min(50, Math.max(1, Number(payload.limit || 10)))
		const res = await db.collection(POINT_ORDER_COLLECTION)
			.where({ user_id: payload.userId })
			.orderBy('created_at', 'desc')
			.limit(limit)
			.get()
		return { list: (res.data || []).map(normalizePointOrder) }
	},
	async levelRules() {
		const list = await ensureLevelRules()
		return { list }
	},
	async pointRules() {
		const list = await ensurePointRules()
		return { list }
	},
	async applyPointRule(payload = {}) {
		return applyPointRuleInternal(payload)
	},

	/* ===== 后台管理 ===== */
	async adminListProfiles(params = {}) {
		const { page, pageSize } = buildPagination(params)
		const filters = []
		const keyword = (params.keyword || '').trim()
		if (keyword) {
			const reg = new RegExp(keyword, 'i')
			filters.push(dbCmd.or([{ nickname: reg }, { mobile: reg }, { openid: reg }]))
		}
		if (params.level) {
			filters.push({ level: Number(params.level) })
		}
		const where = mergeFilters(filters)
		const collection = db.collection(USER_COLLECTION)
		const countRes = await collection.where(where).count()
		const res = await collection
			.where(where)
			.orderBy('created_at', 'desc')
			.skip((page - 1) * pageSize)
			.limit(pageSize)
			.get()
		const list = await Promise.all((res.data || []).map(async item => attachLevelInfo(normalizeProfile(item))))
		return {
			list,
			pagination: {
				page,
				pageSize,
				total: countRes.total || 0
			}
		}
	},
	async adminAdjustPoints(payload = {}) {
		if (!payload.userId) throw new Error('userId is required')
		const change = Number(payload.change || 0)
		if (!change) throw new Error('change is required')
		const balance = await changePoints(payload.userId, change, 'manual_adjust', payload.remark || '后台调整')
		const profile = await attachLevelInfo(normalizeProfile(await getUserById(payload.userId)))
		return { balance, profile }
	},
	async adminPointLedger(payload = {}) {
		if (!payload.userId) throw new Error('userId is required')
		const { page, pageSize } = buildPagination(payload)
		const res = await db.collection(LEDGER_COLLECTION)
			.where({ user_id: payload.userId })
			.orderBy('created_at', 'desc')
			.skip((page - 1) * pageSize)
			.limit(pageSize)
			.get()
		return { list: res.data || [] }
	},
	async adminSaveLevelRules(payload = {}) {
		const rules = Array.isArray(payload.rules) ? payload.rules : []
		if (!rules.length) throw new Error('rules is required')
		await db.collection(LEVEL_COLLECTION).where({}).remove()
		const now = Date.now()
		await db.collection(LEVEL_COLLECTION).add(
			rules.map(rule => ({
				level: Number(rule.level),
				name: rule.name || `V${rule.level}`,
				require_points: Number(rule.require_points || 0),
				benefits: rule.benefits || [],
				created_at: now,
				updated_at: now
			}))
		)
		resetLevelCache()
		return { success: true }
	},
	async adminSavePointRule(payload = {}) {
		const rule = payload.rule || {}
		if (!rule.event) throw new Error('event is required')
		const now = Date.now()
		const doc = {
			event: rule.event,
			name: rule.name || rule.event,
			calc_type: rule.calc_type || 'fixed',
			value: Number(rule.value || 0),
			ratio: Number(rule.ratio || 0),
			change_direction: rule.change_direction || 'increase',
			limit: Number(rule.limit || 0),
			limit_period: rule.limit_period || 'day',
			limit_tip: rule.limit_tip || '',
			description: rule.description || '',
			status: rule.status || 'active',
			max_points: Number(rule.max_points || 0),
			updated_at: now
		}
		if (rule._id) {
			await db.collection(POINT_RULE_COLLECTION).doc(rule._id).update(doc)
		} else {
			doc.created_at = now
			await db.collection(POINT_RULE_COLLECTION).add(doc)
		}
		resetPointRuleCache()
		return { success: true }
	},
	async adminDeletePointRule(payload = {}) {
		if (!payload.id) throw new Error('id is required')
		await db.collection(POINT_RULE_COLLECTION).doc(payload.id).remove()
		resetPointRuleCache()
		return { success: true }
	},
	async adminListPointGoods(payload = {}) {
		await ensurePointGoods()
		const { page, pageSize } = buildPagination(payload)
		const where = {}
		if (payload.status) where.status = payload.status
		const collection = db.collection(GOODS_COLLECTION)
		const countRes = await collection.where(where).count()
		const res = await collection
			.where(where)
			.orderBy('created_at', 'desc')
			.skip((page - 1) * pageSize)
			.limit(pageSize)
			.get()
		return {
			list: res.data || [],
			pagination: {
				page,
				pageSize,
				total: countRes.total || 0
			}
		}
	},
	async adminSavePointGoods(payload = {}) {
		const now = Date.now()
		const data = {
			name: payload.name,
			cost_points: Number(payload.cost_points || 0),
			stock: Number(payload.stock || 0),
			cover: payload.cover || '',
			desc: payload.desc || '',
			status: payload.status || 'on',
			delivery_type: payload.delivery_type || 'self_pick',
			updated_at: now
		}
		if (!data.name) throw new Error('name is required')
		if (payload._id) {
			await db.collection(GOODS_COLLECTION).doc(payload._id).update(data)
		} else {
			data.created_at = now
			await db.collection(GOODS_COLLECTION).add(data)
		}
		return { success: true }
	},
	async adminDeletePointGoods(payload = {}) {
		if (!payload.id) throw new Error('id is required')
		await db.collection(GOODS_COLLECTION).doc(payload.id).remove()
		return { success: true }
	},
	async adminListPointOrders(payload = {}) {
		const { page, pageSize } = buildPagination(payload)
		const where = {}
		if (payload.status) where.status = payload.status
		const collection = db.collection(POINT_ORDER_COLLECTION)
		const countRes = await collection.where(where).count()
		const res = await collection
			.where(where)
			.orderBy('created_at', 'desc')
			.skip((page - 1) * pageSize)
			.limit(pageSize)
			.get()
		return {
			list: (res.data || []).map(normalizePointOrder),
			pagination: {
				page,
				pageSize,
				total: countRes.total || 0
			}
		}
	},
	async adminUpdatePointOrderStatus(payload = {}) {
		if (!payload.orderId) throw new Error('orderId is required')
		if (!payload.status) throw new Error('status is required')
		const update = {
			status: payload.status,
			remark: payload.remark || '',
			updated_at: Date.now()
		}
		if (payload.delivery_info) {
			update.delivery_info = payload.delivery_info
		}
		await db.collection(POINT_ORDER_COLLECTION).doc(payload.orderId).update(update)
		return { success: true }
	}
}
