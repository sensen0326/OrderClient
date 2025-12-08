'use strict'

const db = uniCloud.database()
const REVIEW_COLLECTION = 'review'
const REVIEW_MEDIA_COLLECTION = 'review_media'

function getUserId(payload = {}) {
	return payload.userId || payload.user_id || (payload.profile && payload.profile.userId) || ''
}

function normalizeRatings(ratings = {}) {
	return {
		taste: Number(ratings.taste || ratings.rating_taste || 5),
		env: Number(ratings.env || ratings.rating_env || 5),
		service: Number(ratings.service || ratings.rating_service || 5)
	}
}

async function ensureSingleReview(orderNo = '', userId = '') {
	const res = await db.collection(REVIEW_COLLECTION)
		.where({
			order_no: orderNo,
			user_id: userId
		})
		.limit(1)
		.get()
	if (res.data && res.data.length) {
		throw new Error('订单已点评，无需重复提交')
	}
}

module.exports = {
	async submit(payload = {}) {
		const userId = getUserId(payload)
		if (!userId) {
			throw new Error('请先登录')
		}
		const orderNo = payload.orderNo || payload.order_no
		if (!orderNo) {
			throw new Error('orderNo is required')
		}
		await ensureSingleReview(orderNo, userId)
		const ratings = normalizeRatings(payload.ratings || payload)
		const now = Date.now()
		const reviewDoc = {
			order_no: orderNo,
			user_id: userId,
			nickname: payload.nickname || payload.userNickname || '',
			avatar: payload.avatar || '',
			rating_taste: ratings.taste,
			rating_env: ratings.env,
			rating_service: ratings.service,
			content: (payload.content || '').trim(),
			is_anonymous: Boolean(payload.isAnonymous || payload.is_anonymous),
			dish_ids: Array.isArray(payload.dishIds) ? payload.dishIds : [],
			status: 'pending',
			created_at: now,
			updated_at: now
		}
		const reviewRes = await db.collection(REVIEW_COLLECTION).add(reviewDoc)
		const reviewId = reviewRes.id || reviewDoc._id
		const mediaList = Array.isArray(payload.mediaList) ? payload.mediaList : []
		if (mediaList.length) {
			const mediaCollection = db.collection(REVIEW_MEDIA_COLLECTION)
			for (const media of mediaList) {
				await mediaCollection.add({
					review_id: reviewId,
					type: media.type || 'image',
					url: media.url || media,
					cover: media.cover || '',
					created_at: now
				})
			}
		}
		return {
			review: {
				...reviewDoc,
				_id: reviewId
			}
		}
	},
	async listByOrder(payload = {}) {
		const orderNo = payload.orderNo || payload.order_no
		if (!orderNo) {
			throw new Error('orderNo is required')
		}
		const res = await db.collection(REVIEW_COLLECTION)
			.where({
				order_no: orderNo
			})
			.orderBy('created_at', 'desc')
			.limit(20)
			.get()
		return {
			list: res.data || []
		}
	},
	async listByDish(payload = {}) {
		const dishId = payload.dishId || payload.dish_id
		if (!dishId) {
			throw new Error('dishId is required')
		}
		const page = Math.max(1, Number(payload.page) || 1)
		const pageSize = Math.min(20, Math.max(5, Number(payload.pageSize) || 10))
		const res = await db.collection(REVIEW_COLLECTION)
			.where({
				dish_ids: dishId
			})
			.orderBy('created_at', 'desc')
			.skip((page - 1) * pageSize)
			.limit(pageSize)
			.get()
		return {
			list: res.data || [],
			hasMore: (res.data || []).length === pageSize
		}
	}
}
