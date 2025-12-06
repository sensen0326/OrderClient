const hasUniCloud = typeof uniCloud !== 'undefined' && uniCloud && typeof uniCloud.importObject === 'function'
const hasUni = typeof uni !== 'undefined' && typeof uni.getStorageSync === 'function'

const STORAGE_KEY = 'localOrderRecords'

const STATUS_FLOW = {
	pending: ['paid', 'cancelled'],
	paid: ['preparing', 'cancelled'],
	preparing: ['delivering', 'completed', 'cancelled'],
	delivering: ['completed', 'cancelled'],
	completed: [],
	cancelled: []
}

const ERROR_TEXT = {
	notFound: 'order not found',
	invalidStatus: 'status transition is not allowed'
}

const getOrderObject = (() => {
	let instance = null
	return () => {
		if (!hasUniCloud) {
			return null
		}
		if (!instance) {
			instance = uniCloud.importObject('order', {
				customUI: true
			})
		}
		return instance
	}
})()

function readLocalOrders() {
	if (!hasUni) return []
	try {
		return uni.getStorageSync(STORAGE_KEY) || []
	} catch (err) {
		console.warn('readLocalOrders failed', err)
		return []
	}
}

function writeLocalOrders(list) {
	if (!hasUni) return
	try {
		uni.setStorageSync(STORAGE_KEY, list)
	} catch (err) {
		console.warn('writeLocalOrders failed', err)
	}
}

function buildLocalOrder(orderNo, payload = {}) {
	const items = (payload.itemsSnapshot || []).map(item => ({
		...item,
		price: Number(item.price || 0),
		value: Number(item.value || item.quantity || 0)
	}))
	const goodsTotal = items.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.value || 0), 0)
	const fee = payload.feeDetail || {}
	const amountDetail = {
		goods: Number(goodsTotal.toFixed(2)),
		package: Number((fee.packageFee || 0).toFixed(2)),
		delivery: Number((fee.deliveryFee || 0).toFixed(2)),
		discount: Number((fee.discount || 0).toFixed(2)),
		payable: Number((fee.payable || goodsTotal).toFixed(2))
	}
	const now = Date.now()
	return {
		order_no: orderNo,
		session_id: payload.sessionId || 'local',
		channel: payload.channel || 'dine_in',
		table_no: (payload.tableInfo && payload.tableInfo.tableNo) || '',
		address: payload.address || null,
		order_status: 'pending',
		pay_status: 'pending',
		fulfill_status: 'pending',
		amount_detail: amountDetail,
		items_count: items.reduce((sum, item) => sum + (item.value || 0), 0),
		items_snapshot: items,
		remark: payload.remark || '',
		people_count: Number(payload.peopleCount || 0),
		meals_time: payload.mealsTime || '',
		coupon_id: payload.couponId || '',
		invoice: payload.invoice || {},
		utensils_count: payload.utensilsCount || 0,
		created_at: now,
		updated_at: now,
		logs: [{
			status: 'pending',
			note: 'order created',
			operator: 'local',
			created_at: now
		}]
	}
}

const orderService = {
	async createFromCart(payload = {}) {
		const orderObj = getOrderObject()
		if (!orderObj) {
			const orderNo = payload.orderNo || `LOCAL${Date.now()}`
			const order = buildLocalOrder(orderNo, payload)
			const list = readLocalOrders()
			list.unshift(order)
			writeLocalOrders(list)
			return {
				orderNo,
				order
			}
		}
		return orderObj.createFromCart(payload)
	},
	async list(params = {}) {
		const orderObj = getOrderObject()
		if (!orderObj) {
			const list = readLocalOrders()
			const sessionId = params.sessionId
			const status = params.status
			const keyword = (params.keyword || '').trim()
			let filtered = sessionId ? list.filter(item => item.session_id === sessionId) : list
			if (status) {
				filtered = filtered.filter(item => item.order_status === status)
			}
			if (keyword) {
				filtered = filtered.filter(item => (item.order_no || '').toLowerCase().includes(keyword.toLowerCase()))
			}
			return {
				list: filtered
			}
		}
		return orderObj.list(params)
	},
	async detail(params = {}) {
		const orderObj = getOrderObject()
		if (!orderObj) {
			const orderNo = params.orderNo
			const list = readLocalOrders()
			const order = list.find(item => item.order_no === orderNo)
			if (!order) {
				throw new Error(ERROR_TEXT.notFound)
			}
			return {
				order,
				items: order.items_snapshot || [],
				logs: order.logs || []
			}
		}
		return orderObj.detail(params)
	},
	async updateStatus(params = {}) {
		const orderObj = getOrderObject()
		if (!orderObj) {
			const list = readLocalOrders()
			const order = list.find(item => item.order_no === params.orderNo)
			if (!order) {
				throw new Error(ERROR_TEXT.notFound)
			}
			const allowed = STATUS_FLOW[order.order_status] || []
			if (!allowed.includes(params.nextStatus)) {
				throw new Error(ERROR_TEXT.invalidStatus)
			}
			const now = Date.now()
			order.order_status = params.nextStatus
			order.updated_at = now
			if (params.nextStatus === 'paid') {
				order.pay_status = 'paid'
			}
			if (params.nextStatus === 'preparing') {
				order.fulfill_status = 'preparing'
			}
			if (params.nextStatus === 'delivering') {
				order.fulfill_status = 'delivering'
			}
			if (params.nextStatus === 'completed') {
				order.fulfill_status = 'completed'
			}
			if (params.nextStatus === 'cancelled') {
				order.fulfill_status = 'cancelled'
			}
			order.logs = order.logs || []
			order.logs.push({
				status: params.nextStatus,
				note: params.note || '',
				operator: params.operator || 'local',
				created_at: now
			})
			writeLocalOrders(list)
			return {
				success: true,
				status: params.nextStatus
			}
		}
		return orderObj.updateStatus(params)
	},
	async cancel(params = {}) {
		const orderObj = getOrderObject()
		if (!orderObj) {
			const list = readLocalOrders()
			const order = list.find(item => item.order_no === params.orderNo)
			if (!order) {
				throw new Error(ERROR_TEXT.notFound)
			}
			if (!['pending', 'paid', 'preparing'].includes(order.order_status)) {
				throw new Error(ERROR_TEXT.invalidStatus)
			}
			order.order_status = 'cancelled'
			order.fulfill_status = 'cancelled'
			if (order.pay_status === 'paid') {
				order.pay_status = 'refund_pending'
			}
			order.updated_at = Date.now()
			order.logs = order.logs || []
			order.logs.push({
				status: 'cancelled',
				note: params.reason || '用户取消订单',
				operator: 'local',
				created_at: Date.now()
			})
			writeLocalOrders(list)
			return {
				success: true
			}
		}
		return orderObj.cancel(params)
	},
	async remind(params = {}) {
		const orderObj = getOrderObject()
		if (!orderObj) {
			const list = readLocalOrders()
			const order = list.find(item => item.order_no === params.orderNo)
			if (!order) {
				throw new Error(ERROR_TEXT.notFound)
			}
			order.logs = order.logs || []
			order.logs.push({
				status: order.order_status,
				note: params.note || '用户催单',
				operator: 'local',
				created_at: Date.now()
			})
			writeLocalOrders(list)
			return {
				success: true
			}
		}
		return orderObj.remind(params)
	}
}

export { STATUS_FLOW }
export default orderService
