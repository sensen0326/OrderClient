'use strict'

const db = uniCloud.database()
const CART_COLLECTION = 'cart_sessions'

function normalizeItems(items = []) {
	if (!Array.isArray(items)) return []
	return items.map(item => ({
		key: item.key || `${item.dishId || ''}__${item.skuId || ''}__${Math.random().toString(16).slice(2, 6)}`,
		dishId: item.dishId || '',
		dishName: item.dishName || '',
		dishImg: item.dishImg || '',
		skuId: item.skuId || '',
		skuName: item.skuName || '',
		quantity: Number(item.quantity) || 0,
		price: Number(item.price) || 0,
		options: Array.isArray(item.options) ? item.options : [],
		optionsText: item.optionsText || '',
		desc: item.desc || ''
	}))
}

module.exports = {
	async sync(payload = {}) {
		const sessionId = payload.sessionId
		if (!sessionId) {
			throw new Error('sessionId is required')
		}
		const doc = {
			_id: sessionId,
			session_id: sessionId,
			restaurant_id: payload.restaurantId || 'default',
			channel: payload.channel || 'dine_in',
			table_no: payload.tableNo || '',
			remark: payload.remark || '',
			items: normalizeItems(payload.items),
			participants: Array.isArray(payload.participants) ? payload.participants : [],
			meta: payload.meta || {},
			updated_at: Date.now()
		}
		await db.collection(CART_COLLECTION).doc(sessionId).set(doc)
		return {
			success: true,
			updated_at: doc.updated_at
		}
	},
	async get(params = {}) {
		const sessionId = params.sessionId
		if (!sessionId) {
			throw new Error('sessionId is required')
		}
		const res = await db.collection(CART_COLLECTION).doc(sessionId).get()
		if (!res.data || !res.data.length) {
			return null
		}
		return res.data[0]
	},
	async clear(params = {}) {
		const sessionId = params.sessionId
		if (!sessionId) {
			throw new Error('sessionId is required')
		}
		await db.collection(CART_COLLECTION).doc(sessionId).remove()
		return {
			success: true
		}
	}
}
