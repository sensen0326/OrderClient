import menuList from '@/common/menu.js'

const hasUniCloud = typeof uniCloud !== 'undefined' && uniCloud && typeof uniCloud.importObject === 'function'

const getDishObject = (() => {
	let instance = null
	return () => {
		if (!hasUniCloud) {
			return null
		}
		if (!instance) {
			instance = uniCloud.importObject('dish', {
				customUI: true
			})
		}
		return instance
	}
})()

const fallbackData = (() => {
	const categories = []
	const dishesByCategory = {}
	const allDishes = []
	const dishMap = {}
	;(menuList || []).forEach((category, catIndex) => {
		const categoryId = `local_cat_${catIndex}`
		categories.push({
			_id: categoryId,
			name: category.name || `分类${catIndex + 1}`,
			icon: category.image || '',
			sort: catIndex
		})
		const dishes = (category.foods || []).map((food, foodIndex) => {
			const dishId = `${categoryId}_${food.id || foodIndex}`
			const skuId = `${dishId}_sku`
			const dish = {
				_id: dishId,
				category_id: categoryId,
				name: food.name || `菜品${foodIndex + 1}`,
				description: food.desc || '',
				cover: food.icon || '',
				tags: [],
				skus: [{
					sku_id: skuId,
					name: '默认',
					price: Number(food.price || 0)
				}],
				option_groups: []
			}
			allDishes.push(dish)
			dishMap[dishId] = dish
			return dish
		})
		dishesByCategory[categoryId] = dishes
	})
	return {
		categories,
		dishesByCategory,
		allDishes,
		dishMap
	}
})()

const filterFallbackDishes = (keyword = '') => {
	const key = keyword.trim().toLowerCase()
	if (!key) return []
	return fallbackData.allDishes.filter(dish => {
		const name = (dish.name || '').toLowerCase()
		const desc = (dish.description || '').toLowerCase()
		return name.includes(key) || desc.includes(key)
	})
}

const dishService = {
	async listCategories(params = {}) {
		const dishObj = getDishObject()
		if (!dishObj) {
			return fallbackData.categories
		}
		return await dishObj.listCategories(params)
	},
	async list(params = {}) {
		const dishObj = getDishObject()
		if (!dishObj) {
			const categoryId = params.categoryId || (fallbackData.categories[0] && fallbackData.categories[0]._id) || ''
			return {
				list: fallbackData.dishesByCategory[categoryId] || []
			}
		}
		return await dishObj.list(params)
	},
	async listRecommend(params = {}) {
		const dishObj = getDishObject()
		if (!dishObj) {
			const limit = params.limit || 6
			return fallbackData.allDishes.slice(0, limit)
		}
		return await dishObj.listRecommend(params)
	},
	async detail(params = {}) {
		const dishObj = getDishObject()
		if (!dishObj) {
			const dishId = params.dishId || params._id || ''
			return fallbackData.dishMap[dishId] || null
		}
		return await dishObj.detail(params)
	},
	async search(params = {}) {
		const dishObj = getDishObject()
		if (!dishObj) {
			return {
				list: filterFallbackDishes(params.keyword)
			}
		}
		return await dishObj.search(params)
	},
	async adminUpsert(params = {}) {
		const dishObj = getDishObject()
		if (!dishObj) {
			console.warn('adminUpsert skipped：当前环境未启用uniCloud')
			return {
				success: false,
				message: 'uniCloud unavailable'
			}
		}
		return await dishObj.adminUpsert(params)
	},
	async adminBatchStatus(params = {}) {
		const dishObj = getDishObject()
		if (!dishObj) {
			console.warn('adminBatchStatus skipped：当前环境未启用uniCloud')
			return {
				success: false,
				message: 'uniCloud unavailable'
			}
		}
		return await dishObj.adminBatchStatus(params)
	}
}

export default dishService
