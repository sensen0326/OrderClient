<template>
	<view>
		<!-- header start -->
		<view>
			<u-swiper
				:list="bannerSwiperList"
				mode="rect"
				height="700"
				border-radius="0"
				@click="handleBannerTap"
			></u-swiper>
		</view>
		<!-- header end -->

		<!-- search start -->
		<view class="index-search">
			<view class="index-search__bar">
				<u-icon name="search" size="32" color="#999"></u-icon>
				<input
					class="index-search__input"
					:value="searchKeyword"
					placeholder="试试搜索：干煸芸豆"
					confirm-type="search"
					@input="handleSearchInput"
					@confirm="handleSearch"
				/>
				<view class="index-search__action" @click="handleSearch">搜索</view>
			</view>
		</view>
		<!-- search end -->

		<!-- body start -->
		<view class="body">
			<u-grid :col="2" :border="false">
				<u-grid-item v-for="item in entryCardList" :key="item.title" @click="handleEntryAction(item)">
					<u-image :src="item.image" width="150" height="150"></u-image>
					<view class="body__text">{{ item.title }}</view>
				</u-grid-item>
			</u-grid>
		</view>
		<!-- body end -->

		<u-gap height="20" bg-color="#fafafa"></u-gap>

		<view class="table-status-card" v-if="tableInfo">
			<view class="table-status-card__top">
				<view>
					<view class="table-status-card__title">当前桌号 {{ tableInfo.tableNo }}</view>
					<view class="table-status-card__desc">
						状态：{{ tableStatusText }}
					</view>
				</view>
				<u-button size="mini" type="primary" @click="callWaiter">呼叫服务</u-button>
			</view>
			<view class="table-status-card__meta">
				用餐人数 {{ tableInfo.peopleCount || peopleCount }} 人
			</view>
		</view>

		<view class="queue-card">
			<view class="queue-card__left">
				<view class="queue-card__title">排队取号</view>
				<view class="queue-card__desc">当前等待 {{ queueStats.waiting || 0 }} 桌</view>
				<view v-if="queueTicket" class="queue-card__ticket">我的号：{{ queueTicket.ticketNo }}</view>
			</view>
			<view class="queue-card__actions">
				<u-button size="mini" type="primary" @click="openQueuePopup">取号</u-button>
				<u-button size="mini" plain @click="openReservationPopup">预约</u-button>
			</view>
		</view>

		<!-- integral start -->
		<view class="integral" v-if="integralCard">
			<view>
				<u-image :src="integralCard.image" width="200" height="200"></u-image>
			</view>
			<view>
				<view class="integral__nav">{{ integralCard.title }}</view>
				<view class="integral__desc">{{ integralCard.desc }}</view>
				<u-button size="mini" plain type="primary" @click="handleOperationAction(integralCard, 'campaign')">查看详情</u-button>
			</view>
		</view>
		<!-- integral end -->

		<u-gap height="20" bg-color="#fafafa"></u-gap>

		<!-- recommend list -->
		<view class="index-recommend" v-if="recommendList.length">
			<view class="index-recommend__header">
				<view class="index-recommend__title">热卖推荐</view>
				<view class="index-recommend__more" @click="orderFood(0)">更多</view>
			</view>
			<scroll-view scroll-x show-scrollbar="false">
				<view
					class="index-recommend__item"
					v-for="item in recommendList"
					:key="item._id"
					@click="viewDish(item)"
				>
					<image :src="item.cover" mode="aspectFill"></image>
					<view class="index-recommend__name">{{ item.name }}</view>
					<view class="index-recommend__price">￥{{ formatPrice(getFirstSkuPrice(item)) }}</view>
				</view>
			</scroll-view>
		</view>
		<!-- recommend end -->

		<!-- grids -->
		<view>
			<u-grid :col="3" :border="false">
				<u-grid-item v-for="card in guideCardList" :key="card.title" @click="handleCardClick(card)">
					<view class="grid-text">{{ card.title }}</view>
					<view class="grid-desc">{{ card.desc }}</view>
					<u-image :src="card.image" width="120" height="120"></u-image>
				</u-grid-item>
			</u-grid>
		</view>

		<u-popup v-model="queuePopup" mode="bottom" height="55%" border-radius="20">
			<view class="queue-popup">
				<view class="queue-popup__title">排队取号</view>
				<view class="queue-popup__row">
					<text>就餐人数</text>
					<u-number-box
						:min="1"
						:max="12"
						:step="1"
						:value="queueForm.people"
						@change="val => (queueForm.people = Number(val.value))"
					></u-number-box>
				</view>
				<view class="queue-popup__row">
					<input
						class="queue-popup__input"
						placeholder="手机号（选填，便于通知）"
						:value="queueForm.mobile"
						@input="e => (queueForm.mobile = e.detail.value)"
					/>
				</view>
				<u-button type="primary" @click="submitQueue" :loading="queueLoading">提交取号</u-button>
			</view>
		</u-popup>

		<u-popup v-model="reservationPopup" mode="bottom" height="65%" border-radius="20">
			<view class="queue-popup">
				<view class="queue-popup__title">预约到店</view>
				<view class="queue-popup__row">
					<text>就餐人数</text>
					<u-number-box
						:min="1"
						:max="12"
						:step="1"
						:value="reservationForm.people"
						@change="val => (reservationForm.people = Number(val.value))"
					></u-number-box>
				</view>
				<view class="queue-popup__row">
					<input
						class="queue-popup__input"
						placeholder="日期，如 2025-12-06"
						:value="reservationForm.date"
						@input="e => (reservationForm.date = e.detail.value)"
					/>
				</view>
				<view class="queue-popup__row">
					<input
						class="queue-popup__input"
						placeholder="时间，如 18:30"
						:value="reservationForm.time"
						@input="e => (reservationForm.time = e.detail.value)"
					/>
				</view>
				<view class="queue-popup__row">
					<input
						class="queue-popup__input"
						placeholder="手机号（选填）"
						:value="reservationForm.mobile"
						@input="e => (reservationForm.mobile = e.detail.value)"
					/>
				</view>
				<u-button type="primary" @click="submitReservation" :loading="reservationLoading">提交预约</u-button>
			</view>
		</u-popup>
	</view>
