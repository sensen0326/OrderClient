'use strict'

const db = uniCloud.database()
const dbCmd = db.command
const CATEGORY_COLLECTION = 'dish_category'
const DISH_COLLECTION = 'dish'
const RECOMMEND_COLLECTION = 'dish_recommend_slot'
const ADMIN_TOKEN = process.env.DISH_ADMIN_TOKEN || 'local-dev-token'
const {
	categories: seedCategories,
	dishes: seedDishes
} = require('./seed-data.js')

let seedPromise = null

function escapeRegExp(str = '') {
	return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function normalizeSku(sku) {
	const price = Number(sku.price || 0)
	const originPrice = typeof sku.origin_price === 'number' ? sku.origin_price : price
	return {
		sku_id: sku.sku_id || `sku_${Date.now()}_${Math.random().toString(16).slice(2, 8)}`,
		name: sku.name || '默认规格',
		price,
		origin_price: originPrice,
		package_fee: Number(sku.package_fee || 0),
		stock: typeof sku.stock === 'number' ? sku.stock : 0,
		min_purchase: typeof sku.min_purchase === 'number' ? sku.min_purchase : 1,
		max_purchase: typeof sku.max_purchase === 'number' ? sku.max_purchase : 99
	}
}

function normalizeOptionGroup(group) {
	if (!group) return null
	return {
		group_id: group.group_id || `group_${Math.random().toString(32).slice(2, 8)}`,
		name: group.name || '自选项',
		type: group.type === 'multi' ? 'multi' : 'single',
		required: Boolean(group.required),
		options: Array.isArray(group.options) ? group.options.map(option => ({
			option_id: option.option_id || `opt_${Math.random().toString(32).slice(2, 8)}`,
			name: option.name || '选项',
			price: Number(option.price || 0)
		})) : []
	}
}

function normalizeDishPayload(payload = {}) {
	const skus = Array.isArray(payload.skus) && payload.skus.length ? payload.skus.map(normalizeSku) : [normalizeSku({})]
	const optionGroups = Array.isArray(payload.option_groups) ? payload.option_groups.map(normalizeOptionGroup).filter(Boolean) : []
	return {
		name: payload.name || '未命名菜品',
		category_id: payload.category_id || '',
		cover: payload.cover || '',
		gallery: payload.gallery || [],
		description: payload.description || '',
		tags: Array.isArray(payload.tags) ? payload.tags : [],
		recommend_weight: Number(payload.recommend_weight || 0),
		status: typeof payload.status === 'number' ? payload.status : 1,
		restaurant_scope: payload.restaurant_scope || 'default',
		skus,
		option_groups: optionGroups,
		keywords: Array.isArray(payload.keywords) ? payload.keywords : [],
		updated_at: Date.now()
	}
}

async function ensureSeedData() {
	if (seedPromise) {
		return seedPromise
	}
	seedPromise = (async () => {
		const categoryCount = await db.collection(CATEGORY_COLLECTION).count()
		if (categoryCount.total === 0) {
			await db.collection(CATEGORY_COLLECTION).add(seedCategories.map(item => ({
				...item,
				created_at: Date.now()
			})))
		}
		const dishCount = await db.collection(DISH_COLLECTION).count()
		if (dishCount.total === 0) {
			await db.collection(DISH_COLLECTION).add(seedDishes.map(item => ({
				...item,
				created_at: Date.now(),
				updated_at: Date.now()
			})))
		}
	})()
	return seedPromise
}

function assertAdmin(token) {
	if (!token || token !== ADMIN_TOKEN) {
		const error = new Error('无权调用该接口')
		error.errCode = 'NO_PERMISSION'
		throw error
	}
}

module.exports = {
	async listCategories(params = {}) {
		await ensureSeedData()
		const restaurantId = params.restaurantId || 'default'
		const res = await db.collection(CATEGORY_COLLECTION)
			.where({
				status: 1,
				restaurant_scope: dbCmd.in([restaurantId, 'ALL'])
			})
			.orderBy('sort', 'asc')
			.get()
		return res.data || []
	},
	async list(params = {}) {
		await ensureSeedData()
		const {
			restaurantId = 'default',
			categoryId = '',
			tag = '',
			page = 1,
			pageSize = 20,
			keyword = ''
		} = params
		const where = {
			status: 1,
			restaurant_scope: dbCmd.in([restaurantId, 'ALL'])
		}
		if (categoryId) {
			where.category_id = categoryId
		}
		if (tag) {
			where.tags = dbCmd.in([tag])
		}
		if (keyword) {
			where.name = new RegExp(escapeRegExp(keyword), 'i')
		}
		const collection = db.collection(DISH_COLLECTION)
		const [countRes, listRes] = await Promise.all([
			collection.where(where).count(),
			collection.where(where)
			.orderBy('recommend_weight', 'desc')
			.skip(Math.max(page - 1, 0) * pageSize)
			.limit(pageSize)
			.get()
		])
		return {
			list: listRes.data || [],
			total: countRes.total || 0
		}
	},
	async detail(params = {}) {
		await ensureSeedData()
		if (!params.id) {
			throw new Error('缺少菜品 id')
		}
		const res = await db.collection(DISH_COLLECTION).doc(params.id).get()
		if (!res.data || !res.data.length) {
			return null
		}
		return res.data[0]
	},
	async search(params = {}) {
		await ensureSeedData()
		const keyword = (params.keyword || '').trim()
		if (!keyword) {
			return {
				list: []
			}
		}
		const restaurantId = params.restaurantId || 'default'
		const res = await db.collection(DISH_COLLECTION)
			.where({
				restaurant_scope: dbCmd.in([restaurantId, 'ALL']),
				status: 1,
				name: new RegExp(escapeRegExp(keyword), 'i')
			})
			.limit(50)
			.get()
		return {
			list: res.data || []
		}
	},
	async listRecommend(params = {}) {
		await ensureSeedData()
		const restaurantId = params.restaurantId || 'default'
		const limit = params.limit || 6
		const res = await db.collection(DISH_COLLECTION)
			.where({
				restaurant_scope: dbCmd.in([restaurantId, 'ALL']),
				status: 1,
				recommend_weight: dbCmd.gt(0)
			})
			.orderBy('recommend_weight', 'desc')
			.limit(limit)
			.get()
		return res.data || []
	},
	async listRecommendSlots(params = {}) {
		await ensureSeedData()
		const {
			slotCode = '',
			restaurantId = 'default'
		} = params
		const where = {
			status: 1,
			restaurant_scope: dbCmd.in([restaurantId, 'ALL'])
		}
		if (slotCode) {
			where.slot_code = slotCode
		}
		const res = await db.collection(RECOMMEND_COLLECTION)
			.where(where)
			.orderBy('sort', 'asc')
			.get()
		return res.data || []
	},
	async adminUpsert(payload = {}) {
		assertAdmin(payload.adminToken)
		if (!payload.category_id) {
			throw new Error('category_id 必填')
		}
		const normalized = normalizeDishPayload(payload)
		const collection = db.collection(DISH_COLLECTION)
		if (payload._id) {
			await collection.doc(payload._id).update(normalized)
			return {
				id: payload._id
			}
		}
		const res = await collection.add({
			...normalized,
			created_at: Date.now()
		})
		return {
			id: (res && res.id) || ''
		}
	},
	async adminBatchStatus(payload = {}) {
		assertAdmin(payload.adminToken)
		const ids = Array.isArray(payload.ids) ? payload.ids : []
		if (!ids.length) {
			throw new Error('缺少待更新的菜品')
		}
		const status = typeof payload.status === 'number' ? payload.status : 1
		await db.collection(DISH_COLLECTION).where({
			_id: dbCmd.in(ids)
		}).update({
			status,
			updated_at: Date.now()
		})
		return {
			count: ids.length
		}
	}
}
