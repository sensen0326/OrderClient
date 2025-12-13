import orderService from '@/common/services/order.js'

const hasUniCloud = typeof uniCloud !== 'undefined' && uniCloud && typeof uniCloud.importObject === 'function'

const getCheckoutObject = (() => {
	let instance = null
	return () => {
		if (!hasUniCloud) return null
		if (!instance) {
			instance = uniCloud.importObject('checkout', {
				customUI: true
			})
		}
		return instance
	}
})()

const checkoutService = {
	async preview(payload = {}) {
		const checkoutObj = getCheckoutObject()
		if (!checkoutObj) {
			const items = payload.items || payload.itemsSnapshot || []
			return {
				items,
				feeDetail: payload.feeDetail || {},
				channel: payload.channel || 'dine_in',
				tableInfo: payload.tableInfo || null,
				peopleCount: payload.peopleCount || 0,
				remark: payload.remark || ''
			}
		}
		return checkoutObj.preview(payload)
	},
	async submit(payload = {}) {
		const checkoutObj = getCheckoutObject()
		if (!checkoutObj) {
			const res = await orderService.createFromCart(payload)
			return {
				orderNo: res.orderNo,
				order: res.order,
				preview: payload,
				mock: true
			}
		}
		return checkoutObj.submit(payload)
	}
}

export default checkoutService
