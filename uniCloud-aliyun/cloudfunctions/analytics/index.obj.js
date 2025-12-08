'use strict'

const db = uniCloud.database()
const EVENT_COLLECTION = 'analytics_event'

module.exports = {
	async track(payload = {}) {
		const event = payload.event || 'unknown'
		const record = {
			event,
			user_id: payload.userId || '',
			data: payload.data || {},
			client_info: payload.clientInfo || {},
			created_at: Date.now()
		}
		await db.collection(EVENT_COLLECTION).add(record)
		return {
			success: true
		}
	},
	async list(params = {}) {
		const limit = Math.min(100, Math.max(1, Number(params.limit) || 20))
		const res = await db.collection(EVENT_COLLECTION)
			.orderBy('created_at', 'desc')
			.limit(limit)
			.get()
		return {
			list: res.data || []
		}
	}
}
