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
	}
}
