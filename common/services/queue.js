const hasUniCloud = typeof uniCloud !== 'undefined' && uniCloud && typeof uniCloud.importObject === 'function'
const hasUni = typeof uni !== 'undefined' && typeof uni.getStorageSync === 'function'

const STORAGE_KEY = 'queueTickets'

const getQueueObject = (() => {
	let instance = null
	return () => {
		if (!hasUniCloud) return null
		if (!instance) {
			instance = uniCloud.importObject('queue', {
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
		console.warn('readLocalQueue failed', err)
		return []
	}
}

function writeLocalTickets(list) {
	if (!hasUni) return
	try {
		uni.setStorageSync(STORAGE_KEY, list)
	} catch (err) {
		console.warn('writeLocalQueue failed', err)
	}
}

function buildLocalTicket(payload = {}) {
	const now = Date.now()
	return {
		ticket_no: `LQ${now}`,
		party_size: payload.partySize || 2,
		status: payload.status || 'waiting',
		estimated_wait: 5,
		created_at: now
	}
}

const queueService = {
	async stats() {
		const queueObj = getQueueObject()
		if (!queueObj) {
			const list = readLocalTickets().filter(item => item.status === 'waiting')
			return {
				waiting: list.length,
				nextTicket: list.length ? list[0].ticket_no : ''
			}
		}
		return queueObj.stats()
	},
	async take(payload = {}) {
		const queueObj = getQueueObject()
		if (!queueObj) {
			const tickets = readLocalTickets()
			const ticket = buildLocalTicket(payload)
			tickets.push(ticket)
			writeLocalTickets(tickets)
			return {
				ticketNo: ticket.ticket_no,
				position: tickets.length,
				estimatedWait: ticket.estimated_wait,
				mock: true
			}
		}
		return queueObj.take(payload)
	},
	async reserve(payload = {}) {
		const queueObj = getQueueObject()
		if (!queueObj) {
			return {
				ticketNo: `LR${Date.now()}`,
				mock: true
			}
		}
		return queueObj.reserve(payload)
	}
}

export default queueService
