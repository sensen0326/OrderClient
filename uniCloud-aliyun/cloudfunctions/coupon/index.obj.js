'use strict'

const db = uniCloud.database()
const dbCmd = db.command

const TEMPLATE_COLLECTION = 'coupon_template'
const COUPON_COLLECTION = 'coupon'

const DEFAULT_TEMPLATES = [
	{ title: '满 50 减 5', amount: 5, threshold: 50, channel_limit: 'all' },
	{ title: '外卖专享减 10', amount: 10, threshold: 80, channel_limit: 'takeout' },
	{ title: '堂食 95 折', amount: 8, threshold: 120, channel_limit: 'dine_in' }
]

async function ensureTemplates() {
	const countRes = await db.collection(TEMPLATE_COLLECTION).count()
	if (!countRes.total) {
		const now = Date.now()
		await db.collection(TEMPLATE_COLLECTION).add(DEFAULT_TEMPLATES.map(item => ({
			...item,
			status: 'active',
			total: 9999,
			claimed: 0,
			valid_start: now - 3600 * 1000,
			valid_end: now + 30 * 24 * 3600 * 1000,
			created_at: now,
			updated_at: now
		})))
	}
}

function withinRange(template, now = Date.now()) {
	if (template.valid_start && now < template.valid_start) return false
	if (template.valid_end && now > template.valid_end) return false
	return template.status === 'active'
}

