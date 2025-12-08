const hasUniCloud = typeof uniCloud !== 'undefined' && uniCloud && typeof uniCloud.importObject === 'function'
const hasUni = typeof uni !== 'undefined'

const LOCAL_SLOTS = {
	home_banner: {
		items: [
			{
				title: '安心材料，品质火锅',
				image: 'https://mp-a83aee34-7c6d-40e3-a241-85ab45b7ff6e.cdn.bspapp.com/cloudstorage/static/index/banner.jpg',
				action: 'tab',
				target: '/pages/menu/menu'
			}
		]
	},
	home_entry: {
		items: [
			{
				title: '门店堂食',
				image: 'https://mp-a83aee34-7c6d-40e3-a241-85ab45b7ff6e.cdn.bspapp.com/cloudstorage/static/index/service.jpg',
				action: 'dine_in'
			},
				{
				title: '外卖配送',
				image: 'https://mp-a83aee34-7c6d-40e3-a241-85ab45b7ff6e.cdn.bspapp.com/cloudstorage/static/index/takeaway.jpg',
				action: 'takeout'
			}
		]
	},
	home_cards: {
		items: [
			{
				title: '积分商城',
				desc: '专属好礼随心兑',
				image: 'https://mp-a83aee34-7c6d-40e3-a241-85ab45b7ff6e.cdn.bspapp.com/cloudstorage/static/index/integralShop.png',
				action: 'page',
				target: '/pages/my/my'
			},
			{
				title: '会员中心',
				desc: '尊享会员权益',
				image: 'https://mp-a83aee34-7c6d-40e3-a241-85ab45b7ff6e.cdn.bspapp.com/cloudstorage/static/index/vipCenter.png',
				action: 'page',
				target: '/pages/my/my'
			},
			{
				title: '活动中心',
				desc: '更多活动等你参加',
				image: 'https://mp-a83aee34-7c6d-40e3-a241-85ab45b7ff6e.cdn.bspapp.com/cloudstorage/static/index/activityCenter.png',
				action: 'tab',
				target: '/pages/menu/menu'
			}
		]
	},
	home_campaign: {
		items: [
			{
				title: '积分加油站',
				desc: '可兑换现金优惠券和周边礼品',
				image: 'https://mp-a83aee34-7c6d-40e3-a241-85ab45b7ff6e.cdn.bspapp.com/cloudstorage/static/index/integral.jpg',
				action: 'page',
				target: '/pages/my/my'
			}
		]
	},
	my_quick_links: {
		items: [
			{
				title: '会员日惊喜券',
				desc: '限时领取 30 元代金券',
				image: 'https://mp-a83aee34-7c6d-40e3-a241-85ab45b7ff6e.cdn.bspapp.com/cloudstorage/static/my/card-coupon.png',
				action: 'page',
				target: '/pages/my/my'
			},
			{
				title: '周末礼遇',
				desc: '双人套餐第二份半价',
				image: 'https://mp-a83aee34-7c6d-40e3-a241-85ab45b7ff6e.cdn.bspapp.com/cloudstorage/static/my/card-weekend.png',
				action: 'tab',
				target: '/pages/menu/menu'
			}
		]
	},
	my_campaigns: {
		items: [
			{
				title: '积分兑换爆品',
				desc: '黑金卡专享好礼兑换',
				image: 'https://mp-a83aee34-7c6d-40e3-a241-85ab45b7ff6e.cdn.bspapp.com/cloudstorage/static/my/card-points.png',
				action: 'page',
				target: '/pages/my/my'
			}
		]
	}
}

const getOperationObject = (() => {
	let instance = null
	return () => {
		if (!hasUniCloud) return null
		if (!instance) {
			instance = uniCloud.importObject('operation', {
				customUI: true
			})
		}
		return instance
	}
})()

function buildFallback(slotCodes = []) {
	const result = {}
	slotCodes.forEach(code => {
		result[code] = LOCAL_SLOTS[code] || { items: [] }
	})
	return result
}

export async function fetchSlots(slotCodes = []) {
	const codes = Array.isArray(slotCodes) && slotCodes.length ? slotCodes : Object.keys(LOCAL_SLOTS)
	const operationObj = getOperationObject()
	if (!operationObj) {
		return buildFallback(codes)
	}
	try {
		const res = await operationObj.list({
			slotCodes: codes
		})
		const remote = (res && res.slots) || {}
		const result = {}
		codes.forEach(code => {
			result[code] = remote[code] || LOCAL_SLOTS[code] || { items: [] }
		})
		return result
	} catch (err) {
		console.warn('fetchSlots failed', err)
		return buildFallback(codes)
	}
}

export default {
	fetchSlots
}
