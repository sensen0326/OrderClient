<template>
	<view class="u-wrap">
		<!-- header start -->
		<view class="header">
			<view v-if="subCurrent">
				<view class="header__title">北京市朝阳区万豪公寓7号楼1单元1201</view>
				<view class="header__info">
					<text class="header__name">Kaiyuan_Q</text>
					<text>188****8888</text>
				</view>
			</view>
			<view v-else>
				<view class="header__title">北京市朝阳区万达广场4层·私房菜</view>
				<view class="header__info">距离您 0.2km</view>
			</view>
			<view>
				<u-subsection
					:list="subList"
					:current="subCurrent"
					active-color="#EE2F37"
					mode="subsection"
					height="50"
					:bold="false"
					@change="subChange"
				></u-subsection>
			</view>
		</view>
		<!-- header end -->

		<!-- tools start -->
		<view class="menu-tools">
			<view class="menu-search">
				<u-icon name="search" size="32" color="#999"></u-icon>
				<input
					class="menu-search__input"
					:value="searchKeyword"
					placeholder="搜索菜品 / 口味 / 标签"
					confirm-type="search"
					@input="handleSearchInput"
					@confirm="handleSearch"
				/>
				<view class="menu-search__action" @click="handleSearch">搜索</view>
			</view>
			<view class="menu-tools__tags">
				<view
					v-for="item in sortFilters"
					:key="item.key"
					class="menu-tools__tag"
					:class="{'is-active': item.active}"
					@click="handleFilterSelect(item.key)"
				>
					{{ item.label }}
				</view>
			</view>
		</view>
		<!-- tools end -->

		<!-- recommend start -->
		<view class="recommend-section" v-if="recommendList.length">
			<view class="recommend-section__header">
				<view class="recommend-section__title">今日推荐</view>
				<view class="recommend-section__subtitle">高分好菜，限时热卖</view>
			</view>
			<scroll-view scroll-x class="recommend-section__scroll" show-scrollbar="false">
				<view
					class="recommend-card"
					v-for="item in recommendList"
					:key="item._id"
					@click="openDishFromRecommend(item)"
				>
					<image :src="item.cover" mode="aspectFill"></image>
					<view class="recommend-card__name">{{ item.name }}</view>
					<view class="recommend-card__price">
						<text>￥</text>{{ formatPrice(getFirstSkuPrice(item)) }}
					</view>
				</view>
			</scroll-view>
		</view>
		<!-- recommend end -->

		<!-- menu start -->
		<view class="u-menu-wrap">
			<scroll-view
				scroll-y
				scroll-with-animation
				class="u-tab-view menu-scroll-view"
				:scroll-top="scrollTop"
				:show-scrollbar="false"
				enhanced
			>
				<view
					v-for="(item,index) in tabbar"
					:key="item._id || index"
					class="u-tab-item"
					:class="[current==index ? 'u-tab-item-active' : '']"
					:data-current="index"
					@tap.stop="swichMenu(index)"
				>
					<u-image :src="item.icon" width="60" height="60" class="menuimg"></u-image>
					<text class="tabMenu-name">{{item.name}}</text>
				</view>
				<u-gap height="200" bg-color="#FFFFFF"></u-gap>
			</scroll-view>
			<scroll-view scroll-y class="right-box" :show-scrollbar="false" enhanced>
				<view class="page-view">
					<view v-if="loading && !currentDishList.length" class="loader-box">
						<view class="loader-spinner"></view>
						<view class="loader-box__text">加载中...</view>
					</view>
					<view v-else-if="errorMsg" class="loader-box">
						<view class="empty-box">
							<view class="empty-box__icon">:(</view>
							<view class="empty-box__text">菜单加载失败</view>
						</view>
						<u-button size="mini" type="primary" @click="initMenuData">重试</u-button>
					</view>
					<view v-else-if="!currentDishList.length" class="loader-box">
						<view class="empty-box">
							<view class="empty-box__icon">~</view>
							<view class="empty-box__text">该分类暂无菜品</view>
						</view>
					</view>
					<view v-else>
					<view class="current-category-title">{{ currentCategoryName }}</view>
						<view class="class-item">
							<view
								class="class-item-box"
								v-for="dish in currentDishList"
								:key="dish._id"
								:class="{'is-highlight': dish._id === highlightedDishId}"
							>
								<image class="item-menu-image" :src="dish.cover" mode="aspectFill"></image>
								<view class="item-menu-name">
									<view class="item-menu-name__header">
										<text class="item-menu-name__name">{{dish.name}}</text>
										<view class="item-menu-name__tags">
											<u-tag
												v-for="tag in dish.tags"
												:key="tag"
												size="mini"
												mode="plain"
												type="error"
												class="item-menu-name__tag"
											>{{ tag }}</u-tag>
										</view>
									</view>
									<view class="item-menu-name__desc u-line-2">
										{{dish.description}}
									</view>
									<view class="item-menu-price">
										<view class="item-menu-price__color">
											<text class="item-menu-price__text">￥</text>
											{{formatPrice(getFirstSkuPrice(dish))}}
										</view>
										<view v-if="canUseQuickNumber(dish)">
											<u-number-box
												:min="0"
												:max="100"
												disabled-input
												:value="getDishQuickQuantity(dish)"
												:long-press="false"
												color="#fff"
												@plus="plusDish(dish)"
												@minus="minusDish(dish)"
											></u-number-box>
										</view>
										<view
											v-else
											class="item-menu-price__spec"
											@click="selectSpec(dish)"
										>
											选择规格
										</view>
									</view>
								</view>
							</view>
						</view>
					</view>
				</view>
				<view class="scroll-safe-bottom"></view>
			</scroll-view>
		</view>
		<!-- menu end -->

		<!-- bottom start-->
		<view class="u-bottom" :class="{'u-bottom--disabled': !menuNum}">
			<view class="u-bottom__wrap" @click="MenuPopup">
				<view class="u-bottom__bags">
					<u-badge :count="menuNum" type="error" :offset="[-5,-10]"></u-badge>
					<u-icon name="https://mp-a83aee34-7c6d-40e3-a241-85ab45b7ff6e.cdn.bspapp.com/cloudstorage/static/menu/bags.png" size="50"></u-icon>
				</view>
				<view class="u-bottom__price">
					<text>￥</text>
					{{(Math.abs(menuPrice) === 0 ? '0.00' : menuPrice.toFixed(2))}}
				</view>
				<view class="u-bottom__nums">共{{menuNum}} 件商品</view>
			</view>
			<view class="u-bottom__place" :class="{'is-disabled': !menuNum}" @click="settlement">
				去结算
			</view>
		</view>
		<!-- bottom end -->

		<!-- cart popup -->
		<u-popup v-model="PopupShow" mode="bottom" height="70%" border-radius="14" :mask-close-able="false">
			<view class="popup-wrap">
				<view class="emptyShop" @click="clickEmptyShop">
					<u-icon name="trash" class="emptyShop__icon"></u-icon>清空购物车
				</view>
				<u-gap height="80"></u-gap>
				<view
					class="menulist"
					v-for="item in cartItems"
					:key="item.key"
				>
					<image class="item-menu-images" :src="item.dishImg" mode="aspectFill"></image>
					<view class="item-menu-name">
						<text class="item-menu-name__name">{{item.dishName}}</text>
						<view class="item-menu-name__desc">
							{{item.skuName}}<text v-if="item.optionsText"> · {{item.optionsText}}</text>
						</view>
						<view class="item-menu-price">
							<view class="item-menu-price__color">
								<text class="item-menu-price__text">￥</text>
								{{item.price}}
							</view>
							<view>
								<u-number-box
									:min="0"
									:max="100"
									disabled-input
									:value="item.quantity"
									:long-press="false"
									color="#fff"
									@change="handleCartNumberChange(item, $event.value)"
									@plus="handleCartStep(item, 1)"
									@minus="handleCartStep(item, -1)"
								></u-number-box>
							</view>
						</view>
					</view>
				</view>
				<view class="cart-popup-footer">
					<u-button type="primary" shape="circle" @click="onConfirmCart">确认</u-button>
				</view>
			</view>
		</u-popup>

		<!-- spec popup -->
		<u-popup
			v-model="specPopup.show"
			mode="bottom"
			height="80%"
			border-radius="20"
			:mask-close-able="true"
			@close="handleCloseSpecPopup"
		>
			<view class="spec-popup">
				<view class="spec-popup__header">
					<image :src="specPopup.dish && specPopup.dish.cover ? specPopup.dish.cover : ''" mode="aspectFill"></image>
					<view>
						<view class="spec-popup__name">{{ specPopup.dish ? specPopup.dish.name : '' }}</view>
						<view class="spec-popup__desc u-line-2">{{ specPopup.dish ? specPopup.dish.description : '' }}</view>
						<view class="spec-popup__price">
							￥{{ formatPrice(specSelectedSkuPrice) }}
						</view>
					</view>
				</view>
				<scroll-view scroll-y class="spec-popup__body">
					<view class="spec-block">
						<view class="spec-block__title">规格</view>
						<view class="spec-options">
							<view
								v-for="(sku, skuIndex) in specPopupSkus"
								:key="sku.sku_id || skuIndex"
								:class="['spec-option', specPopup.selectedSkuId === sku.sku_id ? 'is-active' : '']"
								@click="handleSkuSelect(skuIndex)"
							>
								<view>{{ sku.name }}</view>
								<view class="spec-option__price">￥{{ formatPrice(sku.price) }}</view>
							</view>
						</view>
					</view>
					<view
						class="spec-block"
						v-for="(group, groupIndex) in specPopupOptionGroups"
						:key="group.group_id || groupIndex"
					>
						<view class="spec-block__title">
							{{ group.name }}
							<text class="spec-block__tip">
								{{ group.type === 'multi' ? '可多选' : '单选' }}{{ group.required ? ' · 必选' : '' }}
							</text>
						</view>
							<view class="spec-options">
								<view
									v-for="(option, optionIndex) in group.options"
									:key="option.option_id || optionIndex"
									:class="['spec-option', isOptionSelected(group, option.option_id) ? 'is-active' : '']"
									@click="handleOptionSelect(groupIndex, optionIndex)"
								>
									<view>{{ option.name }}</view>
									<view class="spec-option__price" v-if="option.price">+￥{{ formatPrice(option.price) }}</view>
								</view>
						</view>
					</view>
				</scroll-view>
				<view class="spec-popup__footer">
					<view class="spec-popup__counter">
						<u-number-box
							:min="1"
							:max="100"
							:step="1"
							color="#fff"
							:long-press="false"
							:disabled-input="true"
							v-model="specPopup.quantity"
						></u-number-box>
					</view>
					<u-button type="primary" shape="circle" @click="confirmSpecSelection">加入购物车</u-button>
				</view>
			</view>
		</u-popup>

		<!-- search popup -->
		<u-popup
			v-model="searchPopup"
			mode="bottom"
			height="80%"
			border-radius="20"
		>
			<view class="search-popup">
				<view class="search-popup__title">
					搜索 “{{ searchKeyword }}”
				</view>
				<view v-if="searchLoading" class="loader-box">
					<view class="loader-spinner"></view>
					<view class="loader-box__text">搜索中...</view>
				</view>
				<view v-else-if="!searchResults.length" class="loader-box">
					<view class="empty-box">
						<view class="empty-box__icon">?</view>
						<view class="empty-box__text">没有搜索到菜品</view>
					</view>
				</view>
				<scroll-view v-else scroll-y class="search-popup__list" show-scrollbar="false">
					<view
						class="search-result-item"
						v-for="(item, index) in searchResults"
						:key="item._id || index"
						@click="handleSearchResultTap(index)"
					>
						<image :src="item.cover" mode="aspectFill"></image>
						<view>
							<view class="search-result-item__name">{{ item.name }}</view>
							<view class="search-result-item__desc u-line-2">{{ item.description }}</view>
							<view class="search-result-item__price">￥{{ formatPrice(getFirstSkuPrice(item)) }}</view>
						</view>
					</view>
				</scroll-view>
			</view>
		</u-popup>
	</view>
</template>

<script>
	import dishService from '@/common/services/dish.js'
	import cartService from '@/common/services/cart.js'

	export default {
		data() {
			return {
				PopupShow: false,
				categories: [],
				dishesByCategory: {},
				restaurantId: 'default',
				restaurantName: '私房菜（万达广场店）',
				tableInfo: null,
				scrollTop: 0,
				current: 0,
				menuHeight: 0,
				menuItemHeight: 0,
				cartMap: {},
				cartSessionId: '',
				cartSyncTimer: null,
				cartSyncing: false,
				cartSyncFailed: false,
				cartLocalSnapshot: null,
				recommendList: [],
				loading: false,
				errorMsg: '',
				searchKeyword: '',
				searchResults: [],
				searchPopup: false,
				searchLoading: false,
				categoryLoading: '',
				highlightedDishId: '',
				sortFilters: [{
					key: 'hot',
					label: '热销',
					active: false
				},
				{
					key: 'new',
					label: '新品',
					active: false
				},
				{
					key: 'recommend',
					label: '推荐',
					active: false
				}
				],
				specPopup: {
					show: false,
					dish: null,
					selectedSkuId: '',
					selectedOptions: {},
					quantity: 1
				},
				subList: [{
					name: '堂食'
				},
				{
					name: '外卖'
				}
				],
				subCurrent: 0,
				bannerList: ['https://mp-a83aee34-7c6d-40e3-a241-85ab45b7ff6e.cdn.bspapp.com/cloudstorage/static/menu/banner-1.jpg',
					'https://mp-a83aee34-7c6d-40e3-a241-85ab45b7ff6e.cdn.bspapp.com/cloudstorage/static/menu/banner-2.jpg',
					'https://mp-a83aee34-7c6d-40e3-a241-85ab45b7ff6e.cdn.bspapp.com/cloudstorage/static/menu/banner-3.jpg'
				]
			}
		},
		computed: {
			tabbar() {
				return this.categories
			},
			currentCategoryId() {
				const currentCategory = this.categories[this.current] || null
				return currentCategory && currentCategory._id ? currentCategory._id : ''
			},
			currentCategoryName() {
				const currentCategory = this.categories[this.current] || null
				return currentCategory && currentCategory.name ? currentCategory.name : '全部菜品'
			},
			currentDishList() {
				return this.dishesByCategory[this.currentCategoryId] || []
			},
			cartItems() {
				return Object.values(this.cartMap).filter(item => Number(item.quantity) > 0)
			},
			menuNum() {
				return this.cartItems.reduce((sum, item) => sum + Number(item.quantity || 0), 0)
			},
			menuPrice() {
				return this.cartItems.reduce((sum, item) => {
					const qty = Number(item.quantity || 0)
					const unit = Number(item.price || 0)
					return sum + unit * qty
				}, 0)
			},
			specPopupSkus() {
				const dish = this.specPopup.dish
				return dish && Array.isArray(dish.skus) ? dish.skus : []
			},
			specPopupOptionGroups() {
				const dish = this.specPopup.dish
				return dish && Array.isArray(dish.option_groups) ? dish.option_groups : []
			},
			specSelectedSku() {
				const dish = this.specPopup.dish
				if (!dish || !Array.isArray(dish.skus) || !dish.skus.length) {
					return null
				}
				if (this.specPopup.selectedSkuId) {
					const match = dish.skus.find(sku => sku.sku_id === this.specPopup.selectedSkuId)
					if (match) {
						return match
					}
				}
				return dish.skus[0]
			},
			specSelectedSkuPrice() {
				return this.specSelectedSku ? Number(this.specSelectedSku.price || 0) : 0
			}
		},
		async onLoad() {
			await this.initCartSession()
			await this.initMenuData()
		},
		onUnload() {
			if (this.cartSyncTimer) {
				clearTimeout(this.cartSyncTimer)
				this.cartSyncTimer = null
			}
		},
		onShow() {
			this.subCurrent = uni.getStorageSync('subCurrent') || 0
			this.restoreCartFromStorage()
			const keyword = uni.getStorageSync('menuSearchKeyword')
			if (keyword) {
				uni.removeStorageSync('menuSearchKeyword')
				this.searchKeyword = keyword
				this.handleSearch(true)
			}
			const targetDish = uni.getStorageSync('menuTargetDish')
			if (targetDish) {
				uni.removeStorageSync('menuTargetDish')
				this.highlightDish(targetDish)
			}
		},
		methods: {
			async initCartSession() {
				let storedSession = uni.getStorageSync('cartSessionId')
				if (!storedSession) {
					storedSession = `session_${Date.now()}_${Math.random().toString(16).slice(2, 8)}`
					uni.setStorage({
						key: 'cartSessionId',
						data: storedSession
					})
				}
				this.cartSessionId = storedSession
				this.tableInfo = uni.getStorageSync('tableInfo') || {
					tableNo: 'A01',
					restaurantName: this.restaurantName,
					distance: '0.2km'
				}
				this.restoreCartFromStorage()
				try {
					const remote = await cartService.get({
						sessionId: storedSession
					})
					if (remote && Array.isArray(remote.items) && remote.items.length) {
						const localSnapshot = this.cartLocalSnapshot || {
							updated_at: 0
						}
						if (!localSnapshot.updated_at || remote.updated_at > localSnapshot.updated_at) {
							this.applyCartItems(remote.items)
							const snapshot = {
								sessionId: storedSession,
								items: remote.items,
								restaurantId: remote.restaurant_id || this.restaurantId,
								channel: remote.channel || this.getCartChannel(),
								tableNo: remote.table_no || (this.tableInfo ? this.tableInfo.tableNo : ''),
								meta: remote.meta || {},
								updated_at: remote.updated_at || Date.now()
							}
							this.cartLocalSnapshot = snapshot
							uni.setStorage({
								key: 'menuCartData',
								data: snapshot
							})
						}
					}
				} catch (err) {
					console.warn('load remote cart failed', err)
				}
			},
			restoreCartFromStorage() {
				const saved = uni.getStorageSync('menuCartData')
				if (!saved || !Array.isArray(saved.items) || !saved.items.length) {
					this.cartLocalSnapshot = {
						items: [],
						updated_at: 0
					}
					this.cartMap = {}
					return
				}
				if (
					saved.sessionId &&
					saved.sessionId !== 'local' &&
					this.cartSessionId &&
					saved.sessionId !== this.cartSessionId
				) {
					this.cartLocalSnapshot = saved
					return
				}
				this.applyCartItems(saved.items)
				this.cartLocalSnapshot = saved
			},
			applyCartItems(items = []) {
				const nextMap = {}
				items.forEach(item => {
					if (!item) return
					const qty = Number(item.quantity)
					if (!qty || qty <= 0) return
					const optionKey = this.buildOptionsKey(item.options || [])
					const key = item.key || this.buildCartKey(item.dishId, item.skuId, optionKey)
					nextMap[key] = {
						...item,
						key,
						quantity: qty,
						price: Number(item.price || 0)
					}
				})
				this.cartMap = nextMap
			},
			getCartChannel() {
				return this.subCurrent === 1 ? 'takeout' : 'dine_in'
			},
			buildCartPayload() {
				const items = this.cartItems.filter(item => Number(item.quantity) > 0)
				return {
					sessionId: this.cartSessionId || 'local',
					items,
					restaurantId: this.restaurantId,
					channel: this.getCartChannel(),
					tableNo: this.tableInfo && this.tableInfo.tableNo ? this.tableInfo.tableNo : '',
					meta: {
						restaurantName: this.restaurantName
					},
					updated_at: Date.now()
				}
			},
			persistCartLocal() {
				const payload = this.buildCartPayload()
				this.cartLocalSnapshot = payload
				if (!payload.items.length) {
					uni.removeStorageSync('menuCartData')
				} else {
					uni.setStorage({
						key: 'menuCartData',
						data: payload
					})
				}
			},
			scheduleCartSync() {
				if (!this.cartSessionId) return
				if (this.cartSyncTimer) {
					clearTimeout(this.cartSyncTimer)
				}
				this.cartSyncTimer = setTimeout(() => {
					this.syncCartRemote()
				}, 400)
			},
			async syncCartRemote() {
				if (!this.cartSessionId) return
				try {
					this.cartSyncing = true
					await cartService.sync(this.buildCartPayload())
					this.cartSyncFailed = false
				} catch (err) {
					this.cartSyncFailed = true
					console.warn('cart sync failed', err)
				} finally {
					this.cartSyncing = false
				}
			},
			handleCartChanged() {
				this.persistCartLocal()
				this.scheduleCartSync()
			},
			async initMenuData() {
				this.loading = true
				this.errorMsg = ''
				

				try {
					const categories = await dishService.listCategories({
						restaurantId: this.restaurantId
					})
					this.categories = categories
					if (categories.length) {
						await this.fetchDishes(categories[0]._id, {
							force: true
						})
					}
					this.fetchRecommend()
				} catch (err) {
					console.error('load menu failed', err)
					this.errorMsg = err.message || '菜单加载失败'
				} finally {
					this.loading = false
				}
			},
			async fetchRecommend() {
				try {
					const res = await dishService.listRecommend({
						restaurantId: this.restaurantId,
						limit: 6
					})
					this.recommendList = res || []
				} catch (err) {
					console.warn('fetch recommend failed', err)
				}
			},
			async fetchDishes(categoryId, {
				force = false
			} = {}) {
				if (!categoryId) return
				if (!force && this.dishesByCategory[categoryId]) {
					return
				}
				this.categoryLoading = categoryId
				try {
					const activeFilter = this.sortFilters.find(item => item.active)
					const params = {
						restaurantId: this.restaurantId,
						categoryId
					}
					if (activeFilter) {
						params.tag = activeFilter.key
					}
					const res = await dishService.list(params)
					this.$set(this.dishesByCategory, categoryId, res.list || [])
				} catch (err) {
					console.error('fetch dishes error', err)
					this.errorMsg = err.message || '菜单加载失败'
				} finally {
					this.categoryLoading = ''
				}
			},
			getDishQuickQuantity(dish) {
				const sku = this.getFirstSku(dish)
				if (!dish || !sku) return 0
				const key = this.buildCartKey(dish._id, sku.sku_id, 'none')
				const cartItem = this.cartMap[key]
				return cartItem ? cartItem.quantity : 0
			},
			canUseQuickNumber(dish) {
				if (!dish || !Array.isArray(dish.skus)) return false
				const hasSingleSku = dish.skus.length === 1
				const hasOptions = Array.isArray(dish.option_groups) && dish.option_groups.length > 0
				return hasSingleSku && !hasOptions
			},
			plusDish(dish) {
				if (!this.canUseQuickNumber(dish)) {
					this.selectSpec(dish)
					return
				}
				const sku = dish.skus[0]
				this.addToCart({
					dish,
					sku,
					options: [],
					quantity: 1
				})
			},
			minusDish(dish) {
				if (!this.canUseQuickNumber(dish)) {
					return
				}
				const sku = dish.skus[0]
				const key = this.buildCartKey(dish._id, sku.sku_id, 'none')
				const exist = this.cartMap[key]
				if (exist && exist.quantity > 0) {
					this.updateCartQuantity(key, exist.quantity - 1)
				}
			},
			buildOptionsKey(options = []) {
				if (!options.length) return 'none'
				const sorted = [...options].sort((a, b) => (a.optionId || '').localeCompare(b.optionId || ''))
				return sorted.map(item => item.optionId).join('_')
			},
			buildCartKey(dishId, skuId, optionsKey) {
				return `${dishId}__${skuId}__${optionsKey}`
			},
			addToCart({
				dish,
				sku,
				options = [],
				quantity = 1
			}) {
				if (!dish || !sku) return
				const optionKey = this.buildOptionsKey(options)
				const key = this.buildCartKey(dish._id, sku.sku_id, optionKey)
				const unitPrice = Number(sku.price || 0) + options.reduce((sum, opt) => sum + Number(opt.price || 0), 0)
				const exist = this.cartMap[key]
				const prevQuantity = exist ? exist.quantity : 0
				const nextQuantity = prevQuantity + quantity
				if (nextQuantity <= 0) {
					this.$delete(this.cartMap, key)
					this.handleCartChanged()
					return
				}
				const payload = {
					key,
					dishId: dish._id,
					dishName: dish.name,
					dishImg: dish.cover,
					skuId: sku.sku_id,
					skuName: sku.name,
					options,
					optionsText: options.map(opt => opt.optionName).join(' + '),
					price: Number(unitPrice.toFixed(2)),
					quantity: nextQuantity,
					desc: dish.description
				}
				this.$set(this.cartMap, key, payload)
				this.handleCartChanged()
			},
			updateCartQuantity(key, quantity) {
				if (!this.cartMap[key]) return
				if (quantity <= 0) {
					this.$delete(this.cartMap, key)
					this.handleCartChanged()
					return
				}
				this.$set(this.cartMap, key, {
					...this.cartMap[key],
					quantity
				})
				this.handleCartChanged()
			},
			MenuPopup() {
				if (this.menuNum > 0) {
					this.PopupShow = true
				}
			},
			clickEmptyShop() {
				this.cartMap = {}
				this.PopupShow = false
				this.handleCartChanged()
				if (this.cartSessionId) {
					cartService.clear({
						sessionId: this.cartSessionId
					}).catch(err => {
						console.warn('clear remote cart failed', err)
					})
				}
			},
			onConfirmCart() {
				const nextMap = {}
				Object.keys(this.cartMap).forEach(key => {
					const item = this.cartMap[key]
					if (item && Number(item.quantity) > 0) {
						nextMap[key] = item
					}
				})
				this.cartMap = nextMap
				this.handleCartChanged()
				this.PopupShow = false
			},
			handleCartNumberChange(item, value) {
				const realVal = typeof value === 'object' && value !== null ? value.value : value
				const next = Number(realVal)
				if (Number.isNaN(next)) return
				const optionsKey = this.buildOptionsKey(item.options || [])
				const targetKey = item.key || this.buildCartKey(
					item.dishId,
					item.skuId,
					optionsKey
				)
				const currentItem = targetKey ? this.cartMap[targetKey] : null
				if (next <= 0) {
					if (targetKey) {
						this.$delete(this.cartMap, targetKey)
						this.handleCartChanged()
					}
					return
				}
				if (currentItem && Number(currentItem.quantity) === next) {
					return
				}
				if (!targetKey || !currentItem) {
					// fallback：若异常缺少 key，重新构造条目
					const payload = {
						key: targetKey,
						dishId: item.dishId,
						dishName: item.dishName,
						dishImg: item.dishImg,
						skuId: item.skuId,
						skuName: item.skuName,
						options: item.options || [],
						optionsText: item.optionsText || '',
						price: Number(item.price || 0),
						quantity: next,
						desc: item.desc || ''
					}
					this.$set(this.cartMap, targetKey || this.buildCartKey(item.dishId, item.skuId, optionsKey || 'none'), payload)
					this.handleCartChanged()
					return
				}
				this.updateCartQuantity(targetKey, next)
			},
			handleCartStep(item, delta) {
				if (!item || !delta) return
				const nextVal = Math.max(0, Number(item.quantity || 0) + Number(delta))
				this.handleCartNumberChange(item, nextVal)
			},
			settlement() {
				if (!this.menuNum || !this.menuPrice) {
					return
				}
				const orderItems = this.cartItems.map(item => ({
					id: item.key,
					dishId: item.dishId,
					name: item.dishName,
					desc: item.desc,
					icon: item.dishImg,
					skuName: item.skuName,
					optionsText: item.optionsText,
					price: item.price,
					value: item.quantity
				}))
				const payload = {
					order: orderItems,
					menuPrice: this.menuPrice,
					menuNum: this.menuNum,
					channel: this.getCartChannel(),
					tableInfo: this.tableInfo,
					sessionId: this.cartSessionId,
					restaurantName: this.restaurantName
				}
				uni.setStorage({
					key: 'dishData',
					data: payload,
					success: () => {
						uni.navigateTo({
							url: `/subPack/index/indexSettlement?subCurrent=${this.subCurrent}`
						})
					}
				})
			},
			subChange(param) {
				this.subCurrent = param
				uni.setStorageSync('subCurrent', param)
			},
			async swichMenu(index) {
				if (index === this.current) return
				this.current = index
				if (this.menuHeight === 0 || this.menuItemHeight === 0) {
					await this.getElRect('menu-scroll-view', 'menuHeight')
					await this.getElRect('u-tab-item', 'menuItemHeight')
				}
				this.scrollTop = index * this.menuItemHeight + this.menuItemHeight / 2 - this.menuHeight / 2
				const category = this.categories[index]
				if (category) {
					this.fetchDishes(category._id)
				}
			},
			getElRect(elClass, dataVal) {
				return new Promise((resolve) => {
					const query = uni.createSelectorQuery().in(this)
					query.select('.' + elClass).fields({
						size: true
					}, res => {
						if (!res) {
							setTimeout(() => {
								this.getElRect(elClass, dataVal)
							}, 10)
							return
						}
						this[dataVal] = res.height
						resolve()
					}).exec()
				})
			},
			handleFilterSelect(key) {
				this.sortFilters = this.sortFilters.map(item => ({
					...item,
					active: item.key === key ? !item.active : false
				}))
				if (this.currentCategoryId) {
					this.fetchDishes(this.currentCategoryId, {
						force: true
					})
				}
			},
			async handleSearch(fromStorage = false) {
				const keyword = (this.searchKeyword || '').trim()
				if (!keyword) {
					this.searchPopup = false
					this.searchResults = []
					return
				}
				this.searchPopup = true
				this.searchLoading = true
				try {
					const res = await dishService.search({
						keyword,
						restaurantId: this.restaurantId
					})
					this.searchResults = res.list || []
					if (!fromStorage && !this.searchResults.length) {
						this.$u.toast('没有搜索到相关菜品')
					}
				} catch (err) {
					console.error('search error', err)
					this.$u.toast('搜索失败，请稍后再试')
				} finally {
					this.searchLoading = false
				}
			},
			handleSearchInput(e) {
				const value = e && e.detail ? e.detail.value : ''
				this.searchKeyword = value
			},
			handleSearchResultTap(target) {
				let dish = target
				if (typeof target === 'number') {
					dish = this.searchResults[target]
				}
				this.searchPopup = false
				if (!dish) return
				this.selectSpec(dish)
			},
			selectSpec(dish) {
				if (!dish) return
				const defaultSkuId = this.getDefaultSkuId(dish)
				this.specPopup = {
					show: true,
					dish,
					selectedSkuId: defaultSkuId,
					selectedOptions: this.initOptionSelections(dish),
					quantity: 1
				}
			},
			initOptionSelections(dish) {
				const result = {}
				;(dish.option_groups || []).forEach(group => {
					if (group.type === 'multi') {
						result[group.group_id] = []
					} else {
						result[group.group_id] = group.required && group.options.length ? group.options[0].option_id : ''
					}
				})
				return result
			},
			handleSkuSelect(payload) {
				if (typeof payload === 'number') {
					const sku = this.specPopupSkus[payload]
					if (!sku) return
					this.specPopup.selectedSkuId = sku.sku_id || ''
					return
				}
				this.specPopup.selectedSkuId = payload
			},
			isOptionSelected(group, optionId) {
				if (group.type === 'multi') {
					return (this.specPopup.selectedOptions[group.group_id] || []).includes(optionId)
				}
				return this.specPopup.selectedOptions[group.group_id] === optionId
			},
			handleOptionSelect(groupRef, optionRef) {
				let group = groupRef
				let option = optionRef
				if (typeof groupRef === 'number') {
					group = this.specPopupOptionGroups[groupRef]
				}
				if (typeof optionRef === 'number') {
					const options = (group && group.options) || []
					option = options[optionRef]
				}
				if (!group || !option) return
				const current = this.specPopup.selectedOptions[group.group_id]
				if (group.type === 'multi') {
					const list = Array.isArray(current) ? [...current] : []
					const index = list.indexOf(option.option_id)
					if (index >= 0) {
						list.splice(index, 1)
					} else {
						list.push(option.option_id)
					}
					this.$set(this.specPopup.selectedOptions, group.group_id, list)
				} else {
					this.$set(this.specPopup.selectedOptions, group.group_id, option.option_id)
				}
			},
			getSelectedOptionsList() {
				const dish = this.specPopup.dish
				if (!dish) return []
				const result = []
				;(dish.option_groups || []).forEach(group => {
					const selected = this.specPopup.selectedOptions[group.group_id]
					if (group.type === 'multi') {
						(selected || []).forEach(optionId => {
							const opt = group.options.find(o => o.option_id === optionId)
							if (opt) {
								result.push({
									groupId: group.group_id,
									groupName: group.name,
									optionId: opt.option_id,
									optionName: opt.name,
									price: Number(opt.price || 0)
								})
							}
						})
					} else if (selected) {
						const opt = group.options.find(o => o.option_id === selected)
						if (opt) {
							result.push({
								groupId: group.group_id,
								groupName: group.name,
								optionId: opt.option_id,
								optionName: opt.name,
								price: Number(opt.price || 0)
							})
						}
					}
				})
				return result
			},
			confirmSpecSelection() {
				const dish = this.specPopup.dish
				const sku = this.findSkuById(dish, this.specPopup.selectedSkuId)
				const options = this.getSelectedOptionsList()
				if (!dish || !sku) return
				this.addToCart({
					dish,
					sku,
					options,
					quantity: this.specPopup.quantity
				})
				this.specPopup.show = false
				this.$u.toast('已加入购物车')
			},
			openDishFromRecommend(dish) {
				this.selectSpec(dish)
			},
			handleCloseSpecPopup() {
				this.specPopup.show = false
			},
			async highlightDish({
				dishId,
				categoryId
			}) {
				if (!dishId || !categoryId) return
				const index = this.categories.findIndex(cat => cat._id === categoryId)
				if (index >= 0) {
					this.current = index
					await this.fetchDishes(categoryId)
					this.$nextTick(() => {
						this.highlightedDishId = dishId
						setTimeout(() => {
							this.highlightedDishId = ''
						}, 2000)
					})
				}
			},
			formatPrice(price) {
				const num = Number(price) || 0
				return num.toFixed(2)
			},
			getFirstSku(dish) {
				if (!dish || !Array.isArray(dish.skus) || !dish.skus.length) {
					return null
				}
				return dish.skus[0]
			},
			getFirstSkuPrice(dish) {
				const sku = this.getFirstSku(dish)
				return sku ? Number(sku.price || 0) : 0
			},
			getDefaultSkuId(dish) {
				const sku = this.getFirstSku(dish)
				return sku && sku.sku_id ? sku.sku_id : ''
			},
			findSkuById(dish, skuId) {
				if (!dish || !Array.isArray(dish.skus) || !dish.skus.length) {
					return null
				}
				if (!skuId) {
					return dish.skus[0]
				}
				const match = dish.skus.find(item => item.sku_id === skuId)
				return match || dish.skus[0]
			}
		}
	}
</script>

<style lang="scss" scoped>
	.u-wrap {
		height: calc(100vh);
		/* #ifdef H5 */
		height: calc(100vh - var(--window-top));
		/* #endif */
		display: flex;
		flex-direction: column;
	}

	.header {
		display: flex;
		justify-content: space-between;
		padding: 30rpx;

		&__title {
			font-weight: bold;
			font-size: 30rpx;
		}

		&__info {
			font-size: 24rpx;
			color: $u-type-info;
			margin-top: 15rpx;
		}

		&__name {
			margin-right: 15rpx;
		}
	}

	.menu-tools {
		padding: 0 30rpx 20rpx;

		.menu-search {
			display: flex;
			align-items: center;
			background: #f6f7fb;
			border-radius: 60rpx;
			padding: 0 20rpx;
			height: 70rpx;

			&__input {
				flex: 1;
				margin: 0 12rpx;
				font-size: 26rpx;
				border: none;
				background: transparent;
				outline: none;
			}

			&__action {
				font-size: 26rpx;
				color: #ee2f37;
			}
		}

		&__tags {
			display: flex;
			margin-top: 20rpx;
			flex-wrap: wrap;
		}

		&__tag {
			font-size: 24rpx;
			padding: 10rpx 24rpx;
			border-radius: 999rpx;
			border: 1rpx solid #f0f0f0;
			margin-right: 20rpx;
			margin-bottom: 10rpx;
			color: #666;
		}

		&__tag.is-active {
			color: #fff;
			border-color: #EE2F37;
			background-color: #EE2F37;
		}
	}

	.recommend-section {
		padding: 0 30rpx 20rpx;

		&__header {
			display: flex;
			justify-content: space-between;
			align-items: flex-end;
		}

		&__title {
			font-size: 30rpx;
			font-weight: bold;
		}

		&__subtitle {
			font-size: 22rpx;
			color: $u-type-info;
		}

		&__scroll {
			margin-top: 20rpx;
			white-space: nowrap;
		}
	}

	.recommend-card {
		width: 240rpx;
		display: inline-flex;
		flex-direction: column;
		margin-right: 20rpx;
		background-color: #fff7f5;
		border-radius: 20rpx;
		padding: 20rpx;

		image {
			width: 200rpx;
			height: 170rpx;
			border-radius: 14rpx;
		}

		&__name {
			font-size: 26rpx;
			font-weight: 600;
			margin: 15rpx 0 10rpx 0;
		}

		&__price {
			color: #EE2F37;
			font-size: 32rpx;
			font-weight: 600;

			text {
				font-size: 24rpx;
			}
		}
	}

	.menuimg {
		margin-bottom: 10rpx;
	}

	.u-menu-wrap {
		flex: 1;
		display: flex;
		overflow: hidden;
	}

	.u-tab-view {
		width: 200rpx;
		height: 100%;
		background-color: #FFFFFF;
	}

	.tabMenu-name {
		text-align: center;
		padding: 0 10rpx;
	}

	.u-tab-item {
		height: 160rpx;
		background: #FFFFFF;
		box-sizing: border-box;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		font-size: 22rpx;
		color: #8D9699;
		line-height: 1;
	}

	.u-tab-item-active {
		position: relative;
		color: #EE2F37;
		font-size: 22rpx;
		font-weight: 600;
		background: #FAFAFA;
	}

	.u-tab-item-active::before {
		content: "";
		position: absolute;
		border-left: 2px solid #EE2F37;
		height: 160rpx;
		left: 0;
		top: 0;
	}

	.right-box {
		background-color: #FAFAFA;
	}

	.page-view {
		padding: 16rpx;
		padding-bottom: 220rpx;
	}

	.current-category-title {
		font-size: 28rpx;
		font-weight: bold;
		margin-bottom: 20rpx;
		padding-left: 10rpx;
	}

	.class-item {
		margin-bottom: 30rpx;
		padding: 0 16rpx;
	}

	.class-item-box {
		display: flex;
		background-color: white;
		padding: 20rpx;
		margin-bottom: 20rpx;
		box-shadow: 2px 0px 8px 0px rgba(244, 244, 245, 0.75);
		border-radius: 14rpx;
		transition: box-shadow 0.2s ease-in-out;
	}

	.class-item-box.is-highlight {
		box-shadow: 0 0 0 4rpx rgba(238, 47, 55, 0.15);
	}

	.item-menu-name {
		display: flex;
		flex-direction: column;
		margin-left: 20rpx;
		width: 100%;

		&__header {
			display: flex;
			justify-content: space-between;
			align-items: flex-start;
		}

		&__name {
			font-weight: bold;
			font-size: 30rpx;
		}

		&__tags {
			display: flex;
			flex-wrap: wrap;
			justify-content: flex-end;
		}

		&__tag {
			margin-left: 10rpx;
		}

		&__desc {
			margin: 20rpx 0;
			font-size: 20rpx;
			color: $u-type-info;
		}
	}

	.item-menu-price {
		display: flex;
		justify-content: space-between;
		align-items: center;

		&__color {
			font-weight: bold;
			font-size: 36rpx;
			color: #EE2F37;
		}

		&__text {
			font-size: 22rpx;
		}

		&__spec {
			color: #EE2F37;
			font-size: 24rpx;
			padding: 12rpx 30rpx;
			border-radius: 40rpx;
			border: 1rpx solid rgba(238, 47, 55, 0.4);
		}
	}

	.item-menu-image {
		width: 50%;
		height: 160rpx;
		border-radius: 20rpx;
	}

	.item-menu-images {
		width: 30%;
		height: 130rpx;
		border-radius: 20rpx;
	}

	.loader-box {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 60rpx 0;
		min-height: 200rpx;

		&__text{
			margin-top: 20rpx;
			font-size: 26rpx;
			color: $u-type-info;
		}

		.u-button {
			margin-top: 20rpx;
		}
	}

	.loader-spinner{
		width: 64rpx;
		height: 64rpx;
		border-radius: 50%;
		border: 6rpx solid rgba(238,47,55,0.15);
		border-top-color: #EE2F37;
		animation: loader-spin 0.9s linear infinite;
	}

	@keyframes loader-spin{
		0%{
			transform: rotate(0deg);
		}
		100%{
			transform: rotate(360deg);
		}
	}

	.empty-box{
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;

		&__icon{
			font-size: 60rpx;
			color: #dcdfe6;
		}

		&__text{
			margin-top: 10rpx;
			font-size: 24rpx;
			color: $u-type-info;
		}
	}

	.u-bottom {
		position: fixed;
		z-index: 7777;
		/* #ifdef MP-WEIXIN */
		bottom: 30rpx;
		/* #endif */
		/* #ifdef H5 */
		bottom: 130rpx;
		/* #endif */
		width: 92%;
		left: 0;
		right: 0;
		margin: 0 auto;
		display: flex;
		box-shadow: 2px 0px 8px 0px rgba(200, 201, 204, 0.75);
		border-radius: 14rpx;
		background-color: white;

		&--disabled {
			opacity: 0.8;
		}

		&__bags {
			position: relative;
			padding-right: 10rpx;
		}

		&__price {
			font-weight: bold;
			font-size: 40rpx;
			margin-left: 20rpx;

			text {
				font-size: 24rpx;
			}
		}

		&__nums {
			border-left: 1px solid #303133;
			font-size: 24rpx;
			margin-left: 20rpx;
			padding-left: 20rpx;
			font-weight: bold;
		}

		&__wrap,
		&__place {
			display: flex;
			color: #303133;
		}

		&__wrap {
			width: 70%;
			padding: 20rpx 0 20rpx 30rpx;
			align-items: center;
		}

		&__place {
			background-color: #EE2F37;
			width: 30%;
			text-align: center;
			flex-direction: column;
			justify-content: center;
			font-size: 32rpx;
			font-weight: bold;
			color: white;
			border-top-right-radius: 14rpx;
			border-bottom-right-radius: 14rpx;

			&.is-disabled {
				background-color: #f0f0f0;
				color: #999;
			}
		}
	}

	.popup-wrap {
		margin: 20rpx 30rpx 0 30rpx;
		padding-bottom: 30rpx;
	}
	.cart-popup-footer{
		position: sticky;
		bottom: 0;
		background-color: #fff;
		padding: 20rpx 30rpx 40rpx;
		box-shadow: 0 -6rpx 20rpx rgba(0,0,0,0.05);
	}
	.cart-popup-footer .u-button{
		width: 100%;
		height: 80rpx;
		line-height: 80rpx;
		font-size: 30rpx;
	}

	.emptyShop {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		background-color: #fff;
		color: $u-type-info;
		font-size: 24rpx;
		border-bottom: 1px solid #f3f4f6;
		z-index: 2;
		padding: 20rpx;
		display: flex;
		justify-content: flex-end;

		&__icon {
			margin-right: 20rpx;
		}
	}

	.menulist {
		display: flex;
		margin-bottom: 30rpx;
	}

	.spec-popup {
		display: flex;
		flex-direction: column;
		height: 100%;

		&__header {
			display: flex;
			padding: 30rpx;

			image {
				width: 180rpx;
				height: 180rpx;
				border-radius: 20rpx;
				margin-right: 30rpx;
			}
		}

		&__name {
			font-size: 32rpx;
			font-weight: bold;
		}

		&__desc {
			font-size: 24rpx;
			color: $u-type-info;
			margin: 10rpx 0;
		}

		&__price {
			color: #EE2F37;
			font-size: 36rpx;
			font-weight: bold;
		}

		&__body {
			flex: 1;
			padding: 0 30rpx;
		}

		&__footer {
			display: flex;
			justify-content: space-between;
			align-items: center;
			padding: 20rpx 30rpx 40rpx;
			gap: 20rpx;
		}

		&__counter{
			flex: 1;
			display: flex;
			align-items: center;
		}

		&__footer .u-button{
			width: 60%;
			height: 80rpx;
			line-height: 80rpx;
			font-size: 28rpx;
		}
	}

	.spec-popup__counter ::v-deep .u-number-box{
		width: auto;
		background: transparent;
		padding: 0;
		display: flex;
		align-items: center;
	}

	.spec-popup__counter ::v-deep .u-number-box__minus,
	.spec-popup__counter ::v-deep .u-number-box__plus{
		width: 56rpx;
		height: 56rpx;
		border-radius: 16rpx;
		background: #f2f3f5;
		color: #ffffff;
		font-weight: 600;
		margin: 0 10rpx;
		border: none;
		box-shadow: none;
	}

	.spec-popup__counter ::v-deep .u-number-box__minus{
		color: #d3d4d6;
	}

	.spec-popup__counter ::v-deep .u-number-box__plus{
		color: #ffffff;
	}

	.spec-popup__counter ::v-deep .u-number-box__input{
		background: transparent;
		font-size: 30rpx;
		font-weight: 600;
		min-width: 50rpx;
		text-align: center;
		color: #333;
	}

	.spec-block {
		margin-bottom: 30rpx;

		&__title {
			font-size: 28rpx;
			font-weight: bold;
			margin-bottom: 20rpx;
			display: flex;
			align-items: center;
		}

		&__tip {
			font-size: 22rpx;
			color: $u-type-info;
			margin-left: 10rpx;
		}
	}

	.spec-options {
		display: flex;
		flex-wrap: wrap;
		gap: 20rpx;
	}

	.spec-option {
		padding: 20rpx;
		border-radius: 18rpx;
		border: 1rpx solid #ededed;
		min-width: 200rpx;
		text-align: center;
		font-size: 26rpx;
		color: #333;

		&__price {
			font-size: 22rpx;
			color: $u-type-info;
			margin-top: 6rpx;
		}
	}

	.spec-option.is-active {
		border-color: #EE2F37;
		background-color: rgba(238, 47, 55, 0.08);
		color: #EE2F37;
	}

	.search-popup {
		height: 100%;
		display: flex;
		flex-direction: column;
		padding: 30rpx;

		&__title {
			font-size: 30rpx;
			font-weight: bold;
		}

		&__list {
			flex: 1;
			margin-top: 20rpx;
		}
	}

	.search-result-item {
		display: flex;
		margin-bottom: 20rpx;
		background-color: #fff5f5;
		border-radius: 20rpx;
		padding: 20rpx;

		image {
			width: 160rpx;
			height: 130rpx;
			border-radius: 14rpx;
			margin-right: 20rpx;
		}

		&__name {
			font-size: 28rpx;
			font-weight: bold;
		}

		&__desc {
			font-size: 24rpx;
			color: $u-type-info;
			margin: 8rpx 0;
		}

		&__price {
			color: #EE2F37;
			font-weight: bold;
		}
	}

	.scroll-safe-bottom {
		height: 240rpx;
	}
</style>
