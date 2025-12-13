<template>
	<view class="wrap">
		<view v-if="loading" class="order-hint">订单加载中...</view>
		<view v-else-if="!orderInfo" class="order-hint">未找到订单，请返回订单列表</view>
		<view v-else>
			<view class="u-font-weight u-font-34">{{ orderInfo.restaurant_name || '私房菜（万达广场店）' }}</view>
			<view class="u-flex u-row-between u-m-t-20 u-m-b-30">
				<view class="wrap__vip">
					{{ orderInfo.channelText }}
				</view>
				<view class="u-type-info u-font-24">{{ orderInfo.statusText }}</view>
			</view>
			<view class="table-number">
				<view class="u-m-b-34">{{ orderInfo.channel === 'takeout' ? '配送地址' : '餐桌号' }}</view>
				<view class="u-font-70">{{ orderInfo.displaySeat }}</view>
			</view>

			<view class="u-font-30 u-font-weight u-m-t-30 u-p-b-30 u-border-bottom">点餐详情</view>
			<view v-for="(item, index) in orderItems" :key="index" class="u-flex list-box">
				<view>
					<image class="item-menu-image" :src="item.icon" mode="aspectFill"></image>
				</view>
				<view class="item-menu-name">
					<text class="u-font-26">{{ item.name }}</text>
					<view class="u-m-t-10 u-m-b-10 u-line-2 u-font-22 u-type-info">
						{{ item.desc }}
					</view>
					<view class="u-flex u-row-between">
						<view class="u-font-weight u-font-24" style="color: #EE2F37;">
							<text class="u-font-20">¥</text>
							{{ formatAmount(item.price) }}
						</view>
						<view class="u-type-info u-font-22">
							x{{ item.quantity }}
						</view>
					</view>
				</view>
			</view>
			<view class="fee-card">
				<view>商品小计：¥{{ formatAmount(orderInfo.amountDetail.goods) }}</view>
				<view>打包费：¥{{ formatAmount(orderInfo.amountDetail.package) }}</view>
				<view v-if="orderInfo.amountDetail.delivery">配送费：¥{{ formatAmount(orderInfo.amountDetail.delivery) }}</view>
				<view v-if="orderInfo.amountDetail.discount">优惠减免：-¥{{ formatAmount(orderInfo.amountDetail.discount) }}</view>
				<view class="fee-card__total">应付金额：¥{{ formatAmount(orderInfo.amountDetail.payable) }}</view>
			</view>

			<u-gap height="20" bg-color="#f3f4f6" margin-top="30"></u-gap>

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

			<view class="status-log" v-if="statusLogs.length">
				<view class="status-log__title">状态时间线</view>
				<view v-for="(log, idx) in statusLogs" :key="idx" class="status-log__item">
					<view class="status-log__name">{{ log.statusText }}</view>
					<view class="status-log__time">{{ formatTime(log.created_at) }}</view>
					<view class="status-log__note" v-if="log.note">{{ log.note }}</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
import orderService from '@/common/services/order.js'
import paymentService from '@/common/services/payment.js'
import memberService from '@/common/services/member.js'

const STATUS_TEXT = {
	pending: '待支付',
	paid: '已支付',
	preparing: '备餐中',
	delivering: '配送中',
	completed: '已完成',
	cancelled: '已取消'
}

const DEFAULT_DISH_IMAGE = 'https://mp-a83aee34-7c6d-40e3-a241-85ab45b7ff6e.cdn.bspapp.com/cloudstorage/static/menu/index-dining.png'

export default {
	data() {
		return {
			orderNo: '',
			orderInfo: null,
			orderItems: [],
			statusLogs: [],
			loading: false,
			memberProfile: memberService.getStoredProfile() || null
		}
	},
	computed: {
		invoiceText() {
			if (!this.orderInfo || !this.orderInfo.invoice || !this.orderInfo.invoice.needInvoice) {
				return '无需发票'
			}
			return this.orderInfo.invoice.title || '电子发票'
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
		if (!this.ensureLogin()) return
		this.fetchDetail()
	},
	methods: {
		ensureLogin() {
			const latest = memberService.getStoredProfile() || null
			if (
				(latest && (!this.memberProfile || this.memberProfile.userId !== latest.userId)) ||
				(!latest && this.memberProfile)
			) {
				this.memberProfile = latest
			}
			if (this.memberProfile && this.memberProfile.userId) {
				return true
			}
			uni.showModal({
				title: '需要登录',
				content: '请登录后查看订单详情',
				confirmText: '去登录',
				success: res => {
					if (res.confirm) {
						uni.switchTab({
							url: '/pages/my/my'
						})
					}
				}
			})
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
			const ss = String(date.getSeconds()).padStart(2, '0')
			return `${y}-${m}-${d} ${hh}:${mm}:${ss}`
		},
		formatItems(items) {
			return items.map(item => ({
				icon: item.icon || item.dishImg || item.cover || DEFAULT_DISH_IMAGE,
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
					orderNo: this.orderNo,
					memberId: this.memberProfile ? this.memberProfile.userId : ''
				})
				const order = res.order || {}
				this.orderInfo = {
					...order,
					channelText: order.channel === 'takeout' ? '外卖' : '堂食',
					statusText: STATUS_TEXT[order.order_status] || order.order_status,
					payStatusText: order.pay_status === 'paid' ? '已支付' : '待支付',
					displaySeat:
						order.channel === 'takeout'
							? (order.address && order.address.detail) || order.address?.receiver || '外卖订单'
							: order.table_no || '未分配',
					amountDetail: {
						goods: Number(order.amount_detail?.goods || 0),
						package: Number(order.amount_detail?.package ?? order.amount_detail?.packageFee ?? 0),
						delivery: Number(order.amount_detail?.delivery ?? order.amount_detail?.deliveryFee ?? 0),
						discount: Number(order.amount_detail?.discount || 0),
						payable: Number(order.amount_detail?.payable || 0)
					}
				}
				const snapshotItems =
					Array.isArray(order.items_snapshot) && order.items_snapshot.length ? order.items_snapshot : null
				const dataSource = snapshotItems || res.items || []
				this.orderItems = this.formatItems(dataSource)
				this.statusLogs = (res.logs || []).map(log => ({
					...log,
					statusText: STATUS_TEXT[log.status] || log.status
				}))
			} catch (err) {
				console.error('order detail load failed', err)
				this.$u.toast(err.message || '加载订单详情失败')
				this.orderInfo = null
				this.orderItems = []
				this.statusLogs = []
			} finally {
				this.loading = false
			}
		},
		async applyRefund() {
			if (!this.orderNo) return
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
			}
		},
	}
}
</script>

<style lang="scss">
	.wrap {
		padding: 30rpx;

		&__vip {
			background-color: #ee2f37;
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
				color: #ee2f37;
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

	.fee-card {
		margin-top: 20rpx;
		font-size: 26rpx;
		line-height: 1.8;

		&__total {
			font-weight: bold;
			color: #ee2f37;
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

	.refund-bar {
		margin: 30rpx 0;
		display: flex;
		align-items: center;
		gap: 20rpx;
		flex-wrap: wrap;
	}
</style>
