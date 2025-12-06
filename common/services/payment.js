const hasUniCloud = typeof uniCloud !== 'undefined' && uniCloud && typeof uniCloud.importObject === 'function'

const getPaymentObject = (() => {
	let instance = null
	return () => {
		if (!hasUniCloud) return null
		if (!instance) {
			instance = uniCloud.importObject('paymentService', {
				customUI: true
			})
		}
		return instance
	}
})()

function mockPaymentData() {
	const now = Date.now()
	return {
		timeStamp: String(Math.floor(now / 1000)),
		nonceStr: Math.random().toString(16).slice(2),
		package: `prepay_id=LOCAL${now}`,
		signType: 'MD5',
		paySign: Math.random().toString(16).slice(2)
	}
}

function confirmMockPayment() {
	return new Promise((resolve, reject) => {
		uni.showModal({
			title: '????',
			content: '?????????????????',
			success: res => {
				if (res.confirm) {
					resolve()
				} else {
					reject(new Error('??????'))
				}
			},
			fail: reject
		})
	})
}

const paymentService = {
	async prepare(orderNo, payload = {}) {
		const paymentObj = getPaymentObject()
		if (!paymentObj) {
			return {
				orderNo,
				payNo: `LOCALPAY${Date.now()}`,
				mock: true,
				paymentData: mockPaymentData()
			}
		}
		return paymentObj.prepare({
			orderNo,
			payChannel: payload.payChannel || 'wxpay'
		})
	},
	async markPaid(params = {}) {
		const paymentObj = getPaymentObject()
		if (!paymentObj) {
			return { success: true }
		}
		return paymentObj.markPaid(params)
	},
	async markFailed(params = {}) {
		const paymentObj = getPaymentObject()
		if (!paymentObj) {
			return { success: true }
		}
		return paymentObj.markFailed(params)
	},
	invokePayment(paymentData = {}, forceMock = false) {
		return new Promise((resolve, reject) => {
			if (!forceMock && typeof uni.requestPayment === 'function') {
				uni.requestPayment({
					timeStamp: paymentData.timeStamp,
					nonceStr: paymentData.nonceStr,
					package: paymentData.package,
					signType: paymentData.signType || 'MD5',
					paySign: paymentData.paySign,
					success: resolve,
					fail: err => {
						reject(err || new Error('requestPayment failed'))
					}
				})
			} else {
				confirmMockPayment().then(resolve).catch(reject)
			}
		})
	},
	async payOrder(orderNo, payload = {}) {
		const prepareRes = await this.prepare(orderNo, payload)
		try {
			await this.invokePayment(prepareRes.paymentData, prepareRes.mock)
			await this.markPaid({
				orderNo,
				payNo: prepareRes.payNo
			})
			return {
				paid: true,
				payNo: prepareRes.payNo
			}
		} catch (err) {
			await this.markFailed({ payNo: prepareRes.payNo })
			throw err
		}
	},
	async refund(params = {}) {
		const paymentObj = getPaymentObject()
		if (!paymentObj) {
			return { success: true }
		}
		return paymentObj.refund(params)
	}
}

export default paymentService
