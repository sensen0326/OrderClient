'use strict'

const db = uniCloud.database()

const ORDER_COLLECTION = 'order'
const ORDER_ITEM_COLLECTION = 'order_item'
const ORDER_STATUS_LOG_COLLECTION = 'order_status_log'
const TICKET_COLLECTION = 'kitchen_ticket'

const STATUS_FLOW = {
	pending: ['paid', 'cancelled'],
	paid: ['preparing', 'cancelled'],
	preparing: ['delivering', 'completed', 'cancelled'],
	delivering: ['completed', 'cancelled'],
	completed: [],
	cancelled: []
}

const TICKET_STATUS = new Set(['queued', 'preparing', 'ready', 'delivering', 'completed', 'cancelled'])

function buildTicketItems(source = []) {
	if (!Array.isArray(source)) return []
	return source.map(item => ({
		dish_id: item.dish_id || item.dishId || '',
		name: item.dish_name || item.dishName || item.name || '',
		sku_name: item.sku_name || item.skuName || '',
		options_text: item.options_text || item.optionsText || '',
		quantity: Number(item.quantity || item.value || 0),
		status: 'waiting'
	})).filter(item => item.dish_id || item.name)
}

async function loadOrder(orderNo) {
	if (!orderNo) return null
	const res = await db.collection(ORDER_COLLECTION).doc(orderNo).get()
	if (!res.data || !res.data.length) {
		return null
	}
	return res.data[0]
}

async function loadOrderItems(orderNo) {
	const res = await db.collection(ORDER_ITEM_COLLECTION).where({
		order_no: orderNo
	}).get()
	return res.data || []
}

async function addStatusLog(orderNo, status, operator = 'system', note = '') {
	const now = Date.now()
	await db.collection(ORDER_STATUS_LOG_COLLECTION).add({
		order_no: orderNo,
		status,
		note,
		operator,
		created_at: now
	})
}

async function ensureOrderStatus(order, nextStatus, operator, note) {
	if (!order || !nextStatus) return false
	const allowed = STATUS_FLOW[order.order_status] || []
	if (!allowed.includes(nextStatus)) {
		return false
	}
	const now = Date.now()
	const updates = {
		order_status: nextStatus,
		updated_at: now
	}
	if (nextStatus === 'preparing') {
		updates.fulfill_status = 'preparing'
	}
	if (nextStatus === 'delivering') {
		updates.fulfill_status = 'delivering'
	}
	if (nextStatus === 'completed') {
		updates.fulfill_status = 'completed'
	}
	await db.collection(ORDER_COLLECTION).doc(order._id || order.order_no).update(updates)
	await addStatusLog(order.order_no || order._id, nextStatus, operator, note)
	order.order_status = nextStatus
	order.updated_at = now
	if (updates.fulfill_status) {
		order.fulfill_status = updates.fulfill_status
	}
	return true
}

async function ensureTicket(orderNo) {
	const res = await db.collection(TICKET_COLLECTION).where({
		order_no: orderNo
	}).limit(1).get()
	if (!res.data || !res.data.length) {
		return null
	}
	return res.data[0]
}

