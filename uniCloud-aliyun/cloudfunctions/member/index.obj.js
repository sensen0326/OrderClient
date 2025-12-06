'use strict'

const db = uniCloud.database()
const dbCmd = db.command

const USER_COLLECTION = 'user_profile'
const LEDGER_COLLECTION = 'point_ledger'
const LEVEL_COLLECTION = 'member_level_rule'
const GOODS_COLLECTION = 'point_goods'

const DEFAULT_LEVELS = [
	{ level: 1, name: 'V1', require_points: 0, benefits: ['生日礼', '基础积分'] },
	{ level: 2, name: 'V2', require_points: 200, benefits: ['95 折', '优先排队'] },
	{ level: 3, name: 'V3', require_points: 600, benefits: ['免配送费', '专属客服'] }
]

const DEFAULT_GOODS = [
	{ name: '精品茶歇券', cost_points: 300, stock: 99, cover: 'https://mp-a83aee34-7c6d-40e3-a241-85ab45b7ff6e.cdn.bspapp.com/cloudstorage/static/points/goods-tea.jpg', desc: '堂食茶歇一份', status: 'on' },
	{ name: '20 元抵扣券', cost_points: 500, stock: 50, cover: 'https://mp-a83aee34-7c6d-40e3-a241-85ab45b7ff6e.cdn.bspapp.com/cloudstorage/static/points/goods-coupon.jpg', desc: '全场通用抵扣', status: 'on' }
]

let levelCache = null

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


module.exports = {
	async login(payload = {}) {
		await ensureLevelRules()
		const nickname = payload.nickname || '微信顾客'
		const openid = payload.openid || payload.unionid || payload.mobile || `guest_${nickname}_${Date.now()}`
		let profileRes = await db.collection(USER_COLLECTION).where({
			openid
		}).limit(1).get()
		let profile
		const now = Date.now()
		let isNew = false
		if (!profileRes.data || !profileRes.data.length) {
			const doc = {
				openid,
				nickname,
				avatar: payload.avatar || '',
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
			const updateData = {
				last_login_at: now,
				updated_at: now
			}
			if (!profile.nickname && nickname) {
				updateData.nickname = nickname
				profile.nickname = nickname
			}
			if (!profile.avatar && payload.avatar) {
				updateData.avatar = payload.avatar
				profile.avatar = payload.avatar
			}
			await db.collection(USER_COLLECTION).doc(profile._id).update(updateData)
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
		const start = new Date()
		start.setHours(0, 0, 0, 0)
		const existing = await db.collection(LEDGER_COLLECTION)
			.where({
				user_id: payload.userId,
				event: 'daily_sign',
				created_at: dbCmd.gte(start.getTime())
			})
			.limit(1)
			.get()
		if (existing.data && existing.data.length) {
			throw new Error('今日已签到')
		}
		const balance = await changePoints(payload.userId, Number(payload.reward || 10), 'daily_sign', '每日签到')
		const user = await getUserById(payload.userId)
		user.points = balance
		return {
			points: balance,
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
		const updatedUser = await getUserById(payload.userId)
		return {
			success: true,
			points: updatedUser.points,
			profile: await attachLevelInfo(normalizeProfile(updatedUser))
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
	}
}