module.exports = {
	async listTemplates(params = {}) {
		await ensureTemplates()
		const channel = params.channel || 'all'
		const res = await db.collection(TEMPLATE_COLLECTION)
			.where({
				status: 'active'
			})
			.get()
		const now = Date.now()
		const list = (res.data || []).filter(item => withinRange(item, now) && (item.channel_limit === 'all' || item.channel_limit === channel || channel === 'all'))
		return {
			list
		}
	},
	async claim(payload = {}) {
		if (!payload.userId) {
			throw new Error('userId is required')
		}
		if (!payload.templateId) {
			throw new Error('templateId is required')
		}
		const tplRes = await db.collection(TEMPLATE_COLLECTION).doc(payload.templateId).get()
		if (!tplRes.data || !tplRes.data.length) {
			throw new Error('券模板不存在')
		}
		const template = tplRes.data[0]
		if (!withinRange(template)) {
			throw new Error('券已过期或未生效')
		}
		const existing = await db.collection(COUPON_COLLECTION).where({
			user_id: payload.userId,
			template_id: payload.templateId,
			status: dbCmd.neq('expired')
		}).limit(1).get()
		if (existing.data && existing.data.length) {
			return {
				repeat: true,
				coupon: existing.data[0]
			}
		}
		const now = Date.now()
		const doc = {
			template_id: payload.templateId,
			user_id: payload.userId,
			title: template.title,
			amount: template.amount,
			threshold: template.threshold,
			channel_limit: template.channel_limit || 'all',
			status: 'unused',
			valid_start: template.valid_start,
			valid_end: template.valid_end,
			created_at: now,
			updated_at: now
		}
		const addRes = await db.collection(COUPON_COLLECTION).add(doc)
		await db.collection(TEMPLATE_COLLECTION).doc(template._id).update({
			claimed: dbCmd.inc(1)
		})
		return {
			couponId: addRes.id || addRes._id,
			coupon: Object.assign({}, doc, { _id: addRes.id || addRes._id })
		}
	},
	async my(payload = {}) {
		if (!payload.userId) {
			throw new Error('userId is required')
		}
		const where = {
			user_id: payload.userId
		}
		if (payload.status) {
			where.status = payload.status
		}
		const res = await db.collection(COUPON_COLLECTION)
			.where(where)
			.orderBy('created_at', 'desc')
			.get()
		return {
			list: res.data || []
		}
	},
	async usable(payload = {}) {
		if (!payload.userId) {
			throw new Error('userId is required')
		}
		const amount = Number(payload.amount || 0)
		const channel = payload.channel || 'all'
		const now = Date.now()
		const res = await db.collection(COUPON_COLLECTION)
			.where({
				user_id: payload.userId,
				status: 'unused',
				valid_start: dbCmd.lte(now),
				valid_end: dbCmd.gte(now)
			})
			.get()
		const list = (res.data || []).filter(item => {
			if (item.threshold && amount < item.threshold) return false
			const limit = item.channel_limit || 'all'
			if (limit !== 'all' && limit !== channel) return false
			return true
		})
		return {
			list
		}
	},
	async adminListTemplates(params = {}) {
		const page = Math.max(1, Number(params.page) || 1)
		const pageSize = Math.min(100, Math.max(1, Number(params.pageSize) || 20))
		const where = {}
		if (params.status) where.status = params.status
		const keyword = (params.keyword || '').trim()
		if (keyword) {
			const reg = new RegExp(keyword, 'i')
			where.title = reg
		}
		const collection = db.collection(TEMPLATE_COLLECTION)
		const countRes = await collection.where(where).count()
		const res = await collection
			.where(where)
			.orderBy('created_at', 'desc')
			.skip((page - 1) * pageSize)
			.limit(pageSize)
			.get()
		return {
			list: res.data || [],
			pagination: {
				page,
				pageSize,
				total: countRes.total || 0
			}
		}
	},
	async adminSaveTemplate(payload = {}) {
		if (!payload.title) throw new Error('title is required')
		const now = Date.now()
		const doc = {
			title: payload.title,
			amount: Number(payload.amount || 0),
			threshold: Number(payload.threshold || 0),
			channel_limit: payload.channel_limit || 'all',
			status: payload.status || 'active',
			total: Number(payload.total || 0),
			valid_start: Number(payload.valid_start || now),
			valid_end: Number(payload.valid_end || now + 30 * 24 * 3600 * 1000),
			description: payload.description || '',
			updated_at: now
		}
		if (payload._id) {
			await db.collection(TEMPLATE_COLLECTION).doc(payload._id).update(doc)
		} else {
			doc.created_at = now
			doc.claimed = 0
			await db.collection(TEMPLATE_COLLECTION).add(doc)
		}
		return { success: true }
	},
	async adminToggleTemplate(payload = {}) {
		if (!payload.id) throw new Error('id is required')
		if (!payload.status) throw new Error('status is required')
		await db.collection(TEMPLATE_COLLECTION).doc(payload.id).update({
			status: payload.status,
			updated_at: Date.now()
		})
		return { success: true }
	},
	async adminDeleteTemplate(payload = {}) {
		if (!payload.id) throw new Error('id is required')
		await db.collection(TEMPLATE_COLLECTION).doc(payload.id).remove()
		return { success: true }
	},
	async adminIssueCoupon(payload = {}) {
		if (!payload.templateId) throw new Error('templateId is required')
		const userIds = Array.isArray(payload.userIds) ? payload.userIds : []
		if (!userIds.length) throw new Error('userIds is required')
		const tplRes = await db.collection(TEMPLATE_COLLECTION).doc(payload.templateId).get()
		if (!tplRes.data || !tplRes.data.length) throw new Error('模板不存在')
		const template = tplRes.data[0]
		const now = Date.now()
		const ops = userIds.map(userId => {
			const doc = {
				template_id: payload.templateId,
				user_id: userId,
				title: template.title,
				amount: template.amount,
				threshold: template.threshold,
				channel_limit: template.channel_limit || 'all',
				status: 'unused',
				valid_start: template.valid_start,
				valid_end: template.valid_end,
				source: 'manual',
				created_at: now,
				updated_at: now
			}
			return db.collection(COUPON_COLLECTION).add(doc)
		})
		await Promise.all(ops)
		await db.collection(TEMPLATE_COLLECTION).doc(template._id).update({
			claimed: dbCmd.inc(userIds.length),
			updated_at: now
		})
		return { success: true }
	}
}
