'use strict'

const db = uniCloud.database()
const TICKET_COLLECTION = 'support_ticket'
const MESSAGE_COLLECTION = 'support_message'

function getUserId(payload = {}) {
	return payload.userId || payload.user_id || (payload.profile && payload.profile.userId) || ''
}

function normalizeTicket(payload = {}) {
	return {
		order_no: payload.orderNo || payload.order_no || '',
		category: payload.category || 'other',
		description: (payload.description || '').trim(),
		contact: payload.contact || '',
		attachments: Array.isArray(payload.attachments) ? payload.attachments : [],
		channel: payload.channel || 'mini_program'
	}
}

module.exports = {
	async create(payload = {}) {
		const userId = getUserId(payload)
		if (!userId) {
			throw new Error('请先登录')
		}
		const normalized = normalizeTicket(payload)
		if (!normalized.description) {
			throw new Error('请填写问题描述')
		}
		const now = Date.now()
		const ticketNo = payload.ticketNo || `TK${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`
		const doc = {
			_id: ticketNo,
			ticket_no: ticketNo,
			user_id: userId,
			order_no: normalized.order_no,
			category: normalized.category,
			description: normalized.description,
			contact: normalized.contact,
			attachments: normalized.attachments,
			status: 'pending',
			priority: payload.priority || 'normal',
			channel: normalized.channel,
			created_at: now,
			updated_at: now
		}
		await db.collection(TICKET_COLLECTION).add(doc)
		if (normalized.description) {
			await db.collection(MESSAGE_COLLECTION).add({
				ticket_no: ticketNo,
				sender_type: 'user',
				content: normalized.description,
				attachments: normalized.attachments,
				created_at: now
			})
		}
		return {
			ticket: doc
		}
	},
	async list(payload = {}) {
		const userId = getUserId(payload)
		if (!userId) {
			throw new Error('请先登录')
		}
		const status = payload.status
		const where = {
			user_id: userId
		}
		if (status) {
			where.status = status
		}
		const res = await db.collection(TICKET_COLLECTION)
			.where(where)
			.orderBy('updated_at', 'desc')
			.limit(50)
			.get()
		return {
			list: res.data || []
		}
	},
	async detail(payload = {}) {
		const ticketNo = payload.ticketNo || payload.ticket_no
		if (!ticketNo) {
			throw new Error('ticketNo is required')
		}
		const ticketRes = await db.collection(TICKET_COLLECTION).doc(ticketNo).get()
		if (!ticketRes.data || !ticketRes.data.length) {
			throw new Error('ticket not found')
		}
		const msgRes = await db.collection(MESSAGE_COLLECTION)
			.where({
				ticket_no: ticketNo
			})
			.orderBy('created_at', 'asc')
			.get()
		return {
			ticket: ticketRes.data[0],
			messages: msgRes.data || []
		}
	},
	async reply(payload = {}) {
		const ticketNo = payload.ticketNo || payload.ticket_no
		if (!ticketNo) {
			throw new Error('ticketNo is required')
		}
		const content = (payload.content || '').trim()
		if (!content) {
			throw new Error('content is required')
		}
		const sender = payload.senderType || payload.sender_type || 'user'
		const now = Date.now()
		await db.collection(MESSAGE_COLLECTION).add({
			ticket_no: ticketNo,
			sender_type: sender,
			content,
			attachments: payload.attachments || [],
			created_at: now
		})
		await db.collection(TICKET_COLLECTION).doc(ticketNo).update({
			status: sender === 'user' ? 'pending' : 'replied',
			updated_at: now
		})
		return {
			success: true
		}
	},
	async updateStatus(payload = {}) {
		const ticketNo = payload.ticketNo || payload.ticket_no
		if (!ticketNo) {
			throw new Error('ticketNo is required')
		}
		const status = payload.status || 'resolved'
		await db.collection(TICKET_COLLECTION).doc(ticketNo).update({
			status,
			updated_at: Date.now()
		})
		return {
			success: true,
			status
		}
	}
}
