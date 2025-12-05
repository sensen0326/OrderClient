'use strict'

const db = uniCloud.database()
const ORDER_COLLECTION = 'order'
const ORDER_ITEM_COLLECTION = 'order_item'
const ORDER_STATUS_COLLECTION = 'order_status_log'
const CART_COLLECTION = 'cart_sessions'

const STATUS_FLOW = {
	pending: ['paid', 'cancelled'],
	paid: ['preparing', 'cancelled'],
	preparing: ['delivering', 'completed', 'cancelled'],
	delivering: ['completed', 'cancelled'],
	completed: [],
	cancelled: []
}

function buildOrderNo() {
	return `OD${Date.now()}${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`
}

function normalizeOrderItems(cartItems = [], orderNo = '') {
	const now = Date.now()
	return (cartItems || []).map(item => {
		const quantity = Number(item.quantity) || 0
		const unitPrice = Number(item.price) || 0
		return {
			order_no: orderNo,
			dish_id: item.dishId || '',
			dish_name: item.dishName || '',
			sku_id: item.skuId || '',
			sku_name: item.skuName || '',
			options: Array.isArray(item.options) ? item.options : [],
			options_text: item.optionsText || '',
			desc: item.desc || '',
			unit_price: unitPrice,
			quantity,
			amount: Number((unitPrice * quantity).toFixed(2)),
			created_at: now
		}
	}).filter(item => item.quantity > 0)
}

function calcAmountDetail(orderItems = [], feeDetail = {}) {
	const goods = orderItems.reduce((sum, item) => sum + Number(item.amount || 0), 0)
	const packageFee = Number(feeDetail.packageFee ?? feeDetail.package ?? 0)
	const deliveryFee = Number(feeDetail.deliveryFee ?? feeDetail.delivery ?? 0)
	const discount = Number(feeDetail.discount ?? 0)
	const payableInput = Number(feeDetail.payable ?? 0)
	const payable = payableInput > 0 ? payableInput : goods + packageFee + deliveryFee - discount
	return {
		goods: Number(goods.toFixed(2)),
		package: Number(packageFee.toFixed(2)),
		delivery: Number(deliveryFee.toFixed(2)),
		discount: Number(discount.toFixed(2)),
		payable: Number(Math.max(payable, 0).toFixed(2))
	}
}

async function appendStatusLog(transaction, orderNo, status, operator = 'system', note = '') {
	const now = Date.now()
	await transaction.collection(ORDER_STATUS_COLLECTION).add({
		order_no: orderNo,
		status,
		operator,
		note,
		created_at: now
	})
}

function buildSnapshotItems(items = []) {
	return (items || []).map(item => ({
		dishId: item.dish_id || item.dishId || '',
		name: item.dish_name || item.dishName || '',
		desc: item.desc || '',
		icon: item.dishImg || item.icon || '',
		skuName: item.sku_name || item.skuName || '',
		optionsText: item.options_text || item.optionsText || '',
		price: Number(item.unit_price || item.price || 0),
		value: Number(item.quantity || item.value || 0)
	}))
}

