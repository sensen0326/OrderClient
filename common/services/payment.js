const hasUniCloud = typeof uniCloud !== 'undefined' && uniCloud && typeof uniCloud.importObject === 'function'
const hasUni = typeof uni !== 'undefined' && typeof uni.requestPayment === 'function'

const providerMap = {
	wxpay_mp: { provider: 'wxpay', loginProvider: 'weixin', needOpenid: true },
	wxpay: { provider: 'wxpay', loginProvider: 'weixin', needOpenid: true },
	alipay: { provider: 'alipay', loginProvider: 'alipay', needOpenid: true },
	'wxpay-virtual': { provider: 'wxpay-virtual', loginProvider: 'weixin', needOpenid: true }
}

const openidCache = {}

const getPaymentObject = (() => {
	let instance = null
	return () => {
		if (!hasUniCloud) return null
		if (!instance) {
			instance = uniCloud.importObject('uni-pay-co', {
				customUI: true
			})
		}
		return instance
	}
})()

function toCent(amount = 0) {
	const num = Number(amount) || 0
	return Math.max(0, Math.round(num * 100))
}

function confirmMockPayment() {
	return new Promise((resolve, reject) => {
		if (!hasUni) {
			reject(new Error('当前环境不支持模拟支付'))
			return
		}
		uni.showModal({
			title: '提示',
			content: '当前为模拟支付环境，确认继续并视为支付成功？',
			success: res => {
				if (res.confirm) {
					resolve()
				} else {
					reject(new Error('用户取消支付'))
				}
			},
			fail: reject
		})
	})
}

function requestPayment(order, provider) {
	return new Promise((resolve, reject) => {
			uni.requestPayment({
				provider: provider === 'alipay' ? 'alipay' : 'wxpay',
				...order,
				success: resolve,
				fail: err => {
					reject(err || new Error('requestPayment failed'))
				}
			})
	})
}

function requestVirtualPayment(order) {
	return new Promise((resolve, reject) => {
		if (typeof uni.requestVirtualPayment !== 'function') {
			reject(new Error('当前环境不支持虚拟支付'))
			return
		}
		uni.requestVirtualPayment({
			...order,
			success: resolve,
			fail: err => {
				reject(err || new Error('requestVirtualPayment failed'))
			}
		})
	})
}

function login(provider = 'weixin') {
	return new Promise((resolve, reject) => {
		if (typeof uni.login !== 'function') {
			reject(new Error('无法获取登录凭证'))
			return
		}
		uni.login({
			provider,
			success: resolve,
			fail: reject
		})
	})
}

function buildDescription(orderNo, desc) {
	if (desc && typeof desc === 'string') return desc
	return `点餐订单-${orderNo}`
}

async function ensureOpenid(provider, configDirectory) {
	const cacheKey = `${provider}_${configDirectory || 'default'}`
	if (openidCache[cacheKey]) {
		return openidCache[cacheKey]
	}
	const paymentObj = getPaymentObject()
	if (!paymentObj) return ''
	const loginProvider = provider === 'alipay' ? 'alipay' : 'weixin'
	let code = ''
	try {
		const loginRes = await login(loginProvider)
		code = loginRes && loginRes.code
	} catch (err) {
		console.warn('login failed', err)
	}
	if (!code) {
		return ''
	}
	try {
		const res = await paymentObj.getOpenid({
			provider,
			code,
			config_directory: configDirectory
		})
		if (res && res.openid) {
			openidCache[cacheKey] = res.openid
			return res.openid
		}
	} catch (err) {
		console.warn('getOpenid failed', err)
	}
	return ''
}

async function invokeUniPayOrder(res) {
	if (!hasUni) {
		throw new Error('当前环境不支持拉起支付')
	}
	if (res.provider === 'wxpay-virtual') {
		await requestVirtualPayment(res.order || {})
		return
	}
	if (res.order) {
		await requestPayment(res.order, res.provider)
		return
	}
	if (res.qr_code) {
		throw new Error('当前支付方式需要扫码，请在运营后台配置 uni-pay 组件或切换其它支付方式')
	}
	throw new Error('支付信息异常，请稍后再试')
}

const paymentService = {
	async payOrder(orderNo, payload = {}) {
		const paymentObj = getPaymentObject()
		if (!paymentObj) {
			await confirmMockPayment()
			return { paid: true, mock: true }
		}
		const map = providerMap[payload.payChannel] || {}
		const provider = map.provider || payload.payChannel || 'wxpay'
		const totalFee = toCent(payload.amount)
		if (!totalFee) {
			throw new Error('订单金额异常')
		}
		const createOrderData = {
			provider,
			total_fee: totalFee,
			order_no: orderNo,
			out_trade_no: payload.outTradeNo,
			description: buildDescription(orderNo, payload.description),
			type: payload.orderType || 'goods',
			qr_code: payload.qrCode,
			custom: Object.assign({ orderNo }, payload.custom || {}),
			other: payload.other,
			wxpay_virtual: payload.wxpayVirtual,
			biz_type: payload.bizType,
			app_auth_token: payload.appAuthToken,
			sub_app_id: payload.subAppId,
			sub_mch_id: payload.subMchId,
			config_directory: payload.configDirectory
		}
		if (map.needOpenid) {
			const openid = await ensureOpenid(map.provider, payload.configDirectory)
			if (openid) {
				createOrderData.openid = openid
			}
		}
		const res = await paymentObj.createOrder(createOrderData)
		if (res && res.errCode && res.errCode !== 0) {
			throw new Error(res.errMsg || '发起支付失败')
		}
		await invokeUniPayOrder(res)
		return {
			paid: true,
			provider
		}
	},
	async refund(params = {}) {
		const paymentObj = getPaymentObject()
		if (!paymentObj) {
			return { success: true }
		}
		if (!params.orderNo) {
			throw new Error('缺少订单号')
		}
		const refundData = {
			out_trade_no: params.orderNo,
			refund_desc: params.reason || '用户申请退款'
		}
		if (params.amount) {
			refundData.refund_fee = toCent(params.amount)
		}
		const res = await paymentObj.refund(refundData)
		if (res && res.errCode && res.errCode !== 0) {
			throw new Error(res.errMsg || '退款失败')
		}
		return {
			success: true
		}
	}
}

export default paymentService
