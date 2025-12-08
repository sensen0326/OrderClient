import memberService from '@/common/services/member.js'

const hasUniCloud = typeof uniCloud !== 'undefined' && uniCloud && typeof uniCloud.importObject === 'function'
const STORAGE_KEY = 'messageCenterMock'

const getMessageObject = (() => {
	let instance = null
	return () => {
		if (!hasUniCloud) return null
		if (!instance) {
			instance = uniCloud.importObject('message', {
				customUI: true
			})
		}
		return instance
	}
})()

function getMockMessages() {
	if (typeof uni === 'undefined') return []
	const cache = uni.getStorageSync(STORAGE_KEY)
	if (cache && Array.isArray(cache)) return cache
	const now = Date.now()
	const mock = [{
		_id: `local_msg_${now}`,
		type: 'order',
		title: '订单已完成',
		content: '您的订单已完成，欢迎再次光临。',
		is_read: false,
		created_at: now
	}]
	uni.setStorageSync(STORAGE_KEY, mock)
	return mock
}

function saveMockMessages(list = []) {
	if (typeof uni === 'undefined') return
	uni.setStorageSync(STORAGE_KEY, list)
}

export async function listMessages() {
	const profile = memberService.getStoredProfile()
	if (!profile || !profile.userId) {
		throw new Error('请先登录')
	}
	const messageObj = getMessageObject()
	if (!messageObj) {
		return getMockMessages()
	}
	const res = await messageObj.list({
		userId: profile.userId
	})
	return (res && res.list) || []
}

export async function markRead(messageId) {
	const profile = memberService.getStoredProfile()
	if (!profile || !profile.userId) {
		throw new Error('请先登录')
	}
	const messageObj = getMessageObject()
	if (!messageObj) {
		const list = getMockMessages().map(item => ({
			...item,
			is_read: !messageId || item._id === messageId ? true : item.is_read
		}))
		saveMockMessages(list)
		return {
			success: true
		}
	}
	return messageObj.markRead({
		userId: profile.userId,
		messageId
	})
}

export default {
	listMessages,
	markRead
}