</template>

<script>
import dishService from '@/common/services/dish.js'
import tableService from '@/common/services/table.js'
import queueService from '@/common/services/queue.js'
import operationService from '@/common/services/operation.js'
import analyticsService from '@/common/services/analytics.js'

const TAB_PAGES = ['/pages/index/index', '/pages/menu/menu', '/pages/order/list', '/pages/my/my']

export default {
	data() {
		return {
			defaultBanners: [
				{
					title: '安心材料，品质火锅',
					image: 'https://mp-a83aee34-7c6d-40e3-a241-85ab45b7ff6e.cdn.bspapp.com/cloudstorage/static/index/banner.jpg',
					action: 'tab',
					target: '/pages/menu/menu'
				}
			],
			defaultEntries: [
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
			],
			defaultGuideCards: [
				{
					title: '积分商城',
					desc: '好多神秘好礼等你',
					image: 'https://mp-a83aee34-7c6d-40e3-a241-85ab45b7ff6e.cdn.bspapp.com/cloudstorage/static/index/integralShop.png',
					action: 'page',
					target: '/pages/my/my'
				},
				{
					title: '会员中心',
					desc: '享受会员的专属权益',
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
			],
			operationBanners: [],
			operationEntries: [],
			operationCards: [],
			operationCampaigns: [],
			searchKeyword: '',
			recommendList: [],
			tableNo: '',
			peopleCount: 2,
			isSwitching: false,
			tableInfo: null,
			tableStatusLoading: false,
			queueStats: {
				waiting: 0
			},
			queuePopup: false,
			queueForm: {
				people: 2,
				mobile: ''
			},
			queueTicket: null,
			queueLoading: false,
			reservationPopup: false,
			reservationForm: {
				people: 2,
				date: '',
				time: '',
				mobile: ''
			},
			reservationLoading: false
		}
	},
	onLoad(options) {
		this.handleEntryParams(options || {})
		this.tableInfo = tableService.getLocal() || null
		if (this.tableInfo && this.tableInfo.tableNo) {
			this.fetchTableStatus()
		}
		analyticsService.track('page_view', {
			page: 'home'
		})
	},
	onShow() {
		this.loadRecommend()
		this.fetchQueueStats()
		this.loadOperationSlots()
	},
	computed: {
		bannerSourceList() {
			return this.operationBanners.length ? this.operationBanners : this.defaultBanners
		},
		bannerSwiperList() {
			return this.bannerSourceList.map(item => ({
				image: item.image,
				title: item.title
			}))
		},
		entryCardList() {
			return this.operationEntries.length ? this.operationEntries : this.defaultEntries
		},
		guideCardList() {
			return this.operationCards.length ? this.operationCards : this.defaultGuideCards
		},
		integralCard() {
			const list = this.operationCampaigns.length ? this.operationCampaigns : []
			if (list.length) return list[0]
			return {
				title: '积分加油站',
				desc: '可兑换现金优惠券和周边礼品',
				image: 'https://mp-a83aee34-7c6d-40e3-a241-85ab45b7ff6e.cdn.bspapp.com/cloudstorage/static/index/integral.jpg',
				action: 'page',
				target: '/pages/my/my'
			}
		},
		tableStatusText() {
			if (!this.tableInfo) return '未绑定'
			switch (this.tableInfo.status) {
				case 'occupied':
					return '已就座'
				case 'cleaning':
					return '清理中'
				case 'idle':
				default:
					return '空闲'
			}
		}
	},
	methods: {
		async loadOperationSlots() {
			try {
				const slots = await operationService.fetchSlots(['home_banner', 'home_entry', 'home_cards', 'home_campaign'])
				this.operationBanners = (slots.home_banner && slots.home_banner.items) || []
				this.operationEntries = (slots.home_entry && slots.home_entry.items) || []
				this.operationCards = (slots.home_cards && slots.home_cards.items) || []
				this.operationCampaigns = (slots.home_campaign && slots.home_campaign.items) || []
			} catch (err) {
				console.warn('load operation slots failed', err)
				this.operationBanners = []
				this.operationEntries = []
				this.operationCards = []
				this.operationCampaigns = []
			}
		},
		async loadRecommend() {
			try {
				const list = await dishService.listRecommend({
					restaurantId: 'default',
					limit: 5
				})
				this.recommendList = list || []
			} catch (error) {
				console.warn('load recommend failed', error)
				this.recommendList = []
			}
		},
		async handleEntryParams(options) {
			let tableFromQuery = options.table || options.tableNo || options.t || ''
			const scene = options.scene ? decodeURIComponent(options.scene) : ''
			if (scene) {
				const pairs = scene.split('&')
				pairs.forEach(item => {
					const [key, value] = item.split('=')
					if (key && value && ['table', 'tableNo', 't'].includes(key)) {
						tableFromQuery = value
					}
				})
				if (!tableFromQuery && scene.toLowerCase().startsWith('table')) {
					tableFromQuery = scene.replace(/^table/gi, '')
				}
			}

			if (tableFromQuery) {
				this.tableNo = tableFromQuery
				uni.setStorageSync('tableNo', tableFromQuery)
				const cachedPeople = Number(uni.getStorageSync('peopleCount') || this.peopleCount || 2)
				try {
					const res = await tableService.open({
						tableNo: tableFromQuery,
						peopleCount: cachedPeople
					})
					if (res && res.tableInfo) {
						this.tableInfo = res.tableInfo
						this.peopleCount = res.tableInfo.peopleCount || cachedPeople
						this.orderFood(0)
						return
					}
				} catch (err) {
					console.warn('auto bind table failed', err)
				}
				this.tableInfo = Object.assign({}, this.tableInfo || {}, { tableNo: tableFromQuery })
				this.orderFood(0)
				this.fetchTableStatus()
			}
		},
		orderFood(tabIndex) {
			uni.setStorageSync('subCurrent', tabIndex)
			analyticsService.track('order_entry_click', {
				channel: tabIndex === 0 ? 'dine_in' : 'takeout'
			})
			if (this.isSwitching) return
			this.isSwitching = true
			uni.switchTab({
				url: '/pages/menu/menu',
				complete: () => {
					this.isSwitching = false
				}
			})
		},
		handleSearch() {
			const keyword = (this.searchKeyword || '').trim()
			if (!keyword) {
				this.$u.toast('请输入菜品或口味')
				return
			}
			uni.setStorageSync('menuSearchKeyword', keyword)
			analyticsService.track('search', {
				page: 'home',
				keyword
			})
			this.orderFood(0)
		},
		handleSearchInput(e) {
			const value = e && e.detail ? e.detail.value : ''
			this.searchKeyword = value
		},
		viewDish(dish) {
			if (!dish) return
			uni.setStorageSync('menuTargetDish', {
				dishId: dish._id,
				categoryId: dish.category_id
			})
			analyticsService.track('recommend_click', {
				dishId: dish._id,
				name: dish.name
			})
			this.orderFood(0)
		},
		handleBannerTap(e) {
			const index = typeof e === 'number' ? e : (e && e.detail ? e.detail.current : 0)
			const banner = this.bannerSourceList[index]
			this.handleOperationAction(banner, 'banner')
		},
		handleEntryAction(item) {
			this.handleOperationAction(item, 'entry')
		},
		handleCardClick(item) {
			this.handleOperationAction(item, 'card')
		},
		handleOperationAction(item = {}, source = 'slot') {
			if (!item) return
			analyticsService.track('operation_click', {
				source,
				title: item.title,
				action: item.action,
				target: item.target
			})
			const action = item.action || 'tab'
			if (action === 'dine_in') {
				this.orderFood(0)
				return
			}
			if (action === 'takeout') {
				this.orderFood(1)
				return
			}
			if ((action === 'tab' || action === 'page' || action === 'url') && item.target) {
				this.navigateSmart(item.target)
				return
			}
		},
		navigateSmart(url) {
			if (!url) return
			if (TAB_PAGES.includes(url)) {
				uni.switchTab({ url })
			} else {
				uni.navigateTo({ url })
			}
		},
		formatPrice(price) {
			const num = Number(price) || 0
			return num.toFixed(2)
		},
		getFirstSkuPrice(dish) {
			if (!dish || !Array.isArray(dish.skus) || !dish.skus.length) {
				return 0
			}
			const sku = dish.skus[0]
			return Number(sku.price || 0)
		},
		async fetchTableStatus() {
			if (this.tableStatusLoading) return
			const tableNo = this.tableNo || (this.tableInfo && this.tableInfo.tableNo)
			if (!tableNo) return
			this.tableStatusLoading = true
			try {
				const res = await tableService.status({
					tableNo
				})
				if (res && res.table) {
					this.tableInfo = res.table
				}
			} catch (err) {
				console.warn('fetch table status failed', err)
			} finally {
				this.tableStatusLoading = false
			}
		},
		async callWaiter() {
			if (!this.tableInfo || !this.tableInfo.tableNo) {
				this.$u.toast('请先扫码或绑定桌号')
				return
			}
			try {
				await tableService.callService({
					tableNo: this.tableInfo.tableNo,
					sessionId: this.tableInfo.sessionId,
					type: 'service'
				})
				this.$u.toast('已通知服务员')
			} catch (err) {
				console.warn('call waiter failed', err)
				this.$u.toast(err.message || '呼叫失败')
			}
		},
		openQueuePopup() {
			this.queuePopup = true
		},
		async submitQueue() {
			if (this.queueLoading) return
			this.queueLoading = true
			try {
				const res = await queueService.take({
					partySize: this.queueForm.people,
					contact: this.queueForm.mobile
				})
				this.queueTicket = res
				this.queuePopup = false
				this.$u.toast(`取号成功：${res.ticketNo}`)
				this.fetchQueueStats()
			} catch (err) {
				console.warn('queue failed', err)
				this.$u.toast(err.message || '取号失败')
			} finally {
				this.queueLoading = false
			}
		},
		async fetchQueueStats() {
			try {
				const stats = await queueService.stats()
				this.queueStats = stats || { waiting: 0 }
			} catch (err) {
				console.warn('fetch queue stats failed', err)
				this.queueStats = { waiting: 0 }
			}
		},
		openReservationPopup() {
			this.reservationPopup = true
		},
		async submitReservation() {
			if (this.reservationLoading) return
			if (!this.reservationForm.date || !this.reservationForm.time) {
				this.$u.toast('请输入到店日期与时间')
				return
			}
			this.reservationLoading = true
			try {
				const arriveTime = `${this.reservationForm.date} ${this.reservationForm.time}`
				await queueService.reserve({
					partySize: this.reservationForm.people,
					contact: this.reservationForm.mobile,
					arriveTime
				})
				this.$u.toast('预约成功')
				this.reservationPopup = false
			} catch (err) {
				console.warn('reserve failed', err)
				this.$u.toast(err.message || '预约失败')
			} finally {
				this.reservationLoading = false
			}
		}
	}
}
</script>

<style lang="scss">
.index-search {
	margin: 0 30rpx;
	transform: translateY(-40rpx);

	&__bar {
		display: flex;
		align-items: center;
		background: #f6f7fb;
		border-radius: 60rpx;
		padding: 0 20rpx;
		height: 70rpx;
	}

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

	.index-recommend {
		margin: 20rpx 30rpx;
		padding: 20rpx;
		background: #fff7f5;
		border-radius: 20rpx;

		&__header {
			display: flex;
			justify-content: space-between;
			align-items: center;
			margin-bottom: 10rpx;
		}

		&__title {
			font-size: 30rpx;
			font-weight: bold;
		}

		&__more {
			font-size: 24rpx;
			color: #ee2f37;
		}

		scroll-view {
			white-space: nowrap;
		}

		&__item {
			display: inline-flex;
			flex-direction: column;
			width: 220rpx;
			margin-right: 20rpx;
			background: #fff;
			border-radius: 16rpx;
			padding: 20rpx;

			image {
				width: 180rpx;
				height: 150rpx;
				border-radius: 12rpx;
				margin-bottom: 10rpx;
			}
		}

		&__name {
			font-size: 26rpx;
			font-weight: 600;
		}

		&__price {
			color: #ee2f37;
			font-weight: bold;
			margin-top: 6rpx;
		}
	}

	.body {
		position: relative;
		z-index: 1;
		margin: -40rpx 30rpx 0 30rpx;
		padding: 0 15rpx;
		background-color: #fff;
		border-radius: 14rpx;

		&__text {
			font-weight: bold;
			font-size: 30rpx;
			margin-top: 15rpx;
		}
	}

	.integral {
		display: flex;
		align-items: flex-end;
		padding: 20rpx;

		&__nav {
			color: $u-main-color;
			font-weight: bold;
			margin-bottom: 20rpx;
			font-size: 30rpx;

			text {
				font-size: 38rpx;
			}
		}

		&__desc {
			font-size: 24rpx;
			color: $u-type-info;
			margin-bottom: 10rpx;
		}
	}

	.grid-text {
		font-size: 38rpx;
		font-weight: bold;
	}

	.grid-desc {
		font-size: 24rpx;
		color: $u-type-info;
		margin-bottom: 30rpx;
	}

	.table-status-card {
		margin: 0 30rpx 20rpx;
		padding: 30rpx;
		background: #fff;
		border-radius: 20rpx;
		box-shadow: 0 8rpx 26rpx rgba(0, 0, 0, 0.05);

		&__top {
			display: flex;
			justify-content: space-between;
			align-items: center;
		}

		&__title {
			font-size: 32rpx;
			font-weight: bold;
		}

		&__desc {
			color: #909399;
			font-size: 24rpx;
			margin-top: 6rpx;
		}

		&__meta {
			margin-top: 10rpx;
			font-size: 26rpx;
			color: #303133;
		}
	}

	.queue-card {
		margin: 0 30rpx 20rpx;
		padding: 24rpx 30rpx;
		background: linear-gradient(135deg, #ffe9e5, #fff5f3);
		border-radius: 20rpx;
		display: flex;
		justify-content: space-between;
		align-items: center;

		&__title {
			font-size: 30rpx;
			font-weight: bold;
			color: #ee2f37;
		}

		&__desc {
			font-size: 24rpx;
			color: #606266;
		}

		&__ticket {
			margin-top: 8rpx;
			font-size: 26rpx;
			font-weight: bold;
		}

		&__actions {
			display: flex;
			gap: 16rpx;
		}
	}

	.queue-popup {
		padding: 40rpx;

		&__title {
			font-size: 32rpx;
			font-weight: bold;
			margin-bottom: 20rpx;
		}

		&__row {
			margin-bottom: 24rpx;
			display: flex;
			align-items: center;
			justify-content: space-between;

			text {
				font-size: 28rpx;
				font-weight: 500;
			}
		}

		&__input {
			width: 100%;
			border: 1px solid #f0f0f0;
			border-radius: 16rpx;
			padding: 20rpx;
			font-size: 28rpx;
		}
	}
</style>