module.exports = {
	async push(payload = {}) {
		const orderNo = payload.orderNo
		if (!orderNo) {
			throw new Error('orderNo is required')
		}
		const existed = await ensureTicket(orderNo)
		if (existed) {
			return {
				duplicated: true,
				ticketId: existed._id,
				ticket: existed
			}
		}
		const order = await loadOrder(orderNo)
		if (!order) {
			throw new Error('order not found')
		}
		let items = Array.isArray(payload.itemsSnapshot) ? payload.itemsSnapshot : null
		if (!items || !items.length) {
			const orderItems = await loadOrderItems(orderNo)
			items = buildTicketItems(orderItems.length ? orderItems : (order.items_snapshot || []))
		} else {
			items = buildTicketItems(items)
		}
		const now = Date.now()
		const doc = {
			order_no: orderNo,
			session_id: order.session_id || '',
			station_id: payload.stationId || (order.channel === 'takeout' ? 'takeout_station' : 'dining_station'),
			channel: order.channel || 'dine_in',
			table_no: order.table_no || '',
			address: order.address || null,
			people_count: Number(order.people_count || payload.peopleCount || 0),
			items,
			priority: Number(payload.priority || 0),
			urgent: Boolean(payload.urgent),
			ticket_status: 'queued',
			notify_status: 'waiting',
			note: payload.note || order.remark || '',
			events: [{
				status: 'queued',
				note: '订单推送至后厨',
				operator: payload.operator || 'system',
				created_at: now
			}],
			created_at: now,
			updated_at: now
		}
		const addRes = await db.collection(TICKET_COLLECTION).add(doc)

		// 可选：标记付款成功
		if (payload.markPaid && order.pay_status !== 'paid') {
			await db.collection(ORDER_COLLECTION).doc(order._id || order.order_no).update({
				pay_status: 'paid',
				order_status: order.order_status === 'pending' ? 'paid' : order.order_status,
				updated_at: Date.now()
			})
			order.pay_status = 'paid'
			if (order.order_status === 'pending') {
				order.order_status = 'paid'
				await addStatusLog(orderNo, 'paid', payload.operator || 'system', '自动确认支付')
			}
		}

		if (payload.autoPrepare !== false) {
			await ensureOrderStatus(order, 'preparing', payload.operator || 'system', '后厨接单，开始备餐')
		}

		return {
			ticketId: addRes.id || addRes._id,
			ticket: Object.assign({}, doc, {
				_id: addRes.id || addRes._id
			})
		}
	},
	async list(params = {}) {
		const where = {}
		if (params.orderNo) {
			where.order_no = params.orderNo
		}
		if (params.ticketStatus) {
			where.ticket_status = params.ticketStatus
		}
		if (params.stationId) {
			where.station_id = params.stationId
		}
		const page = Math.max(1, Number(params.page) || 1)
		const pageSize = Math.min(100, Math.max(1, Number(params.pageSize) || 20))
		const cursor = db.collection(TICKET_COLLECTION)
			.where(where)
			.orderBy('created_at', 'desc')
			.skip((page - 1) * pageSize)
			.limit(pageSize)
		const res = await cursor.get()
		return {
			list: res.data || [],
			hasMore: (res.data || []).length === pageSize
		}
	},
	async updateStatus(params = {}) {
		const ticketId = params.ticketId
		const orderNo = params.orderNo
		const nextStatus = params.nextStatus || params.status
		const operator = params.operator || 'system'
		if (!ticketId && !orderNo) {
			throw new Error('ticketId or orderNo is required')
		}
		if (!nextStatus) {
			throw new Error('nextStatus is required')
		}
		if (!TICKET_STATUS.has(nextStatus)) {
			throw new Error('invalid status')
		}
		let where
		if (ticketId) {
			where = { _id: ticketId }
		} else {
			where = { order_no: orderNo }
		}
		const res = await db.collection(TICKET_COLLECTION).where(where).limit(1).get()
		if (!res.data || !res.data.length) {
			throw new Error('ticket not found')
		}
		const ticket = res.data[0]
		const now = Date.now()
		const events = Array.isArray(ticket.events) ? ticket.events.slice() : []
		events.push({
			status: nextStatus,
			note: params.note || '',
			operator,
			created_at: now
		})
		await db.collection(TICKET_COLLECTION).doc(ticket._id).update({
			ticket_status: nextStatus,
			events,
			updated_at: now
		})

		// 同步订单状态
		const order = await loadOrder(ticket.order_no)
		if (order) {
			let mappedStatus = null
			if (nextStatus === 'preparing') {
				mappedStatus = 'preparing'
			} else if (nextStatus === 'ready') {
				mappedStatus = order.channel === 'takeout' ? 'delivering' : 'completed'
			} else if (nextStatus === 'delivering') {
				mappedStatus = 'delivering'
			} else if (nextStatus === 'completed') {
				mappedStatus = 'completed'
			}
			if (mappedStatus) {
				await ensureOrderStatus(order, mappedStatus, operator, params.note || `厨房状态：${nextStatus}`)
			}
		}

		return {
			success: true,
			ticketId: ticket._id,
			status: nextStatus
		}
	}
}
