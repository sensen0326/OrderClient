'use strict'

const db = uniCloud.database()
const CART_COLLECTION = 'cart_sessions'

function ensureString(val) {
	if (typeof val === 'string') return val
	if (val === undefined || val === null) return ''
	return String(val)
}

function buildItemKey(item = {}) {
	if (item.key) return item.key
	const dish = ensureString(item.dishId || item.dish_id)
	const sku = ensureString(item.skuId || item.sku_id)
	const options = ensureString(item.optionsText || item.options_text)
	return `${dish}_${sku}_${options || 'default'}`
}

function normalizeItems(items = []) {
	if (!Array.isArray(items)) return []
	return items.map(item => {
		const quantity = Number(item.quantity) || 0
		return {
			key: buildItemKey(item),
			dishId: ensureString(item.dishId || item.dish_id),
			dishName: ensureString(item.dishName || item.dish_name || item.name),
			dishImg: ensureString(item.dishImg || item.dish_img || item.cover),
			skuId: ensureString(item.skuId || item.sku_id),
			skuName: ensureString(item.skuName || item.sku_name),
			quantity,
			price: Number(item.price) || 0,
			packageFee: Number(item.packageFee || item.package_fee || 0),
			options: Array.isArray(item.options) ? item.options : [],
			optionsText: ensureString(item.optionsText || item.options_text),
			desc: ensureString(item.desc || item.remark || '')
		}
	}).filter(item => item.quantity > 0)
}

function mergeCartItems(existing = [], incoming = [], strategy = 'replace') {
	if (strategy === 'replace') {
		return incoming
	}
	const map = new Map()
	for (const item of existing) {
		const key = buildItemKey(item)
		map.set(key, Object.assign({}, item))
	}
	for (const item of incoming) {
		const key = buildItemKey(item)
		const current = map.get(key)
		if (current) {
			if (strategy === 'merge') {
				current.quantity = Math.max(0, current.quantity + item.quantity)
			} else if (strategy === 'upsert') {
				current.quantity = item.quantity
			}
			current.price = item.price || current.price
			current.packageFee = item.packageFee || current.packageFee
			current.options = item.options && item.options.length ? item.options : current.options
			current.optionsText = item.optionsText || current.optionsText
			current.desc = item.desc || current.desc
		} else {
			map.set(key, Object.assign({}, item))
		}
	}
	return Array.from(map.values()).filter(item => item.quantity > 0)
}

function normalizeParticipant(participant = {}) {
	const normalized = {
		user_id: ensureString(participant.user_id || participant.userId),
		client_id: ensureString(participant.client_id || participant.clientId),
		nickname: ensureString(participant.nickname || participant.name || ''),
		avatar: ensureString(participant.avatar || participant.avatarUrl || ''),
		role: ensureString(participant.role || 'guest')
	}
	if (!normalized.user_id && !normalized.client_id) {
		return null
	}
	return normalized
}

async function getCart(sessionId) {
	const res = await db.collection(CART_COLLECTION).doc(sessionId).get()
	return res.data && res.data.length ? res.data[0] : null
}

async function ensureCart(sessionId, base = {}) {
	let cart = await getCart(sessionId)
	if (cart) return cart
	const now = Date.now()
	cart = {
		_id: sessionId,
		session_id: sessionId,
		restaurant_id: base.restaurantId || base.restaurant_id || 'default',
		channel: base.channel || 'dine_in',
		table_no: base.tableNo || base.table_no || '',
		remark: base.remark || '',
		items: [],
		participants: [],
		meta: base.meta || {},
		created_at: now,
		updated_at: now
	}
	await db.collection(CART_COLLECTION).doc(sessionId).set(cart)
	return cart
}

async function updateParticipants(sessionId, updater) {
	const cart = await ensureCart(sessionId)
	const list = Array.isArray(cart.participants) ? cart.participants : []
	const next = updater(list)
	await db.collection(CART_COLLECTION).doc(sessionId).update({
		participants: next,
		updated_at: Date.now()
	})
	return next
}

module.exports = {
	async sync(payload = {}) {
		const sessionId = payload.sessionId
		if (!sessionId) {
			throw new Error('sessionId is required')
		}
		const existing = await getCart(sessionId)
		const normalized = normalizeItems(payload.items)
		const mergeStrategy = payload.mergeStrategy || 'replace'
		const mergedItems = existing ? mergeCartItems(existing.items || [], normalized, mergeStrategy) : normalized
		const now = Date.now()
		const participants = Array.isArray(payload.participants)
			? payload.participants.map(normalizeParticipant).filter(Boolean)
			: (existing && existing.participants) || []
		const doc = {
			_id: sessionId,
			session_id: sessionId,
			restaurant_id: payload.restaurantId || (existing && existing.restaurant_id) || 'default',
			channel: payload.channel || (existing && existing.channel) || 'dine_in',
			table_no: payload.tableNo || (existing && existing.table_no) || '',
			remark: payload.remark !== undefined ? payload.remark : (existing && existing.remark) || '',
			items: mergedItems,
			participants,
			meta: Object.assign({}, existing && existing.meta, payload.meta || {}),
			updated_at: now,
			created_at: (existing && existing.created_at) || now
		}
		await db.collection(CART_COLLECTION).doc(sessionId).set(doc)
		return {
			success: true,
			updated_at: now,
			items: mergedItems,
			participants
		}
	},
	async join(payload = {}) {
		const sessionId = payload.sessionId
		if (!sessionId) throw new Error('sessionId is required')
		const participantInfo = normalizeParticipant(payload.participant || {
			user_id: payload.userId,
			client_id: payload.clientId,
			nickname: payload.nickname,
			avatar: payload.avatar,
			role: payload.role
		})
		if (!participantInfo) {
			throw new Error('participant userId or clientId is required')
		}
		const now = Date.now()
		const participants = await updateParticipants(sessionId, (list = []) => {
			const targetKey = participantInfo.user_id || `client_${participantInfo.client_id}`
			let matched = false
			const next = list.map(item => {
				const key = item.user_id || `client_${item.client_id}`
				if (key === targetKey) {
					matched = true
					return Object.assign({}, item, participantInfo, {
						last_active_at: now
					})
				}
				return item
			})
			if (!matched) {
				next.push(Object.assign({}, participantInfo, {
					joined_at: now,
					last_active_at: now
				}))
			}
			return next
		})
		return {
			sessionId,
			participants
		}
	},
	async leave(payload = {}) {
		const sessionId = payload.sessionId
		if (!sessionId) throw new Error('sessionId is required')
		const participants = await updateParticipants(sessionId, (list = []) => {
			if (!list.length) return list
			const userId = payload.userId
			const clientId = payload.clientId
			return list.filter(item => {
				if (userId && item.user_id === userId) return false
				if (clientId && item.client_id === clientId) return false
				return true
			})
		})
		return {
			sessionId,
			participants
		}
	},
	async heartbeat(payload = {}) {
		const sessionId = payload.sessionId
		if (!sessionId) throw new Error('sessionId is required')
		const updates = {
			updated_at: Date.now()
		}
		if (payload.remark !== undefined) {
			updates.remark = payload.remark
		}
		await db.collection(CART_COLLECTION).doc(sessionId).update(updates)
		return {
			success: true
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
