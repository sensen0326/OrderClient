<template>
	<view class="order-page">
		<view class="order-filter">
			<u-search
				v-model="searchKeyword"
				placeholder="搜索订单号"
				shape="round"
				:bg-color="'#f6f7fb'"
				:show-action="false"
				@search="handleSearch"
				@custom="handleSearch"
				@clear="handleClear"
			></u-search>
			<u-tabs
				class="order-tabs"
				:list="statusTabs"
				:current="currentTabIndex"
				@change="handleStatusChange"
				active-color="#EE2F37"
				:scroll="false"
			></u-tabs>
		</view>

		<view v-if="!isLoggedIn" class="order-hint">
			<view class="order-empty-text">请先登录后查看订单</view>
			<u-button type="primary" size="mini" @click="goLogin">去登录</u-button>
		</view>
		<view v-else-if="loading" class="order-hint">订单加载中...</view>
		<view v-else-if="!orderList.length" class="order-hint">暂无订单，去下单体验吧～</view>
		<view v-else>
			<view class="order-card" v-for="order in orderList" :key="order.order_no" @click="viewDetail(order)">
				<view class="order-card__header">
					<view class="order-card__channel">
						<u-tag :text="order.channelText" size="mini" type="error" shape="circle"></u-tag>
						<text class="order-card__address">{{ order.addressText }}</text>
					</view>
					<view class="order-card__status">{{ order.statusText }}</view>
				</view>
				<view class="order-card__meta">
					<text>订单号：{{ order.order_no }}</text>
					<text>{{ formatTime(order.created_at) }}</text>
				</view>
				<view class="order-card__items">
					<view class="menulist" v-for="(item, idx) in order.items" :key="idx">
						<image class="item-menu-image" :src="item.icon || defaultDishImage" mode="aspectFill"></image>
						<view class="item-menu-name">
							<text class="item-menu-name__name">{{ item.name }}</text>
							<view class="item-menu-name__desc u-line-2">{{ item.desc }}</view>
							<view class="item-menu-price">
								<view class="item-menu-price__color">
									<text class="item-menu-price__text">￥</text>{{ formatAmount(item.price) }}
								</view>
								<view class="item-menu-price__num">x{{ item.quantity }}</view>
							</view>
						</view>
					</view>
				</view>
				<view class="amount-breakdown">
					<text>商品 {{ formatAmount(order.amountDetail.goods) }}</text>
					<text>打包 {{ formatAmount(order.amountDetail.package) }}</text>
					<text v-if="order.amountDetail.delivery">配送 {{ formatAmount(order.amountDetail.delivery) }}</text>
					<text v-if="order.amountDetail.discount">优惠 -{{ formatAmount(order.amountDetail.discount) }}</text>
				</view>
				<view class="total-price">
					共{{ order.items_count }}件，合计：
					<text class="total-price__amount">￥{{ formatAmount(order.amountDetail.payable) }}</text>
				</view>
				<view class="order-actions" v-if="order.actions && order.actions.length">
					<u-button
						v-for="action in order.actions"
						:key="action.key"
						size="mini"
						:type="action.danger ? 'error' : 'primary'"
						:plain="action.plain"
						class="action-btn"
						@click.stop="handleAction(action.key, order)"
					>
						{{ action.label }}
					</u-button>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
import orderService from '@/common/services/order.js'
import memberService from '@/common/services/member.js'

const STATUS_TEXT = {
	pending: '待支付',
	paid: '已支付',
	preparing: '备餐中',
	delivering: '配送中',
	completed: '已完成',
	cancelled: '已取消'
}

const CHANNEL_TEXT = {
	dine_in: '堂食',
	takeout: '外卖'
}

const DEFAULT_DISH_IMAGE = 'https://mp-a83aee34-7c6d-40e3-a241-85ab45b7ff6e.cdn.bspapp.com/cloudstorage/static/menu/index-dining.png'

