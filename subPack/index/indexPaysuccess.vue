<template>
	<view class="u-flex-col u-col-center">
		<view class="icon">
			<u-icon name="checkmark-circle-fill" color="#13D269" size="150"></u-icon>
		</view>
		<view class="u-font-38 u-font-weight u-m-b-30">支付成功</view>
		<view class="u-type-info">订单 {{displayOrderNo}} 创建成功，正在为您备餐</view>
		<view class="u-m-t-170 u-flex u-row-between">
			<view class="return-home" @click="backHome">返回首页</view>
			<view class="check-order" @click="checkOrder">查看订单</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				orderNo: ''
			}
		},
		computed: {
			displayOrderNo() {
				return this.orderNo || '--'
			}
		},
		onLoad(options) {
			const fromQuery = options && options.orderNo
			const fallback = uni.getStorageSync('lastOrderNo')
			this.orderNo = fromQuery || fallback || ''
		},
		methods: {
			backHome() {
				uni.switchTab({
					url: "/pages/index/index"
				})
			},
			checkOrder() {
				if (this.orderNo) {
					uni.navigateTo({
						url: `/pages/order/detail?orderNo=${this.orderNo}`
					})
				} else {
					uni.navigateTo({
						url: "/pages/order/list"
					})
				}
			}
		}
	}
</script>

<style lang="scss">
	.icon {
		margin: 50% 0 8% 0;
	}

	.return-home,
	.check-order {
		font-size: 34rpx;
		padding: 30rpx 80rpx;
		border-radius: 14rpx;
	}

	.return-home {
		background-color: #f4f4f5;
	}

	.check-order {
		background-color: #2BA0C6;
		color: white;
		margin-left: 100rpx;
	}
</style>
