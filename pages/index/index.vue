<template>
	<view>
		<!-- header start -->
		<view>
			<u-swiper :list="bannerList" mode="rect" height="700" border-radius="0"></u-swiper>
		</view>
		<!-- header end -->

		<!-- body start -->
		<view class="body">
			<u-grid :col="2" :border="false">
				<u-grid-item @click="orderFood(0)">
					<u-image src="/static/index/service.jpg" width="150" height="150"></u-image>
					<view class="body__text">门店堂食</view>
				</u-grid-item>
				<u-grid-item @click="orderFood(1)">
					<u-image src="/static/index/takeaway.jpg" width="150" height="150"></u-image>
					<view class="body__text">外卖配送</view>
				</u-grid-item>
			</u-grid>
		</view>
		<!-- body end -->

		<!-- slot start -->
		<u-gap height="20" bg-color="#fafafa"></u-gap>
		<!-- slot end -->

		<!-- integral start -->
		<view class="integral">
			<view>
				<u-image src="/static/index/integral.jpg" width="200" height="200"></u-image>
			</view>
			<view>
				<view class="integral__nav">我的积分：<text>777</text></view>
				<view class="integral__desc">可兑换现金优惠券和周边礼品</view>
			</view>
		</view>
		<!-- integral end -->
		
		<!-- slot start -->
		<u-gap height="20" bg-color="#fafafa"></u-gap>
		<!-- slot end -->

		<!-- head start -->
		<view>
			<u-grid :col="3" :border="false">
				<u-grid-item>
					<view class="grid-text">积分商城</view>
					<view class="grid-desc">好多神秘好礼等你</view>
					<u-image src="/static/index/integralShop.png" width="120" height="120"></u-image>
				</u-grid-item>
				<u-grid-item>
					<view class="grid-text">会员中心</view>
					<view class="grid-desc">享受会员的专属权益</view>
					<u-image src="/static/index/vipCenter.png" width="120" height="120"></u-image>
				</u-grid-item>
				<u-grid-item>
					<view class="grid-text">活动中心</view>
					<view class="grid-desc">更多活动等你参加</view>
					<u-image src="/static/index/activityCenter.png" width="120" height="120"></u-image>
				</u-grid-item>
			</u-grid>
		</view>
		<!-- head end -->

		<!-- table dialog -->
		<u-popup v-model="showTableDialog" mode="center" border-radius="20" :mask-close-able="false">
			<view class="table-popup">
				<view class="table-popup__welcome">欢迎光临</view>
				<view class="table-popup__table">桌号：<text class="table-popup__table-no">{{ tableNo || '未识别' }}</text></view>
				<view class="table-popup__subtitle">请选择用餐人数</view>

				<view class="table-popup__people-title">用餐人数</view>
				<view class="table-popup__people-grid">
					<view
						v-for="item in peopleOptions"
						:key="item"
						:class="['table-popup__people-btn', selectedPeople === item ? 'is-active' : '']"
						@click="selectPeople(item)"
					>
						{{ item }}人
					</view>
				</view>

				<u-button
					class="table-popup__confirm"
					type="primary"
					shape="circle"
					@click="confirmTable"
				>
					确认开始点餐
				</u-button>
			</view>
		</u-popup>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				// bannerlist
				bannerList: [
					'/static/index/banner.jpg'
				],
				showTableDialog: false,
				tableNo: '',
				peopleCount: 2,
				peopleOptions: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
				selectedPeople: 2
			}
		},
		onLoad(options) {
			this.handleEntryParams(options || {})
		},
		methods: {
			handleEntryParams(options) {
				let tableFromQuery = options.table || options.tableNo || options.t || ''
				const scene = options.scene ? decodeURIComponent(options.scene) : ''
				if (scene) {
					scene.split('&').forEach(item => {
						const [key, value] = item.split('=')
						if (key && value && ['table', 'tableNo', 't'].includes(key)) {
							tableFromQuery = value
						}
					})
				}

				if (tableFromQuery) {
					this.tableNo = tableFromQuery
					this.showTableDialog = true
					uni.setStorageSync('tableNo', tableFromQuery)
				}
			},
			// spotmeal
			orderFood(param) {
				uni.setStorageSync('subCurrent', param);
				uni.switchTab({
					url: '/pages/menu/menu'
				})
			},
			selectPeople(val) {
				this.selectedPeople = val
				this.peopleCount = val
			},
			closeTableDialog() {
				this.showTableDialog = false
			},
			confirmTable() {
				if (this.tableNo) {
					uni.setStorageSync('tableNo', this.tableNo)
				}
				uni.setStorageSync('peopleCount', this.peopleCount)
				this.showTableDialog = false
				uni.switchTab({
					url: '/pages/menu/menu'
				})
			}
		}
	}
</script>

<style lang="scss">
	.body {
		position: relative;
		z-index: 1;
		margin: -40rpx 30rpx 0 30rpx;
		padding: 0 15rpx;
		background-color: white;
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
	
	.grid-text{
		font-size: 38rpx;
		font-weight: bold;
	}
	
	.grid-desc{
		font-size: 24rpx;
		color: $u-type-info;
		margin-bottom: 30rpx;
	}

	.table-popup{
		width: 600rpx;
		padding: 48rpx 36rpx 40rpx;
		text-align: center;
		background: #ffffff;
		box-shadow: 0 20rpx 60rpx rgba(0, 0, 0, 0.12);

		&__welcome{
			font-size: 32rpx;
			color: #3a3a3a;
			margin-bottom: 12rpx;
			font-weight: 600;
		}

		&__table{
			font-size: 30rpx;
			color: #666;
			margin-bottom: 12rpx;
		}

		&__table-no{
			color: #000;
			font-weight: 700;
		}

		&__subtitle{
			font-size: 26rpx;
			color: #9b9b9b;
			margin-bottom: 24rpx;
		}

		&__people-title{
			font-size: 26rpx;
			color: #3a3a3a;
			margin-bottom: 18rpx;
			font-weight: 600;
		}

		&__people-grid{
			display: flex;
			flex-wrap: wrap;
			justify-content: space-between;
			gap: 16rpx 12rpx;
			margin-bottom: 32rpx;
		}

		&__people-btn{
			width: 128rpx;
			height: 72rpx;
			border-radius: 12rpx;
			border: 1rpx solid #e6e6e6;
			color: #4a4a4a;
			background: #fafafa;
			display: flex;
			align-items: center;
			justify-content: center;
			font-size: 26rpx;
			transition: all 0.2s ease;
		}

		&__people-btn.is-active{
			border-color: #5c9bfd;
			background: #e8f0ff;
			color: #2f75ff;
			box-shadow: 0 8rpx 20rpx rgba(47, 117, 255, 0.18);
		}

		&__confirm{
			width: 100%;
			height: 88rpx;
			line-height: 88rpx;
			border-radius: 44rpx;
			background: linear-gradient(90deg, #7ab6ff 0%, #5b96ff 100%);
			color: #fff;
			font-size: 28rpx;
			font-weight: 600;
		}
	}
</style>
