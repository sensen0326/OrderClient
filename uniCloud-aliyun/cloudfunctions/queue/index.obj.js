'use strict'

const db = uniCloud.database()
const TICKET_COLLECTION = 'queue_ticket'

function buildTicketNo(prefix = 'Q') {
	const rand = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
	return `${prefix}${Date.now()}${rand}`
}

async function countWaiting() {
	const res = await db.collection(TICKET_COLLECTION).where({
		status: 'waiting'
	}).count()
	return res.total || 0
}

module.exports = {
	async stats() {
		const waiting = await countWaiting()
		const lastTicketRes = await db.collection(TICKET_COLLECTION)
			.where({
				status: 'waiting'
			})
			.orderBy('created_at', 'asc')
			.limit(1)
			.get()
		return {
			waiting,
			nextTicket: lastTicketRes.data && lastTicketRes.data.length ? lastTicketRes.data[0].ticket_no : ''
		}
	},
	async take(payload = {}) {
		const partySize = Number(payload.partySize || payload.people || 0)
		if (!partySize) {
			throw new Error('partySize is required')
		}
		const waiting = await countWaiting()
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
		const query = db.collection(TICKET_COLLECTION)
			.orderBy('created_at', 'asc')
			.limit(Math.min(Number(params.limit) || 50, 100))
		if (status) {
			query.where({
				status
			})
		}
		const res = await query.get()
		return {
			list: res.data || []
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
