<template>
	<view class="order-page">
		<view v-if="loading" class="order-hint">订单加载中...</view>
		<view v-else-if="!orderList.length" class="order-hint">暂无订单，去点餐吧～</view>
		<view v-else>
			<view class="content" v-for="order in orderList" :key="order.order_no">
				<view class="content__header">
					<view class="flex">
						<view class="content__vip">
							{{order.channelText}}
						</view>
						<view class="content__address">
							{{order.addressText}}
						</view>
					</view>
					<view class="content__status">
						{{order.statusText}}
					</view>
				</view>
				<view
					v-for="(item, index1) in order.items"
					:key="index1"
					class="menulist"
					@click="orderDetail(order.order_no)"
				>
					<view>
						<image class="item-menu-image" :src="item.icon" mode="aspectFill"></image>
					</view>
					<view class="item-menu-name">
						<text class="item-menu-name__name">{{item.name}}</text>
						<view class="item-menu-name__desc u-line-2">
							{{item.desc}}
						</view>
						<view class="item-menu-price">
							<view class="item-menu-price__color">
								<text class="u-font-20 item-menu-price__text">¥</text>
								{{formatAmount(item.price)}}
							</view>
							<view class="item-menu-price__num">
								x{{item.quantity}}
							</view>
						</view>
					</view>
				</view>
				<view class="total-price">共{{order.items_count}}件商品，合计：¥{{formatAmount(order.payable)}}</view>
				<view class="again-btn" @click="oneMore">
					<u-tag text="再来一单" mode="plain" shape="circle" type="info" />
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	import orderService from '@/common/services/order.js'

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

	export default {
		data() {
			return {
				orderList: [],
				loading: false
			}
		},
		onShow() {
			this.fetchOrders()
		},
		methods: {
			formatAmount(val) {
				return Number(val || 0).toFixed(2)
			},
			formatOrder(raw) {
				const itemsSource = Array.isArray(raw.items_snapshot) && raw.items_snapshot.length ? raw.items_snapshot : (raw.items || [])
				const items = itemsSource.map(item => ({
					icon: item.icon || item.dishImg || item.cover || '',
					name: item.name || item.dishName || item.dish_name || '',
					desc: item.desc || item.optionsText || item.options_text || '',
					price: Number(item.price || item.unit_price || 0),
					quantity: Number(item.value || item.quantity || 0)
				}))
				return {
					...raw,
					items,
					channelText: CHANNEL_TEXT[raw.channel] || CHANNEL_TEXT.dine_in,
					addressText: raw.channel === 'takeout'
						? ((raw.address && (raw.address.detail || raw.address.receiver)) || '外卖订单')
						: (raw.table_no ? `桌号 ${raw.table_no}` : '堂食'),
					statusText: STATUS_TEXT[raw.order_status] || raw.order_status,
					payable: raw.amount_detail && typeof raw.amount_detail.payable !== 'undefined'
						? raw.amount_detail.payable
						: items.reduce((sum, item) => sum + item.price * item.quantity, 0)
				}
			},
			async fetchOrders() {
				this.loading = true
				try {
					const res = await orderService.list({
						page: 1,
						pageSize: 20
					})
					const list = Array.isArray(res.list) ? res.list : []
					this.orderList = list.map(this.formatOrder)
				} catch (err) {
					console.error('load orders failed', err)
					this.$u.toast(err.message || '加载订单失败')
					this.orderList = []
				} finally {
					this.loading = false
				}
			},
			orderDetail(orderNo) {
				if (!orderNo) return
				uni.navigateTo({
					url: `/subPack/order/orderDetail?orderNo=${orderNo}`
				})
			},
			oneMore() {
				uni.switchTab({
					url: '/pages/menu/menu'
				})
			}
		}
	}
</script>

<style lang="scss">
	.order-page {
		padding: 30rpx;
	}

	.order-hint {
		text-align: center;
		color: $u-type-info;
		margin-top: 120rpx;
	}

	.flex {
		display: flex;
	}

	.content {
		margin-bottom: 30rpx;
		padding: 20rpx;
		box-shadow: 2px 0px 8px 0px rgba(243, 244, 246, 0.95);

		&__header {
			display: flex;
			justify-content: space-between;
		}

		&__address {
			font-weight: bold;
			font-size: 28rpx;
		}

		&__status {
			font-size: 24rpx;
			color: $u-type-info;
		}

		&__vip {
			background-color: #EE2F37;
			color: white;
			padding: 5rpx 0;
			width: 77rpx;
			text-align: center;
			border-radius: 7rpx;
			font-size: 20rpx;
			margin-right: 10rpx;
		}
	}

	.menulist {
		display: flex;
		margin-top: 30rpx;
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
			font-weight: bold;
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
			color: #EE2F37;
		}

		&__num {
			color: $u-type-info;
			font-size: 22rpx;
		}
	}

	.total-price {
		text-align: right;
		font-size: 22rpx;
		font-weight: bold;
		margin-top: 30rpx;
	}

	.again-btn {
		display: flex;
		justify-content: flex-end;
		margin-top: 30rpx;
	}
</style>