export default {
	data() {
		return {
			memberProfile: memberService.getStoredProfile() || null,
			orderList: [],
			loading: false,
			defaultDishImage: DEFAULT_DISH_IMAGE,
			statusTabs: [
				{ name: '全部', value: '' },
				{ name: '待支付', value: 'pending' },
				{ name: '已支付', value: 'paid' },
				{ name: '备餐中', value: 'preparing' },
				{ name: '配送中', value: 'delivering' },
				{ name: '已完成', value: 'completed' },
				{ name: '已取消', value: 'cancelled' }
			],
			currentTabIndex: 0,
			searchKeyword: ''
		}
	},
	computed: {
		isLoggedIn() {
			return !!(this.memberProfile && this.memberProfile.userId)
		},
		currentStatus() {
			const tab = this.statusTabs[this.currentTabIndex]
			return tab ? tab.value : ''
		}
	},
	onShow() {
		this.refreshProfile()
		this.fetchOrders()
	},
	onPullDownRefresh() {
		this.fetchOrders(true)
	},
	methods: {
		refreshProfile() {
			const latest = memberService.getStoredProfile() || null
			if (
				(latest && (!this.memberProfile || this.memberProfile.userId !== latest.userId)) ||
				(!latest && this.memberProfile)
			) {
				this.memberProfile = latest
			}
		},
		goLogin() {
			uni.switchTab({
				url: '/pages/my/my'
			})
		},
		ensureLogin() {
			if (this.isLoggedIn) return true
			this.goLogin()
			return false
		},
		formatAmount(val) {
			return Number(val || 0).toFixed(2)
		},
		formatTime(timestamp) {
			if (!timestamp) return '--'
			const date = new Date(Number(timestamp))
			const y = date.getFullYear()
			const m = String(date.getMonth() + 1).padStart(2, '0')
			const d = String(date.getDate()).padStart(2, '0')
			const hh = String(date.getHours()).padStart(2, '0')
			const mm = String(date.getMinutes()).padStart(2, '0')
			return `${y}-${m}-${d} ${hh}:${mm}`
		},
		formatOrder(raw) {
			const itemsSource =
				Array.isArray(raw.items_snapshot) && raw.items_snapshot.length ? raw.items_snapshot : raw.items || []
			const items = itemsSource.map(item => ({
				icon: item.icon || item.dishImg || item.cover || DEFAULT_DISH_IMAGE,
				name: item.name || item.dishName || item.dish_name || '',
				desc: item.desc || item.optionsText || item.options_text || '',
				price: Number(item.price || item.unit_price || 0),
				quantity: Number(item.quantity || item.value || 0)
			}))
			const amountDetail = raw.amount_detail || {
				goods: items.reduce((sum, item) => sum + item.price * item.quantity, 0),
				package: 0,
				delivery: 0,
				discount: 0,
				payable: raw.payable || 0
			}
			return {
				...raw,
				items,
				channelText: CHANNEL_TEXT[raw.channel] || CHANNEL_TEXT.dine_in,
				addressText:
					raw.channel === 'takeout'
						? (raw.address && (raw.address.detail || raw.address.receiver)) || '外卖订单'
						: raw.table_no
							? `桌号 ${raw.table_no}`
							: '堂食',
				statusText: STATUS_TEXT[raw.order_status] || raw.order_status,
				amountDetail: {
					goods: Number(amountDetail.goods || 0),
					package: Number(amountDetail.package ?? amountDetail.packageFee ?? 0),
					delivery: Number(amountDetail.delivery ?? amountDetail.deliveryFee ?? 0),
					discount: Number(amountDetail.discount || 0),
					payable: Number(amountDetail.payable || 0)
				},
				actions: this.buildOrderActions(raw)
			}
		},
		buildOrderActions(order) {
			const actions = []
			const status = order.order_status
			if (['pending', 'paid', 'preparing'].includes(status)) {
				actions.push({
					key: 'cancel',
					label: '取消订单',
					danger: true
				})
			}
			if (['paid', 'preparing', 'delivering'].includes(status)) {
				actions.push({
					key: 'remind',
					label: '催单',
					plain: true
				})
			}
			return actions
		},
		async fetchOrders(isPullDown = false) {
			if (!this.ensureLogin()) {
				this.orderList = []
				this.loading = false
				if (isPullDown) {
					uni.stopPullDownRefresh()
				}
				return
			}
			this.loading = !isPullDown
			try {
				const res = await orderService.list({
					page: 1,
					pageSize: 20,
					status: this.currentStatus,
					keyword: this.searchKeyword.trim(),
					memberId: this.memberProfile.userId
				})
				const list = Array.isArray(res.list) ? res.list : []
				this.orderList = list.map(item => this.formatOrder(item))
			} catch (err) {
				console.error('load orders failed', err)
				this.$u.toast(err.message || '加载订单失败')
				this.orderList = []
			} finally {
				this.loading = false
				if (isPullDown) {
					uni.stopPullDownRefresh()
				}
			}
		},
		handleStatusChange(payload) {
			const index =
				typeof payload === 'number' ? payload : (payload && typeof payload.index === 'number' ? payload.index : 0)
			this.currentTabIndex = index
			this.fetchOrders()
		},
		handleSearch(value) {
			const keyword = typeof value === 'string' ? value : (value && value.detail ? value.detail.value : '')
			this.searchKeyword = keyword
			this.fetchOrders()
		},
		handleClear() {
			this.searchKeyword = ''
			this.fetchOrders()
		},
		viewDetail(order) {
			if (!order || !order.order_no) return
			uni.navigateTo({
				url: `/pages/order/detail?orderNo=${order.order_no}`
			})
		},
		handleAction(key, order) {
			if (!order) return
			if (key === 'cancel') {
				this.cancelOrder(order)
			}
			if (key === 'remind') {
				this.remindOrder(order)
			}
		},
		cancelOrder(order) {
			if (!order || !order.order_no) return
			uni.showModal({
				title: '取消订单',
				content: '确定要取消该订单吗？',
				confirmText: '确认取消',
				cancelText: '再想想',
				success: async res => {
					if (!res.confirm) return
					try {
						await orderService.cancel({
							orderNo: order.order_no,
							reason: '用户取消订单'
						})
						this.$u.toast('订单已取消')
						this.fetchOrders()
					} catch (err) {
						console.error('cancel order failed', err)
						this.$u.toast(err.message || '取消失败')
					}
				}
			})
		},
		async remindOrder(order) {
			if (!order || !order.order_no) return
			try {
				await orderService.remind({
					orderNo: order.order_no,
					note: '用户催单'
				})
				this.$u.toast('已提醒商家加快处理')
			} catch (err) {
				console.error('remind order failed', err)
				this.$u.toast(err.message || '催单失败')
			}
		}
	}
}
</script>

