import memberService from '@/common/services/member.js'

const hasUniCloud = typeof uniCloud !== 'undefined' && uniCloud && typeof uniCloud.importObject === 'function'
const STORAGE_KEY = 'supportTicketsMock'

const getSupportObject = (() => {
	let instance = null
	return () => {
		if (!hasUniCloud) return null
		if (!instance) {
			instance = uniCloud.importObject('support', {
				customUI: true
			})
		}
		return instance
	}
})()

function getMockTickets() {
	if (typeof uni === 'undefined') return []
	const cache = uni.getStorageSync(STORAGE_KEY)
	if (cache && Array.isArray(cache)) {
		return cache
	}
	const mock = []
	uni.setStorageSync(STORAGE_KEY, mock)
	return mock
}

function saveMockTickets(list) {
	if (typeof uni === 'undefined') return
	uni.setStorageSync(STORAGE_KEY, list)
}

export async function listTickets() {
	const profile = memberService.getStoredProfile()
	if (!profile || !profile.userId) {
		throw new Error('请先登录')
	}
	const supportObj = getSupportObject()
	if (!supportObj) {
		return getMockTickets()
	}
	const res = await supportObj.list({
		userId: profile.userId
	})
	return (res && res.list) || []
}

export async function createTicket(payload = {}) {
	const profile = memberService.getStoredProfile()
	if (!profile || !profile.userId) {
		throw new Error('请先登录')
	}
	const supportObj = getSupportObject()
	if (!supportObj) {
		const list = getMockTickets()
		const now = Date.now()
		const doc = {
			_id: `local_${now}`,
			ticket_no: `TK${now}`,
			user_id: profile.userId,
			category: payload.category || 'other',
			description: payload.description || '',
			status: 'pending',
			created_at: now,
			updated_at: now
		}
		list.unshift(doc)
		saveMockTickets(list)
		return {
			ticket: doc,
			mock: true
		}
	}
	return supportObj.create({
		...payload,
		userId: profile.userId
	})
}

export async function ticketDetail(ticketNo) {
	const supportObj = getSupportObject()
	if (!supportObj) {
		return getMockTickets().find(item => item.ticket_no === ticketNo)
	}
	const res = await supportObj.detail({
		ticketNo
	})
	return res
}

export default {
	listTickets,
	createTicket,
	ticketDetail
}
