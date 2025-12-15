'use strict'

const db = uniCloud.database()
const dbCmd = db.command
const TICKET_COLLECTION = 'queue_ticket'

function buildTicketNo(prefix = 'Q') {
	const rand = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
	return `${prefix}${Date.now()}${rand}`
}

async function countStatus(status) {
	const res = await db.collection(TICKET_COLLECTION).where({
		status
	}).count()
	return res.total || 0
}

module.exports = {
	async stats() {
		const [waiting, called, seated, reserved, cancelled] = await Promise.all([
			countStatus('waiting'),
			countStatus('called'),
			countStatus('seated'),
			countStatus('reserved'),
			countStatus('cancelled')
		])
		const lastTicketRes = await db.collection(TICKET_COLLECTION)
			.where({
				status: 'waiting'
			})
			.orderBy('created_at', 'asc')
			.limit(1)
			.get()
		return {
			waiting,
			nextTicket: lastTicketRes.data && lastTicketRes.data.length ? lastTicketRes.data[0].ticket_no : '',
			called,
			seated,
			reserved,
			cancelled,
			total: waiting + called + seated + reserved + cancelled
		}
	},
	async take(payload = {}) {
		const partySize = Number(payload.partySize || payload.people || 0)
		if (!partySize) {
			throw new Error('partySize is required')
		}
		const waiting = await countStatus('waiting')
		const now = Date.now()
		const ticketNo = payload.ticketNo || buildTicketNo()
		const doc = {
			ticket_no: ticketNo,
			party_size: partySize,
			status: 'waiting',
			contact: payload.contact || '',
			notify_channel: payload.notifyChannel || 'wechat',
			estimated_wait: waiting * 3,
			note: payload.note || '',
			created_at: now,
			updated_at: now
		}
		await db.collection(TICKET_COLLECTION).add(doc)
		return {
			ticketNo,
			position: waiting + 1,
			estimatedWait: doc.estimated_wait
		}
	},
	async list(params = {}) {
		const status = params.status
		const page = Math.max(1, Number(params.page) || 1)
		const pageSize = Math.min(100, Math.max(1, Number(params.pageSize) || 20))
		const where = {}
		if (status) {
			where.status = status
		}
		const keyword = (params.keyword || '').trim()
		if (keyword) {
			where.ticket_no = dbCmd.regex({
				regex: keyword,
				options: 'i'
			})
		}
		const query = db.collection(TICKET_COLLECTION)
			.where(where)
			.orderBy('created_at', status === 'waiting' ? 'asc' : 'desc')
			.skip((page - 1) * pageSize)
			.limit(pageSize)
		const res = await query.get()
		return {
			list: res.data || [],
			pagination: {
				page,
				pageSize,
				hasMore: (res.data || []).length === pageSize
			}
		}
	},
	async call(params = {}) {
		const ticketNo = params.ticketNo
		if (!ticketNo) {
			throw new Error('ticketNo is required')
		}
		const now = Date.now()
		await db.collection(TICKET_COLLECTION).where({
			ticket_no: ticketNo
		}).update({
			status: 'called',
			updated_at: now
		})
		return {
			success: true
		}
	},
	async cancel(params = {}) {
		const ticketNo = params.ticketNo
		if (!ticketNo) {
			throw new Error('ticketNo is required')
		}
		const now = Date.now()
		await db.collection(TICKET_COLLECTION).where({
			ticket_no: ticketNo
		}).update({
			status: 'cancelled',
			updated_at: now
		})
		return {
			success: true
		}
	},
	async updateStatus(params = {}) {
		const ticketNo = params.ticketNo
		const status = params.status
		if (!ticketNo || !status) {
			throw new Error('ticketNo and status are required')
		}
		const allow = ['waiting', 'called', 'seated', 'cancelled', 'reserved']
		if (!allow.includes(status)) {
			throw new Error('invalid status')
		}
		const now = Date.now()
		await db.collection(TICKET_COLLECTION).where({
			ticket_no: ticketNo
		}).update({
			status,
			updated_at: now
		})
		return {
			success: true
		}
	},
	async reserve(payload = {}) {
		const partySize = Number(payload.partySize || 0)
		if (!partySize) {
			throw new Error('partySize is required')
		}
		if (!payload.arriveTime) {
			throw new Error('arriveTime is required')
		}
		const ticketNo = payload.ticketNo || buildTicketNo('R')
		const now = Date.now()
		await db.collection(TICKET_COLLECTION).add({
			ticket_no: ticketNo,
			party_size: partySize,
			status: 'reserved',
			arrive_time: payload.arriveTime,
			contact: payload.contact || '',
			note: payload.note || '',
			created_at: now,
			updated_at: now
		})
		return {
			ticketNo
		}
	}
}