<style lang="scss">
	.order-page {
		padding: 30rpx;
	}

	.order-filter {
		margin-bottom: 20rpx;
	}

	.order-tabs {
		margin-top: 20rpx;
	}

	.order-hint {
		text-align: center;
		color: $u-type-info;
		margin-top: 120rpx;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 20rpx;
	}

	.order-empty-text {
		color: $u-type-info;
	}

	.order-card {
		margin-bottom: 30rpx;
		padding: 20rpx;
		box-shadow: 2px 0px 8px 0px rgba(243, 244, 246, 0.95);
		border-radius: 16rpx;
		background-color: #fff;

		&__header {
			display: flex;
			justify-content: space-between;
			align-items: center;
		}

		&__channel {
			display: flex;
			align-items: center;
			gap: 12rpx;
			font-weight: bold;
		}

		&__address {
			font-size: 28rpx;
		}

		&__status {
			font-size: 24rpx;
			color: $u-type-info;
		}

		&__meta {
			margin-top: 8rpx;
			font-size: 22rpx;
			color: #909399;
			display: flex;
			justify-content: space-between;
		}

		&__items {
			margin-top: 16rpx;
		}
	}

	.menulist {
		display: flex;
		margin-top: 20rpx;
	}

	.item-menu-name {
		display: flex;
		flex-direction: column;
		margin-left: 20rpx;
		width: 100%;

		&__name {
			font-size: 26rpx;
			font-weight: bold;
		}

		&__desc {
			margin: 10rpx 0;
			font-size: 22rpx;
			color: $u-type-info;
		}
	}

	.item-menu-image {
		width: 100rpx;
		height: 100rpx;
		border-radius: 20rpx;
	}

	.item-menu-price {
		display: flex;
		justify-content: space-between;

		&__color {
			font-weight: bold;
			font-size: 24rpx;
			color: #ee2f37;
		}

		&__text {
			font-size: 22rpx;
		}

		&__num {
			color: $u-type-info;
			font-size: 22rpx;
		}
	}

	.amount-breakdown {
		margin-top: 16rpx;
		font-size: 22rpx;
		display: flex;
		flex-wrap: wrap;
		gap: 20rpx;
		color: #606266;
	}

	.total-price {
		text-align: right;
		font-size: 22rpx;
		font-weight: bold;
		margin-top: 20rpx;

		&__amount {
			color: #ee2f37;
			font-size: 30rpx;
			margin-left: 10rpx;
		}
	}

	.order-actions {
		margin-top: 20rpx;
		display: flex;
		flex-wrap: wrap;
		gap: 16rpx;

		.action-btn {
			min-width: 150rpx;
			justify-content: center;
		}
	}
</style>