module.exports = {
	async createFromCart(payload = {}) {
		const sessionId = payload.sessionId || 'local'
		let cart = null
		if (sessionId && sessionId !== 'local') {
			const cartRes = await db.collection(CART_COLLECTION).doc(sessionId).get()
			if (cartRes.data && cartRes.data.length) {
				cart = cartRes.data[0]
			}
		}
		const orderNo = payload.orderNo || buildOrderNo()
		const cartSourceItems = cart && Array.isArray(cart.items) && cart.items.length ? cart.items : (payload.itemsSnapshot || [])
		const orderItems = normalizeOrderItems(cartSourceItems, orderNo)
		if (!orderItems.length) {
			throw new Error('cart is empty')
		}
		const amountDetail = calcAmountDetail(orderItems, payload.feeDetail || {})
		const now = Date.now()
		const orderDoc = {
			_id: orderNo,
			order_no: orderNo,
			session_id: sessionId,
			restaurant_id: (cart && cart.restaurant_id) || payload.restaurantId || 'default',
			channel: payload.channel || (cart && cart.channel) || 'dine_in',
			table_no: (payload.tableInfo && payload.tableInfo.tableNo) || (cart && cart.table_no) || '',
			address: payload.address || null,
			people_count: Number(payload.peopleCount || 0),
			remark: payload.remark || (cart && cart.remark) || '',
			pay_status: 'pending',
			fulfill_status: 'pending',
			order_status: 'pending',
			amount_detail: amountDetail,
			items_count: orderItems.reduce((sum, item) => sum + Number(item.quantity || 0), 0),
			items_snapshot: payload.itemsSnapshot ? buildSnapshotItems(payload.itemsSnapshot) : buildSnapshotItems(orderItems),
			invoice: payload.invoice || {},
			utensils_count: Number(payload.utensilsCount || 0),
			meals_time: payload.mealsTime || '',
			coupon_id: payload.couponId || '',
			meta: payload.meta || {},
			created_at: now,
			updated_at: now
		}
		const transaction = await db.startTransaction()
		try {
			await transaction.collection(ORDER_COLLECTION).add(orderDoc)
			const itemCollection = transaction.collection(ORDER_ITEM_COLLECTION)
			for (const item of orderItems) {
				await itemCollection.add(item)
			}
			await appendStatusLog(transaction, orderNo, 'pending', payload.operator || 'system', '订单创建')
			if (cart && sessionId && sessionId !== 'local') {
				await transaction.collection(CART_COLLECTION).doc(sessionId).remove()
			}
			await transaction.commit()
		} catch (err) {
			await transaction.rollback()
			throw err
		}
		return {
			orderNo,
			order: orderDoc
		}
	},
	async list(params = {}) {
		const page = Math.max(1, Number(params.page) || 1)
		const pageSize = Math.min(50, Math.max(1, Number(params.pageSize) || 10))
		const where = {}
		if (params.sessionId) {
			where.session_id = params.sessionId
		}
		if (params.status) {
			where.order_status = params.status
		}
		const res = await db.collection(ORDER_COLLECTION)
			.where(where)
			.orderBy('created_at', 'desc')
			.skip((page - 1) * pageSize)
			.limit(pageSize)
			.get()
		return {
			list: res.data || []
		}
	},
	async detail(params = {}) {
		const orderNo = params.orderNo
		if (!orderNo) {
			throw new Error('orderNo is required')
		}
		const orderRes = await db.collection(ORDER_COLLECTION).doc(orderNo).get()
		if (!orderRes.data || !orderRes.data.length) {
			throw new Error('order not found')
		}
		const order = orderRes.data[0]
		const itemsRes = await db.collection(ORDER_ITEM_COLLECTION).where({
			order_no: orderNo
		}).get()
		const logsRes = await db.collection(ORDER_STATUS_COLLECTION)
			.where({
				order_no: orderNo
			})
			.orderBy('created_at', 'asc')
			.get()
		return {
			order,
			items: itemsRes.data || [],
			logs: logsRes.data || []
		}
	},
	async updateStatus(params = {}) {
		const orderNo = params.orderNo
		const nextStatus = params.nextStatus
		if (!orderNo || !nextStatus) {
			throw new Error('orderNo and nextStatus are required')
		}
		const orderRes = await db.collection(ORDER_COLLECTION).doc(orderNo).get()
		if (!orderRes.data || !orderRes.data.length) {
			throw new Error('order not found')
		}
		const order = orderRes.data[0]
		const allowed = STATUS_FLOW[order.order_status] || []
		if (!allowed.includes(nextStatus)) {
			throw new Error('invalid status transition')
		}
		const now = Date.now()
		const updates = {
			order_status: nextStatus,
			updated_at: now
		}
		if (nextStatus === 'paid') {
			updates.pay_status = 'paid'
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
		if (nextStatus === 'cancelled') {
			updates.fulfill_status = 'cancelled'
			if (order.pay_status === 'paid') {
				updates.pay_status = 'refund_pending'
			}
		}
		await db.collection(ORDER_COLLECTION).doc(orderNo).update(updates)
		await db.collection(ORDER_STATUS_COLLECTION).add({
			order_no: orderNo,
			status: nextStatus,
			note: params.note || '',
			operator: params.operator || 'system',
			created_at: now
		})
		return {
			success: true,
			status: nextStatus
		}
	}
}
