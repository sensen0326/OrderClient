const hasUniCloud = typeof uniCloud !== 'undefined' && uniCloud && typeof uniCloud.importObject === 'function'
const hasUni = typeof uni !== 'undefined' && typeof uni.getStorageSync === 'function'

const STORAGE_KEY = 'localKitchenTickets'

const getKitchenObject = (() => {
	let instance = null
	return () => {
		if (!hasUniCloud) return null
		if (!instance) {
			instance = uniCloud.importObject('kitchen', {
				customUI: true
			})
		}
		return instance
	}
})()

function readLocalTickets() {
	if (!hasUni) return []
	try {
		return uni.getStorageSync(STORAGE_KEY) || []
	} catch (err) {
		console.warn('readLocalTickets failed', err)
		return []
	}
}

function writeLocalTickets(list) {
	if (!hasUni) return
	try {
		uni.setStorageSync(STORAGE_KEY, list)
	} catch (err) {
		console.warn('writeLocalTickets failed', err)
	}
}

function buildLocalTicket(payload = {}) {
	const now = Date.now()
	const items = Array.isArray(payload.itemsSnapshot) ? payload.itemsSnapshot.map(item => ({
		dish_id: item.dishId || '',
		name: item.name || item.dishName || '',
		sku_name: item.skuName || '',
		options_text: item.optionsText || '',
		quantity: Number(item.quantity || item.value || 0),
		status: 'waiting'
	})) : []
	return {
		_id: `local_${payload.orderNo || now}`,
		order_no: payload.orderNo,
		channel: payload.channel || 'dine_in',
		table_no: payload.tableInfo && payload.tableInfo.tableNo ? payload.tableInfo.tableNo : '',
		people_count: payload.peopleCount || 0,
		items,
		ticket_status: 'queued',
		notify_status: 'waiting',
		events: [{
			status: 'queued',
			note: '本地模拟：已推送后厨',
			operator: 'local',
			created_at: now
		}],
		created_at: now,
		updated_at: now
	}
}

function updateLocalTicketStatus(ticket, nextStatus, note) {
	const now = Date.now()
	const events = Array.isArray(ticket.events) ? ticket.events.slice() : []
	events.push({
		status: nextStatus,
		note: note || '',
		operator: 'local',
		created_at: now
	})
	return Object.assign({}, ticket, {
		ticket_status: nextStatus,
		events,
		updated_at: now
	})
}

const kitchenService = {
	async push(payload = {}) {
		const kitchenObj = getKitchenObject()
		if (!kitchenObj) {
			const ticket = buildLocalTicket(payload)
			const list = readLocalTickets()
			const existedIndex = list.findIndex(item => item.order_no === ticket.order_no)
			if (existedIndex > -1) {
				list[existedIndex] = ticket
			} else {
				list.unshift(ticket)
			}
			writeLocalTickets(list)
			return {
				ticketId: ticket._id,
				ticket,
				mock: true
			}
		}
		return kitchenObj.push(payload)
	},
	async listByOrder(orderNo) {
		if (!orderNo) {
			return {
				list: []
			}
		}
		const kitchenObj = getKitchenObject()
		if (!kitchenObj) {
			const list = readLocalTickets().filter(item => item.order_no === orderNo)
			return {
				list
			}
		}
		return kitchenObj.list({
			orderNo,
			pageSize: 1
		})
	},
	async updateStatus(params = {}) {
		const kitchenObj = getKitchenObject()
		if (!kitchenObj) {
			if (!params.orderNo && !params.ticketId) {
				throw new Error('ticketId or orderNo is required')
			}
			const list = readLocalTickets()
			const idx = list.findIndex(item => (params.ticketId && item._id === params.ticketId) || (params.orderNo && item.order_no === params.orderNo))
			if (idx === -1) {
				throw new Error('ticket not found')
			}
			const updated = updateLocalTicketStatus(list[idx], params.nextStatus || params.status || 'preparing', params.note)
			list[idx] = updated
			writeLocalTickets(list)
			return {
				success: true,
				ticket: updated
			}
		}
		return kitchenObj.updateStatus(params)
	}
}

export default kitchenService
