<template>
	<view class="message-page">
		<view class="actions">
			<u-button size="mini" type="default" @click="refresh">刷新</u-button>
			<u-button size="mini" type="primary" plain @click="markAll">全部已读</u-button>
		</view>

		<view class="message-card" v-for="msg in messages" :key="msg._id">
			<view class="message-card__header">
				<view class="message-card__title">{{ msg.title || '系统通知' }}</view>
				<view class="message-card__badge" v-if="!msg.is_read">未读</view>
			</view>
			<view class="message-card__content">{{ msg.content }}</view>
			<view class="message-card__time">{{ formatTime(msg.created_at) }}</view>
		</view>

		<view class="empty" v-if="!messages.length && !loading">暂无消息</view>
	</view>
</template>

<script>
	import messageService from '@/common/services/message.js'

	export default {
		data() {
			return {
				messages: [],
				loading: false
			}
		},
		onShow() {
			this.refresh()
		},
		methods: {
			async refresh() {
				this.loading = true
				try {
					this.messages = await messageService.listMessages()
				} catch (err) {
					console.error('load messages failed', err)
					this.$u.toast(err.message || '加载失败')
				} finally {
					this.loading = false
				}
			},
			async markAll() {
				try {
					await messageService.markRead()
					this.refresh()
					this.$u.toast('已更新为已读')
				} catch (err) {
					this.$u.toast(err.message || '操作失败')
				}
			},
			formatTime(timestamp) {
				if (!timestamp) return '--'
				const date = new Date(Number(timestamp))
				return `${date.getMonth() + 1}月${date.getDate()}日 ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
			}
		}
	}
</script>

<style lang="scss" scoped>
	.message-page {
		padding: 30rpx;
	}

	.actions {
		display: flex;
		justify-content: flex-end;
		gap: 20rpx;
		margin-bottom: 20rpx;
	}

	.message-card {
		background: #fff;
		padding: 24rpx 30rpx;
		border-radius: 24rpx;
		box-shadow: 0 10rpx 30rpx rgba(0, 0, 0, 0.04);
		margin-bottom: 24rpx;

		&__header {
			display: flex;
			align-items: center;
			justify-content: space-between;
		}

		&__title {
			font-size: 30rpx;
			font-weight: bold;
			color: #303133;
		}

		&__badge {
			background: #EE2F37;
			color: #fff;
			padding: 6rpx 16rpx;
			font-size: 22rpx;
			border-radius: 999rpx;
		}

		&__content {
			margin-top: 12rpx;
			color: #606266;
			font-size: 26rpx;
			line-height: 1.5;
		}

		&__time {
			margin-top: 12rpx;
			color: #909399;
			font-size: 22rpx;
		}
	}

	.empty {
		text-align: center;
		color: #909399;
		margin-top: 60rpx;
	}
</style>
