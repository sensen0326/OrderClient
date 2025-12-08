import memberService from '@/common/services/member.js'

const hasUniCloud = typeof uniCloud !== 'undefined' && uniCloud && typeof uniCloud.importObject === 'function'
const STORAGE_KEY = 'mockReviews'

const getReviewObject = (() => {
	let instance = null
	return () => {
		if (!hasUniCloud) return null
		if (!instance) {
			instance = uniCloud.importObject('review', {
				customUI: true
			})
		}
		return instance
	}
})()

function getMockList() {
	if (typeof uni === 'undefined') return []
	try {
		const cache = uni.getStorageSync(STORAGE_KEY)
		if (cache && Array.isArray(cache)) {
			return cache
		}
		uni.setStorageSync(STORAGE_KEY, [])
		return []
	} catch (err) {
		console.warn('getMockList failed', err)
		return []
	}
}

function saveMockList(list = []) {
	if (typeof uni === 'undefined') return
	try {
		uni.setStorageSync(STORAGE_KEY, list)
	} catch (err) {
		console.warn('saveMockList failed', err)
	}
}

export async function listByOrder(orderNo) {
	if (!orderNo) return []
	const reviewObj = getReviewObject()
	if (!reviewObj) {
		return getMockList().filter(item => item.order_no === orderNo)
	}
	const res = await reviewObj.listByOrder({
		orderNo
	})
	return (res && res.list) || []
}

export async function listByDish(dishId) {
	if (!dishId) return []
	const reviewObj = getReviewObject()
	if (!reviewObj) {
		return getMockList().filter(item => Array.isArray(item.dish_ids) && item.dish_ids.includes(dishId))
	}
	const res = await reviewObj.listByDish({
		dishId
	})
	return (res && res.list) || []
}

export async function submitReview(payload = {}) {
	const profile = memberService.getStoredProfile()
	if (!profile || !profile.userId) {
		throw new Error('请先登录')
	}
	const reviewObj = getReviewObject()
	const submitPayload = {
		...payload,
		userId: profile.userId,
		nickname: profile.nickname,
		avatar: profile.avatar
	}
	if (!reviewObj) {
		const list = getMockList()
		const now = Date.now()
		const doc = {
			_id: `local_${now}`,
			order_no: payload.orderNo,
			rating_taste: payload.ratings?.taste || 5,
			rating_env: payload.ratings?.env || 5,
			rating_service: payload.ratings?.service || 5,
			content: payload.content || '',
			created_at: now,
			dish_ids: payload.dishIds || [],
			user_id: profile.userId,
			nickname: profile.nickname,
			avatar: profile.avatar
		}
		list.unshift(doc)
		saveMockList(list)
		return {
			review: doc,
			mock: true
		}
	}
	return reviewObj.submit(submitPayload)
}

export default {
	listByOrder,
	listByDish,
	submitReview
}
