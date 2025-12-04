const hasUniCloud = typeof uniCloud !== 'undefined' && uniCloud && typeof uniCloud.importObject === 'function'

const getCartObject = (() => {
	let instance = null
	return () => {
		if (!hasUniCloud) {
			return null
		}
		if (!instance) {
			instance = uniCloud.importObject('cart', {
				customUI: true
			})
		}
		return instance
	}
})()

const buildLocalResponse = () => ({
	success: true,
	updated_at: Date.now()
})

const cartService = {
	async sync(payload = {}) {
		const cartObj = getCartObject()
		if (!cartObj) {
			// 缺省使用本地缓存保证流程可走通
			try {
				uni.setStorageSync('menuCartDataRemoteShadow', payload)
			} catch (err) {
				console.warn('local cart shadow persist failed', err)
			}
			return buildLocalResponse()
		}
		return cartObj.sync(payload)
	},
	async get(params = {}) {
		const cartObj = getCartObject()
		if (!cartObj) {
			const local = uni.getStorageSync('menuCartDataRemoteShadow')
			if (!local || !local.items) {
				return null
			}
			return {
				_id: local.sessionId || 'local',
				session_id: local.sessionId || 'local',
				restaurant_id: local.restaurantId || 'default',
				channel: local.channel || 'dine_in',
				table_no: local.tableNo || '',
				items: local.items || [],
				meta: local.meta || {},
				updated_at: local.updated_at || Date.now()
			}
		}
		return cartObj.get(params)
	},
	async clear(params = {}) {
		const cartObj = getCartObject()
		if (!cartObj) {
			uni.removeStorageSync('menuCartDataRemoteShadow')
			return {
				success: true
			}
		}
		return cartObj.clear(params)
	}
}

export default cartService
