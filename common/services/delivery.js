const hasUniCloud = typeof uniCloud !== 'undefined' && uniCloud && typeof uniCloud.importObject === 'function'

const getDeliveryObject = (() => {
	let instance = null
	return () => {
		if (!hasUniCloud) return null
		if (!instance) {
			instance = uniCloud.importObject('delivery', {
				customUI: true
			})
		}
		return instance
	}
})()

function mockQuote(address = {}, goodsAmount = 0) {
	const distance = 1.5
	const minAmount = 20
	const deliverable = goodsAmount >= minAmount
	return {
		deliverable,
		distance,
		minAmount,
		deliveryFee: deliverable ? 5 : 0,
		packageFee: 1,
		reason: deliverable ? '' : `未达起送价 ¥${minAmount}`,
		mock: true
	}
}

const deliveryService = {
	async quote(params = {}) {
		const deliveryObj = getDeliveryObject()
		if (!deliveryObj) {
			return mockQuote(params.address, params.goodsAmount)
		}
		return deliveryObj.quote(params)
	},
	async validate(params = {}) {
		const deliveryObj = getDeliveryObject()
		if (!deliveryObj) {
			const res = mockQuote(params.address, params.goodsAmount)
			return {
				deliverable: res.deliverable,
				reason: res.reason,
				distance: res.distance
			}
		}
		return deliveryObj.validate(params)
	}
}

export default deliveryService
