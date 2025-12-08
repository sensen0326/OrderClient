<template>
	<view class="wrap">
		<view v-if="loading" class="order-hint">订单加载中...</view>
		<view v-else-if="!orderInfo" class="order-hint">未找到订单，请从订单列表重新进入</view>
		<view v-else>
			<view class="u-font-weight u-font-34">{{orderInfo.restaurant_name || '私房菜（万达广场店）'}}</view>
			<view class="u-flex u-row-between u-m-t-20 u-m-b-30">
				<view class="wrap__vip">
					{{orderInfo.channelText}}
				</view>
				<view class="u-type-info u-font-24">{{orderInfo.statusText}}</view>
			</view>
			<view class="table-number">
				<view class="u-m-b-34">{{orderInfo.channel === 'takeout' ? '配送地址' : '餐桌号'}}</view>
				<view class="u-font-70">{{orderInfo.displaySeat}}</view>
			</view>

			<view class="u-font-30 u-font-weight u-m-t-30 u-p-b-30 u-border-bottom">点餐详情</view>
			<view v-for="(item,index) in orderItems" :key="index" class="u-flex list-box">
				<view>
					<image class="item-menu-image" :src="item.icon" mode="aspectFill"></image>
				</view>
				<view class="item-menu-name">
					<text class="u-font-26">{{item.name}}</text>
					<view class="u-m-t-10 u-m-b-10 u-line-2 u-font-22 u-font-weight u-type-info">
						{{item.desc}}
					</view>
					<view class="u-flex u-row-between">
						<view class="u-font-weight u-font-24" style="color: #EE2F37;">
							<text class="u-font-20">¥</text>
							{{formatAmount(item.price)}}
						</view>
						<view class="u-type-info u-font-22">
							x{{item.quantity}}
						</view>
					</view>
				</view>
			</view>
			<view class="u-text-right u-m-t-10">
				共{{orderInfo.items_count}}件，合计
				<text class="u-font-22 u-m-l-10" style="color: #EE2F37;">¥</text>
				<text class="u-font-weight u-font-34" style="color: #EE2F37;">{{formatAmount(orderInfo.payable)}}</text>
			</view>

			<u-gap height="20" bg-color="#f3f4f6" margin-top="30"></u-gap>

			<view class="kitchen-card" v-if="kitchenTicket">
				<view class="kitchen-card__header">
					<view class="kitchen-card__title">备餐进度</view>
					<view class="kitchen-card__status">{{kitchenStatusText}}</view>
				</view>
				<view class="kitchen-card__meta">
					<text>出餐口：{{kitchenTicket.station_id || '默认出餐口'}}</text>
					<text v-if="kitchenTicket.urgent" class="kitchen-card__tag">加急</text>
				</view>
				<view class="kitchen-events" v-if="kitchenEvents.length">
					<view class="kitchen-event" v-for="(event, idx) in kitchenEvents" :key="idx">
						<view class="kitchen-event__status">{{event.displayStatus}}</view>
						<view class="kitchen-event__time">{{formatTime(event.created_at)}}</view>
						<view class="kitchen-event__note" v-if="event.note">{{event.note}}</view>
					</view>
				</view>
				<view class="kitchen-items" v-if="kitchenTicket.items && kitchenTicket.items.length">
					<view class="kitchen-items__title">菜品</view>
					<view class="kitchen-item" v-for="(dish, idx) in kitchenTicket.items" :key="idx">
						<text class="kitchen-item__name">{{dish.name}}</text>
						<text class="kitchen-item__sku" v-if="dish.sku_name">{{dish.sku_name}}</text>
						<text class="kitchen-item__qty">x{{dish.quantity}}</text>
					</view>
				</view>
			</view>

			<view class="u-font-30 u-font-weight u-m-t-30 u-p-b-30 u-border-bottom">订单信息</view>
			<u-cell-group :border="false">
				<u-cell-item title="订单编号" :value="orderNo" :arrow="false"></u-cell-item>
				<u-cell-item title="支付状态" :value="orderInfo.payStatusText" :arrow="false"></u-cell-item>
				<u-cell-item title="下单时间" :value="formatTime(orderInfo.created_at)" :arrow="false"></u-cell-item>
				<u-cell-item title="顾客备注" :value="orderInfo.remark || '无'" :arrow="false"></u-cell-item>
				<u-cell-item title="发票" :value="invoiceText" :arrow="false" :border-bottom="false"></u-cell-item>
			</u-cell-group>

			<view class="refund-bar" v-if="orderInfo && orderInfo.pay_status === 'paid'">
				<u-button type="error" plain @click="applyRefund">申请退款</u-button>
			</view>

			<view
				class="review-entry"
				v-if="orderInfo && orderInfo.order_status === 'completed'"
			>
				<u-button
					type="primary"
					:plain="hasReview"
					@click="hasReview ? $u.toast('已评价') : goReview()"
				>
					{{ hasReview ? '已完成评价' : '去评价' }}
				</u-button>
			</view>

			<view class="status-actions" v-if="statusActions.length">
				<view class="status-actions__title">手动更新状态</view>
				<view class="status-actions__btns">
					<u-button
						v-for="action in statusActions"
						:key="action.key"
						type="primary"
						size="mini"
						plain
						class="status-button"
						@click="updateStatus(action.key)"
					>
						{{action.label}}
					</u-button>
				</view>
			</view>

			<view class="status-log" v-if="statusLogs.length">
				<view class="status-log__title">状态时间线</view>
				<view v-for="(log, idx) in statusLogs" :key="idx" class="status-log__item">
					<view class="status-log__name">{{log.statusText}}</view>
					<view class="status-log__time">{{formatTime(log.created_at)}}</view>
					<view class="status-log__note" v-if="log.note">{{log.note}}</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	import orderService, { STATUS_FLOW } from '@/common/services/order.js'
	import paymentService from '@/common/services/payment.js'
	import kitchenService from '@/common/services/kitchen.js'
	import reviewService from '@/common/services/review.js'

	const STATUS_TEXT = {
		pending: '待支付',
		paid: '已支付',
		preparing: '备餐中',
		delivering: '配送中',
		completed: '已完成',
		cancelled: '已取消'
	}

	const KITCHEN_STATUS_TEXT = {
		queued: '等待接单',
		preparing: '备餐中',
		ready: '待取餐',
		delivering: '配送中',
		completed: '已完成',
		cancelled: '已取消'
	}

	export default {
		data() {
			return {
				orderNo: '',
				orderInfo: null,
				orderItems: [],
				statusLogs: [],
				loading: false,
				refundLoading: false,
				kitchenTicket: null,
				reviewLoaded: false,
				hasReview: false
			}
		},
		computed: {
			statusActions() {
				if (!this.orderInfo) return []
				const next = STATUS_FLOW[this.orderInfo.order_status] || []
				return next.map(key => ({
					key,
					label: STATUS_TEXT[key] || key
				}))
			},
			invoiceText() {
				if (!this.orderInfo || !this.orderInfo.invoice || !this.orderInfo.invoice.needInvoice) {
					return '无需发票'
				}
				return this.orderInfo.invoice.title || '电子发票'
			},
			kitchenStatusText() {
				if (!this.kitchenTicket) return ''
				return KITCHEN_STATUS_TEXT[this.kitchenTicket.ticket_status] || this.kitchenTicket.ticket_status
			},
			kitchenEvents() {
				if (!this.kitchenTicket || !Array.isArray(this.kitchenTicket.events)) {
					return []
				}
				return this.kitchenTicket.events.slice().sort((a, b) => {
					return Number(a.created_at || 0) - Number(b.created_at || 0)
				}).map(event => ({
					...event,
					displayStatus: KITCHEN_STATUS_TEXT[event.status] || event.status
				}))
			}
		},
		onLoad(options) {
			const fromQuery = options && options.orderNo
			const fallback = uni.getStorageSync('lastOrderNo')
			this.orderNo = fromQuery || fallback || ''
			if (!this.orderNo) {
				this.$u.toast('缺少订单编号')
				return
			}
			this.fetchDetail()
		},
		methods: {
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
				const ss = String(date.getSeconds()).padStart(2, '0')
				return `${y}-${m}-${d} ${hh}:${mm}:${ss}`
			},
			formatItems(items) {
				return items.map(item => ({
					icon: item.icon || item.dishImg || item.cover || '',
					name: item.name || item.dish_name || item.dishName || '',
					desc: item.desc || item.optionsText || item.options_text || '',
					price: Number(item.price || item.unit_price || 0),
					quantity: Number(item.quantity || item.value || 0)
				}))
			},
			async fetchDetail() {
				this.loading = true
				try {
					const res = await orderService.detail({
						orderNo: this.orderNo
					})
					const order = res.order || {}
					this.orderInfo = {
						...order,
						channelText: order.channel === 'takeout' ? '外卖' : '堂食',
						statusText: STATUS_TEXT[order.order_status] || order.order_status,
						payStatusText: order.pay_status === 'paid' ? '已支付' : '待支付',
						displaySeat: order.channel === 'takeout'
							? ((order.address && order.address.detail) || order.address?.receiver || '外卖订单')
							: (order.table_no || '未分配'),
						payable: order.amount_detail ? order.amount_detail.payable : 0
					}
					const snapshotItems = Array.isArray(order.items_snapshot) && order.items_snapshot.length ? order.items_snapshot : null
					const dataSource = snapshotItems || res.items || []
					this.orderItems = this.formatItems(dataSource)
					this.statusLogs = (res.logs || []).map(log => ({
						...log,
						statusText: STATUS_TEXT[log.status] || log.status
					}))
					this.fetchKitchenTicket()
					this.loadReviewState()
				} catch (err) {
					console.error('order detail load failed', err)
					this.$u.toast(err.message || '加载订单详情失败')
					this.orderInfo = null
					this.orderItems = []
					this.statusLogs = []
					this.kitchenTicket = null
				} finally {
					this.loading = false
				}
			},
			async fetchKitchenTicket() {
				if (!this.orderNo) {
					this.kitchenTicket = null
					return
				}
				try {
					const res = await kitchenService.listByOrder(this.orderNo)
					const list = (res && res.list) || []
					this.kitchenTicket = list.length ? list[0] : null
				} catch (err) {
					console.warn('load kitchen ticket failed', err)
					this.kitchenTicket = null
				}
			},
			async loadReviewState() {
				if (!this.orderNo) return
				try {
					const list = await reviewService.listByOrder(this.orderNo)
					this.hasReview = Array.isArray(list) && list.length > 0
				} catch (err) {
					console.warn('load review state failed', err)
					this.hasReview = false
				} finally {
					this.reviewLoaded = true
				}
			},
			async updateStatus(nextStatus) {
				if (!this.orderNo || !nextStatus) return
				try {
					await orderService.updateStatus({
						orderNo: this.orderNo,
						nextStatus
					})
					this.$u.toast('状态已更新')
					this.fetchDetail()
				} catch (err) {
					console.error('update status failed', err)
					this.$u.toast(err.message || '更新状态失败')
				}
			},
			async applyRefund() {
				if (!this.orderNo || this.refundLoading) return
				this.refundLoading = true
				try {
					await paymentService.refund({
						orderNo: this.orderNo,
						reason: '用户申请退款'
					})
					this.$u.toast('退款申请成功')
					this.fetchDetail()
				} catch (err) {
					console.error('refund failed', err)
					this.$u.toast(err.message || '退款失败')
				} finally {
					this.refundLoading = false
				}
			},
			goReview() {
				if (!this.orderNo) return
				uni.navigateTo({
					url: `/subPack/order/reviewSubmit?orderNo=${this.orderNo}`
				})
			}
		}
	}
