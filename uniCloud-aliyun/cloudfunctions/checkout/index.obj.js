'use strict'

const db = uniCloud.database()
const CART_COLLECTION = 'cart_sessions'
const TABLE_COLLECTION = 'restaurant_table'
const TABLE_SESSION_COLLECTION = 'table_session'

function normalizeItems(items = []) {
	return (items || []).map(item => {
		const quantity = Number(item.quantity) || 0
		return {
			key: item.key || `${item.dishId || ''}_${item.skuId || ''}_${item.optionsText || ''}`,
			dishId: item.dishId || '',
			dishName: item.dishName || item.name || '',
			dishImg: item.dishImg || item.cover || '',
			skuId: item.skuId || '',
			skuName: item.skuName || '',
			quantity,
			price: Number(item.price) || 0,
			packageFee: Number(item.packageFee || 0),
			options: Array.isArray(item.options) ? item.options : [],
			optionsText: item.optionsText || '',
			desc: item.desc || item.remark || ''
		}
	}).filter(item => item.quantity > 0)
}

function calcAmountDetail(items = [], fees = {}, promotion = {}) {
	const goods = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
	const autoPackage = items.reduce((sum, item) => sum + item.packageFee * item.quantity, 0)
	const packageFee = autoPackage + Number(fees.packageFee || fees.package || 0)
	const deliveryFee = Number(fees.deliveryFee || fees.delivery || 0)
	const serviceFee = Number(fees.serviceFee || 0)
	const discountDetail = []
	let discount = Number(fees.discount || 0)

	if (promotion && promotion.coupon && Number(promotion.coupon.amount)) {
		const amount = Math.min(goods, Number(promotion.coupon.amount))
		discount += amount
		discountDetail.push({
			type: 'coupon',
			title: promotion.coupon.title || '优惠券',
			amount: Number(amount.toFixed(2)),
			couponId: promotion.coupon.couponId || ''
		})
	}

	if (promotion && promotion.points && Number(promotion.points.amount)) {
		const amount = Math.min(goods, Number(promotion.points.amount))
		discount += amount
		discountDetail.push({
			type: 'points',
			title: promotion.points.title || '积分抵扣',
			points: promotion.points.points || 0,
			amount: Number(amount.toFixed(2))
		})
	}

	const payable = Math.max(goods + packageFee + deliveryFee + serviceFee - discount, 0)
	return {
		goods: Number(goods.toFixed(2)),
		package: Number(packageFee.toFixed(2)),
		delivery: Number(deliveryFee.toFixed(2)),
		service: Number(serviceFee.toFixed(2)),
		discount: Number(discount.toFixed(2)),
		payable: Number(payable.toFixed(2)),
		discountDetail
	}
}

async function loadCart(sessionId) {
	if (!sessionId || sessionId === 'local') return null
	const res = await db.collection(CART_COLLECTION).doc(sessionId).get()
	return res.data && res.data.length ? res.data[0] : null
}

async function fetchTableInfo(cart, payload = {}) {
	const tableNo = payload.tableNo || (cart && cart.table_no) || ''
	if (!tableNo) return null
	const tableRes = await db.collection(TABLE_COLLECTION).where({
		table_no: tableNo
	}).limit(1).get()
	const table = tableRes.data && tableRes.data.length ? tableRes.data[0] : null
	const tableSessionId = payload.tableSessionId || (cart && cart.session_id) || (table && table.current_session_id) || ''
	let peopleCount = Number(payload.peopleCount || (cart && cart.meta && cart.meta.peopleCount) || (table && table.seat_count) || 0)
	if (tableSessionId) {
		const sessionRes = await db.collection(TABLE_SESSION_COLLECTION).doc(tableSessionId).get()
		if (sessionRes.data && sessionRes.data.length) {
			peopleCount = sessionRes.data[0].people_count || peopleCount
		}
	}
	return {
		tableNo,
		sessionId: tableSessionId,
		status: (table && table.status) || 'ordering',
		peopleCount
	}
}

function buildSnapshotItems(items = []) {
	return items.map(item => ({
		dishId: item.dishId,
		name: item.dishName,
		desc: item.desc,
		icon: item.dishImg,
		skuName: item.skuName,
		optionsText: item.optionsText,
		price: item.price,
		value: item.quantity
	}))
}

module.exports = {
	async preview(payload = {}) {
		const sessionId = payload.sessionId || 'local'
		const cart = await loadCart(sessionId)
		let items = normalizeItems(payload.items)
		if ((!items || !items.length) && cart && Array.isArray(cart.items)) {
			items = normalizeItems(cart.items)
		}
		if (!items.length) {
			throw new Error('cart is empty')
		}
		const fees = payload.fees || {}
		const promotion = payload.promotion || {}
		const amountDetail = calcAmountDetail(items, fees, promotion)
		const tableInfo = await fetchTableInfo(cart, payload)
		const response = {
			sessionId,
			channel: payload.channel || (cart && cart.channel) || 'dine_in',
			restaurantId: payload.restaurantId || (cart && cart.restaurant_id) || 'default',
			items,
			participants: (cart && cart.participants) || [],
			tableInfo,
			settleInfo: {
				tableInfo,
				address: payload.address || null,
				contact: payload.contact || null,
				invoice: payload.invoice || null,
				remark: payload.remark || ''
			},
			amountDetail,
			feeDetail: {
				packageFee: amountDetail.package + amountDetail.service,
				deliveryFee: amountDetail.delivery,
				discount: amountDetail.discount,
				payable: amountDetail.payable
			},
			discountDetail: amountDetail.discountDetail
		}
		return response
	},
	async submit(payload = {}) {
		const previewResult = await this.preview(payload)
		const orderCo = uniCloud.importObject('order')
		const orderPayload = {
			sessionId: payload.sessionId || 'local',
			restaurantId: previewResult.restaurantId,
			channel: previewResult.channel,
			tableInfo: previewResult.tableInfo,
			peopleCount: payload.peopleCount || (previewResult.tableInfo && previewResult.tableInfo.peopleCount) || 0,
			address: payload.address || (previewResult.settleInfo && previewResult.settleInfo.address) || null,
			remark: payload.remark || (previewResult.settleInfo && previewResult.settleInfo.remark) || '',
			invoice: payload.invoice || (previewResult.settleInfo && previewResult.settleInfo.invoice) || {},
			utensilsCount: payload.utensilsCount || 0,
			feeDetail: previewResult.feeDetail,
			itemsSnapshot: buildSnapshotItems(previewResult.items),
			couponId: payload.coupon && payload.coupon.couponId || '',
			restaurantId: previewResult.restaurantId,
			meta: Object.assign({}, payload.meta || {}, {
				discountDetail: previewResult.discountDetail,
				serviceFee: previewResult.amountDetail.service
			})
		}
		const orderRes = await orderCo.createFromCart(orderPayload)
		return {
			orderNo: orderRes.orderNo,
			amountDetail: previewResult.amountDetail,
			order: orderRes.order
		}
	}
}
