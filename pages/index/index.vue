<template>
	<view>
		<!-- header start -->
		<view>
			<u-swiper :list="bannerList" mode="rect" height="700" border-radius="0"></u-swiper>
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
				<u-grid-item @click="orderFood(0)">
					<u-image src="https://mp-a83aee34-7c6d-40e3-a241-85ab45b7ff6e.cdn.bspapp.com/cloudstorage/static/index/service.jpg" width="150" height="150"></u-image>
					<view class="body__text">门店堂食</view>
				</u-grid-item>
				<u-grid-item @click="orderFood(1)">
					<u-image src="https://mp-a83aee34-7c6d-40e3-a241-85ab45b7ff6e.cdn.bspapp.com/cloudstorage/static/index/takeaway.jpg" width="150" height="150"></u-image>
					<view class="body__text">外卖配送</view>
				</u-grid-item>
			</u-grid>
		</view>
		<!-- body end -->

		<u-gap height="20" bg-color="#fafafa"></u-gap>

		<!-- integral start -->
		<view class="integral">
			<view>
				<u-image src="https://mp-a83aee34-7c6d-40e3-a241-85ab45b7ff6e.cdn.bspapp.com/cloudstorage/static/index/integral.jpg" width="200" height="200"></u-image>
			</view>
			<view>
				<view class="integral__nav">我的积分：<text>777</text></view>
				<view class="integral__desc">可兑换现金优惠券和周边礼品</view>
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
				<u-grid-item>
					<view class="grid-text">积分商城</view>
					<view class="grid-desc">好多神秘好礼等你</view>
					<u-image src="https://mp-a83aee34-7c6d-40e3-a241-85ab45b7ff6e.cdn.bspapp.com/cloudstorage/static/index/integralShop.png" width="120" height="120"></u-image>
				</u-grid-item>
				<u-grid-item>
					<view class="grid-text">会员中心</view>
					<view class="grid-desc">享受会员的专属权益</view>
					<u-image src="https://mp-a83aee34-7c6d-40e3-a241-85ab45b7ff6e.cdn.bspapp.com/cloudstorage/static/index/vipCenter.png" width="120" height="120"></u-image>
				</u-grid-item>
				<u-grid-item>
					<view class="grid-text">活动中心</view>
					<view class="grid-desc">更多活动等你参加</view>
					<u-image src="https://mp-a83aee34-7c6d-40e3-a241-85ab45b7ff6e.cdn.bspapp.com/cloudstorage/static/index/activityCenter.png" width="120" height="120"></u-image>
				</u-grid-item>
			</u-grid>
		</view>

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

				<u-button class="table-popup__confirm" type="primary" shape="circle" @click="confirmTable">
					确认开始点餐
				</u-button>
			</view>
		</u-popup>
	</view>
</template>

<script>
import dishService from '@/common/services/dish.js'

export default {
	data() {
		return {
			bannerList: ['https://mp-a83aee34-7c6d-40e3-a241-85ab45b7ff6e.cdn.bspapp.com/cloudstorage/static/index/banner.jpg'],
			searchKeyword: '',
			recommendList: [],
			showTableDialog: false,
			tableNo: '',
			peopleCount: 2,
			peopleOptions: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
			selectedPeople: 2,
			isSwitching: false
		}
	},
	onLoad(options) {
		this.handleEntryParams(options || {})
	},
	onShow() {
		this.loadRecommend()
	},
	methods: {
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
		orderFood(tabIndex) {
			uni.setStorageSync('subCurrent', tabIndex)
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
			this.orderFood(0)
		},
		selectPeople(val) {
			this.selectedPeople = val
			this.peopleCount = val
		},
		confirmTable() {
			if (this.tableNo) {
				uni.setStorageSync('tableNo', this.tableNo)
			}
			uni.setStorageSync('peopleCount', this.peopleCount)
			this.showTableDialog = false
			this.orderFood(0)
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

	.table-popup {
		width: 600rpx;
		padding: 48rpx 36rpx 40rpx;
		text-align: center;
		background: #ffffff;
		box-shadow: 0 20rpx 60rpx rgba(0, 0, 0, 0.12);

		&__welcome {
			font-size: 32rpx;
			color: #3a3a3a;
			margin-bottom: 12rpx;
			font-weight: 600;
		}

		&__table {
			font-size: 30rpx;
			color: #666;
			margin-bottom: 12rpx;
		}

		&__table-no {
			color: #000;
			font-weight: 700;
		}

		&__subtitle {
			font-size: 26rpx;
			color: #9b9b9b;
			margin-bottom: 24rpx;
		}

		&__people-title {
			font-size: 26rpx;
			color: #3a3a3a;
			margin-bottom: 18rpx;
			font-weight: 600;
		}

		&__people-grid {
			display: flex;
			flex-wrap: wrap;
			justify-content: space-between;
			gap: 16rpx 12rpx;
			margin-bottom: 32rpx;
		}

		&__people-btn {
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

		&__people-btn.is-active {
			border-color: #5c9bfd;
			background: #e8f0ff;
			color: #2f75ff;
			box-shadow: 0 8rpx 20rpx rgba(47, 117, 255, 0.18);
		}

		&__confirm {
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
