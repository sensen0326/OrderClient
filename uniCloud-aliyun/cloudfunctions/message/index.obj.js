'use strict'

const db = uniCloud.database()
const MESSAGE_COLLECTION = 'message_center'
const SUBSCRIBE_COLLECTION = 'message_subscription'

function getUserId(payload = {}) {
	return payload.userId || payload.user_id || (payload.profile && payload.profile.userId) || ''
}

module.exports = {
	async list(payload = {}) {
		const userId = getUserId(payload)
		if (!userId) {
			throw new Error('请先登录')
		}
		const res = await db.collection(MESSAGE_COLLECTION)
			.where({
				user_id: userId
			})
			.orderBy('created_at', 'desc')
			.limit(50)
			.get()
		return {
			list: res.data || []
		}
	},
	async markRead(payload = {}) {
		const userId = getUserId(payload)
		if (!userId) {
			throw new Error('请先登录')
		}
		const messageId = payload.messageId || payload._id
		if (messageId) {
			await db.collection(MESSAGE_COLLECTION).doc(messageId).update({
				is_read: true,
				read_at: Date.now()
			})
		} else {
			await db.collection(MESSAGE_COLLECTION)
				.where({
					user_id: userId,
					is_read: db.command.neq(true)
				})
				.update({
					is_read: true,
					read_at: Date.now()
				})
		}
		return {
			success: true
		}
	},
	async seed(payload = {}) {
		const userId = getUserId(payload)
		if (!userId) {
			throw new Error('userId required')
		}
		const now = Date.now()
		const messages = [
			{
				user_id: userId,
				type: 'order',
				title: '订单状态更新',
				content: '您的订单已进入备餐，请耐心等待~',
				link: payload.orderNo || '',
				is_read: false,
				created_at: now
			},
			{
				user_id: userId,
				type: 'promotion',
				title: '积分提醒',
				content: '今日签到积分已到账，别忘了去积分商城逛逛',
				is_read: false,
				created_at: now - 3600000
			}
		]
		for (const msg of messages) {
			await db.collection(MESSAGE_COLLECTION).add(msg)
		}
		return {
			success: true
		}
	},
	async subscribe(payload = {}) {
		const userId = getUserId(payload)
		if (!userId) {
			throw new Error('请先登录')
		}
		const templateId = payload.templateId || payload.template_id
		const doc = {
			user_id: userId,
			template_id: templateId,
			channels: payload.channels || ['mp'],
			status: 'active',
			updated_at: Date.now()
		}
		await db.collection(SUBSCRIBE_COLLECTION).doc(`${userId}_${templateId || 'default'}`).set(doc)
		return {
			success: true
		}
	}
}
