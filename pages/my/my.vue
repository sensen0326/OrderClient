<template>
	<view>
		<!-- header start-->
		<view class="header">
			<view class="header__bg"></view>
			<view class="header__con">
				<view>
					<view class="header__name">Kaiyuan_Q</view>
					<view class="header__line">
						<u-line-progress active-color="#EE2F37" percent="40"></u-line-progress>
					</view>
					<view>
						<u-tag text="V7" mode="plain" border-color="#EE2F37" color="#EE2F37" size="mini"
							shape="circle" />
						<text class="header__linevipdesc">需消费1000元达到V8</text>
					</view>
				</view>
				<view class="header__avatar">
					<u-avatar src="/static/my/avatarurl.jpg" size="180" show-level level-bg-color="#fa3534"></u-avatar>
				</view>
			</view>
		</view>
		<!-- header end -->

		<!-- content start-->
		<view class="content">我的服务</view>
		<view class="grid-box">
			<u-grid :col="4" :border="false">
				<u-grid-item>
					<u-icon name="/static/my/icon-1.png" :size="50"></u-icon>
					<view class="grid-box__text">积分签到</view>
				</u-grid-item>
				<u-grid-item>
					<u-icon name="/static/my/icon-2.png" :size="50"></u-icon>
					<view class="grid-box__text">积分商城</view>
				</u-grid-item>
				<u-grid-item>
					<u-icon name="/static/my/icon-3.png" :size="50"></u-icon>
					<view class="grid-box__text">领劵中心</view>
				</u-grid-item>
				<u-grid-item>
					<u-icon name="/static/my/icon-4.png" :size="50"></u-icon>
					<view class="grid-box__text">联系客服</view>
				</u-grid-item>
			</u-grid>
		</view>
		<!-- content end -->

		<!-- cell start -->
		<view class="u-m-l-30 u-m-r-30">
			<u-cell-group>
				<u-cell-item icon="rmb-circle" title="我的钱包"></u-cell-item>
				<u-cell-item icon="order" title="我的订单"></u-cell-item>
				<u-cell-item icon="coupon" title="我的优惠劵"></u-cell-item>
				<u-cell-item icon="edit-pen" title="意见反馈"></u-cell-item>
				<u-cell-item icon="star" title="给个好评"></u-cell-item>
			</u-cell-group>
		</view>
		<!-- cell end -->
	</view>
</template>

<script>
	export default {
		data() {
			return {}
		},
		methods: {}
	}
</script>

<style lang="scss">
	.header {
		&__bg {
			height: 450rpx;
			background-color: #EE2F37;
		}

		&__con {
			display: flex;
			justify-content: space-between;
			background-color: white;
			width: 90%;
			margin: -150rpx auto 0 auto;
			border-radius: 14rpx;
			padding: 20rpx 30rpx 30rpx 30rpx;
			box-shadow: 2px 0px 8px 0px rgba(243, 244, 246, 0.95);
		}

		&__avatar {
			margin-top: -50rpx;
		}

		&__name {
			font-weight: bold;
			font-size: 34rpx;
		}

		&__line {
			margin: 15rpx 0 10rpx 0;
		}

		&__linevipdesc {
			font-size: 24rpx;
			color: $u-type-info;
			margin-left: 20rpx;
		}
	}

	.content {
		font-weight: bold;
		font-size: 30rpx;
		margin: 100rpx 30rpx 30rpx 30rpx;
	}

	.grid-box {
		margin: 0 30rpx;
		box-shadow: 2px 0px 8px 0px rgba(243, 244, 246, 0.95);
		border-radius: 14rpx;

		&__text {
			margin-top: 20rpx;
			font-size: 24rpx;
			font-weight: bold;
		}
	}
</style>