'use strict'

const db = uniCloud.database()
const AREA_COLLECTION = 'delivery_area'

async function loadAreaConfig() {
	const res = await db.collection(AREA_COLLECTION).limit(1).get()
	if (!res.data || !res.data.length) {
		return null
	}
	return res.data[0]
}

function guessDistance(address = {}) {
	if (address.distance) {
		return Number(address.distance) || 0
	}
	if (address.geo && address.geo.distance) {
		return Number(address.geo.distance) || 0
	}
	const detail = (address.detail || address.address || '').toLowerCase()
	if (!detail) return 1.5
	if (detail.includes('远') || detail.includes('五环')) {
		return 6
	}
	if (detail.includes('三环')) {
		return 3
	}
	return 1.5
}

function buildQuote(area, distance, goodsAmount) {
	const radius = (area && area.config && area.config.radius) || 5
	const deliverable = distance <= radius
	const minAmount = area && area.min_amount ? Number(area.min_amount) : 0
	let deliveryFee = area && area.delivery_fee ? Number(area.delivery_fee) : 5
	const extraRules = area && Array.isArray(area.extra_rules) ? area.extra_rules : []
	for (const rule of extraRules) {
		if (distance <= Number(rule.distance || 0)) {
			if (rule.delivery_fee !== undefined) {
				deliveryFee = Number(rule.delivery_fee)
			}
			break
		}
	}
	const packageFee = area && area.package_fee ? Number(area.package_fee) : 1
	const result = {
		deliverable,
		distance: Number(distance.toFixed(2)),
		minAmount,
		deliveryFee,
		packageFee,
		freeThreshold: area && area.free_threshold ? Number(area.free_threshold) : 0,
		reason: ''
	}
	if (!deliverable) {
		result.reason = '超出配送范围'
	} else if (goodsAmount < minAmount) {
		result.reason = `未达起送价 ¥${minAmount}`
	}
	return result
}

module.exports = {
	async quote(payload = {}) {
		const address = payload.address || {}
		if (!address.detail && !address.address) {
			throw new Error('address detail is required')
		}
		const goodsAmount = Number(payload.goodsAmount || payload.amount || 0)
		const area = await loadAreaConfig()
		const distance = guessDistance(address)
		return buildQuote(area, distance, goodsAmount)
	},
	async validate(payload = {}) {
		const result = await this.quote(payload)
		return {
			deliverable: result.deliverable,
			reason: result.reason,
			distance: result.distance
		}
	},
	async listArea() {
		const res = await db.collection(AREA_COLLECTION).get()
		return {
			list: res.data || []
		}
	},
	async saveArea(payload = {}) {
		const doc = {
			name: payload.name || '默认配送范围',
			type: payload.type || 'circle',
			config: payload.config || { radius: Number(payload.radius || 0) || 5 },
			min_amount: Number(payload.min_amount ?? payload.minAmount ?? 0),
			delivery_fee: Number(payload.delivery_fee ?? payload.deliveryFee ?? 0),
			package_fee: Number(payload.package_fee ?? payload.packageFee ?? 0),
			extra_rules: Array.isArray(payload.extra_rules || payload.extraRules) ? (payload.extra_rules || payload.extraRules).map(rule => ({
				distance: Number(rule.distance || 0),
				delivery_fee: Number(rule.delivery_fee ?? rule.fee ?? 0)
			})) : [],
			updated_at: Date.now()
		}
		if (doc.type === 'circle') {
			const radius = Number(payload.radius ?? doc.config.radius ?? 0)
			doc.config = Object.assign({}, doc.config, { radius: radius > 0 ? radius : 5 })
		}
		if (payload._id) {
			await db.collection(AREA_COLLECTION).doc(payload._id).update(doc)
			return { _id: payload._id }
		}
		const res = await db.collection(AREA_COLLECTION).add(Object.assign({}, doc, { created_at: Date.now() }))
		return {
			_id: res.id || res._id
		}
	},
	async removeArea(params = {}) {
		const id = params.id || params._id
		if (!id) {
			throw new Error('id is required')
		}
		await db.collection(AREA_COLLECTION).doc(id).remove()
		return {
			success: true
		}
	}
}
