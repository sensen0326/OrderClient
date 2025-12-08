<template>
	<view class="review-page">
		<view class="card">
			<view class="card__title">菜品与服务打分</view>
			<view class="rating-item" v-for="item in ratingItems" :key="item.key">
				<view class="rating-item__label">{{ item.label }}</view>
				<u-rate v-model="ratings[item.key]" active-color="#EE2F37" :min-count="1" :count="5"></u-rate>
			</view>
		</view>
		<view class="card">
			<view class="card__title">详细描述</view>
			<u-input
				v-model="content"
				type="textarea"
				:autoHeight="true"
				:clearable="false"
				placeholder="写下口味、环境、服务等真实感受，帮助更多顾客～"
			></u-input>
		</view>

		<view class="card">
			<view class="card__title">可选信息</view>
			<u-switch v-model="isAnonymous" active-color="#EE2F37">匿名展示</u-switch>
		</view>

		<u-gap height="20"></u-gap>

		<u-button type="primary" :loading="submitting" @click="handleSubmit">提交评价</u-button>
	</view>
</template>

<script>
	import reviewService from '@/common/services/review.js'

	export default {
		data() {
			return {
				orderNo: '',
				ratings: {
					taste: 5,
					env: 5,
					service: 5
				},
				content: '',
				isAnonymous: false,
				submitting: false,
				existingReview: null
			}
		},
		computed: {
			ratingItems() {
				return [{
					key: 'taste',
					label: '口味'
				}, {
					key: 'env',
					label: '环境'
				}, {
					key: 'service',
					label: '服务'
				}]
			}
		},
		onLoad(options) {
			this.orderNo = options?.orderNo || ''
			if (!this.orderNo) {
				this.$u.toast('缺少订单信息')
				return
			}
			this.loadExisting()
		},
		methods: {
			async loadExisting() {
				try {
					const list = await reviewService.listByOrder(this.orderNo)
					this.existingReview = list && list.length ? list[0] : null
					if (this.existingReview) {
						this.ratings = {
							taste: this.existingReview.rating_taste || 5,
							env: this.existingReview.rating_env || 5,
							service: this.existingReview.rating_service || 5
						}
						this.content = this.existingReview.content || ''
						this.isAnonymous = !!this.existingReview.is_anonymous
					}
				} catch (err) {
					console.warn('load review failed', err)
				}
			},
			async handleSubmit() {
				if (this.existingReview) {
					return this.$u.toast('已提交过评价')
				}
				if (!this.content.trim()) {
					return this.$u.toast('请填写评价内容')
				}
				this.submitting = true
				try {
					await reviewService.submitReview({
						orderNo: this.orderNo,
						ratings: this.ratings,
						content: this.content,
						isAnonymous: this.isAnonymous
					})
					this.$u.toast('感谢评价')
					setTimeout(() => {
						uni.navigateBack()
					}, 500)
				} catch (err) {
					console.error('submit review failed', err)
					this.$u.toast(err.message || '提交失败')
				} finally {
					this.submitting = false
				}
			}
		}
	}
</script>

<style lang="scss" scoped>
	.review-page {
		padding: 30rpx;
	}

	.card {
		background: #fff;
		padding: 24rpx 30rpx;
		border-radius: 24rpx;
		box-shadow: 0 10rpx 30rpx rgba(0, 0, 0, 0.05);
		margin-bottom: 30rpx;

		&__title {
			font-size: 30rpx;
			font-weight: bold;
			margin-bottom: 20rpx;
		}
	}

	.rating-item {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 18rpx;

		&__label {
			font-size: 28rpx;
			color: #303133;
		}
	}
</style>