</script>

<style lang="scss">
	.wrap {
		padding: 30rpx;

		&__vip {
			background-color: #EE2F37;
			color: white;
			padding: 5rpx 0;
			width: 100rpx;
			text-align: center;
			border-radius: 7rpx;
			font-size: 20rpx;
		}

		.table-number {
			text-align: center;
			border-radius: 14rpx;
			padding: 50rpx 0;
			font-weight: bold;
			box-shadow: 2px 0px 8px 0px rgba(243, 244, 246, 0.95);

			view:nth-child(2) {
				color: #EE2F37;
			}
		}

		.list-box {
			box-shadow: 2px 0px 8px 0px rgba(243, 244, 246, 0.95);
			padding: 20rpx 30rpx;
			margin-bottom: 20rpx;
			border-radius: 14rpx;
		}

		.item-menu-image {
			width: 100rpx;
			height: 100rpx;
			border-radius: 20rpx;
		}

		.item-menu-name {
			display: flex;
			flex-direction: column;
			margin-left: 20rpx;
			width: 100%;
		}
	}

	.order-hint {
		text-align: center;
		color: $u-type-info;
		margin-top: 120rpx;
	}

	.status-actions {
		margin-top: 30rpx;

		&__title {
			font-size: 28rpx;
			font-weight: bold;
			margin-bottom: 10rpx;
		}

		&__btns {
			display: flex;
			flex-wrap: wrap;
			gap: 20rpx;
		}
	}

	.status-button {
		width: auto;
	}

	.refund-bar {
		margin: 30rpx 0;
	}

	.review-entry {
		margin-bottom: 20rpx;

		.u-button {
			width: 100%;
		}
	}

	.status-log {
		margin-top: 40rpx;

		&__title {
			font-size: 28rpx;
			font-weight: bold;
			margin-bottom: 10rpx;
		}

		&__item {
			padding: 16rpx 0;
			border-bottom: 1px solid #f3f4f6;
		}

		&__name {
			font-weight: bold;
			font-size: 26rpx;
		}

		&__time {
			color: #909399;
			font-size: 24rpx;
			margin-top: 6rpx;
		}

		&__note {
			font-size: 24rpx;
			color: #606266;
			margin-top: 4rpx;
		}
	}

	.kitchen-card {
		margin-top: 30rpx;
		padding: 30rpx;
		border-radius: 24rpx;
		background-color: #fff5f5;
		box-shadow: 0 6rpx 20rpx rgba(0, 0, 0, 0.04);

		&__header {
			display: flex;
			justify-content: space-between;
			align-items: center;
		}

		&__title {
			font-size: 30rpx;
			font-weight: bold;
		}

		&__status {
			font-size: 26rpx;
			color: #ee2f37;
		}

		&__meta {
			font-size: 24rpx;
			color: #606266;
			margin-top: 10rpx;
			display: flex;
			align-items: center;
			gap: 20rpx;
		}

		&__tag {
			color: #ee2f37;
			font-weight: bold;
		}
	}

	.kitchen-events {
		margin-top: 20rpx;
		border-top: 1px dashed #f1c8c8;
		padding-top: 10rpx;
	}

	.kitchen-event {
		padding: 12rpx 0;

		&__status {
			font-weight: bold;
			font-size: 26rpx;
		}

		&__time {
			font-size: 24rpx;
			color: #909399;
		}

		&__note {
			font-size: 24rpx;
			color: #606266;
			margin-top: 4rpx;
		}
	}

	.kitchen-items {
		margin-top: 20rpx;

		&__title {
			font-weight: bold;
			margin-bottom: 6rpx;
		}
	}

	.kitchen-item {
		display: flex;
		align-items: center;
		font-size: 24rpx;
		color: #303133;
		margin-bottom: 6rpx;
		gap: 12rpx;

		&__name {
			font-weight: bold;
		}

		&__sku {
			color: #909399;
		}

		&__qty {
			margin-left: auto;
			font-weight: bold;
		}
	}
</style>
