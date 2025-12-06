const hasUniCloud = typeof uniCloud !== 'undefined' && uniCloud && typeof uniCloud.importObject === 'function'
const hasUni = typeof uni !== 'undefined'

const LOCAL_COUPONS_KEY = 'localCoupons'

const getCouponObject = (() => {
	let instance = null
	return () => {
		if (!hasUniCloud) return null
		if (!instance) {
			instance = uniCloud.importObject('coupon', {
				customUI: true
			})
		}
		return instance
	}
})()

function getLocalCoupons() {
	if (!hasUni) return []
	try {
		return uni.getStorageSync(LOCAL_COUPONS_KEY) || []
	} catch (err) {
		return []
	}
}

function saveLocalCoupons(list) {
	if (!hasUni) return
	try {
		uni.setStorageSync(LOCAL_COUPONS_KEY, list)
	} catch (err) {
		console.warn('saveLocalCoupons failed', err)
	}
}

function createLocalTemplate() {
	return [
		{ _id: 'local_tpl_1', title: '满 50 减 5', amount: 5, threshold: 50, channel_limit: 'all' },
		{ _id: 'local_tpl_2', title: '堂食减 8', amount: 8, threshold: 100, channel_limit: 'dine_in' }
	]
}

async function listTemplates(params = {}) {
	const couponObj = getCouponObject()
	if (!couponObj) {
		return createLocalTemplate()
	}
	const res = await couponObj.listTemplates(params)
	return (res && res.list) || []
}

async function claim(templateId, userId) {
	if (!userId) {
		throw new Error('请先登录领取优惠券')
	}
	const couponObj = getCouponObject()
	if (!couponObj) {
		const coupons = getLocalCoupons()
		const exists = coupons.find(item => item.template_id === templateId && item.status === 'unused')
		if (exists) {
			return exists
		}
		const template = createLocalTemplate().find(item => item._id === templateId)
		if (!template) throw new Error('券不存在')
		const doc = {
			_id: `local_coupon_${Date.now()}`,
			template_id: templateId,
			title: template.title,
			amount: template.amount,
			threshold: template.threshold,
			channel_limit: template.channel_limit,
			status: 'unused'
		}
		coupons.push(doc)
		saveLocalCoupons(coupons)
		return doc
	}
	const res = await couponObj.claim({
		templateId,
		userId
	})
	return res.coupon
}

async function listMy(userId, status) {
	if (!userId) return []
	const couponObj = getCouponObject()
	if (!couponObj) {
		return getLocalCoupons()
	}
	const res = await couponObj.my({
		userId,
		status
	})
	return (res && res.list) || []
}

async function listUsable(userId, amount, channel) {
	if (!userId) return []
	const couponObj = getCouponObject()
	if (!couponObj) {
		return getLocalCoupons().filter(item => item.status !== 'used' && (!item.threshold || amount >= item.threshold))
	}
	const res = await couponObj.usable({
		userId,
		amount,
		channel
	})
	return (res && res.list) || []
}

export default {
	listTemplates,
	claim,
	listMy,
	listUsable
}
