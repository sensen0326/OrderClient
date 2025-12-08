<template>
	<view class="support-page">
		<view class="card">
			<view class="card__title">快速售后</view>
			<u-form :model="form" label-width="150">
				<u-form-item label="订单号">
					<u-input v-model="form.orderNo" placeholder="可选，填写后便于定位订单" />
				</u-form-item>
				<u-form-item label="问题类型">
					<u-select v-model="form.category" :list="categoryOptions" @confirm="handleCategorySelect"></u-select>
				</u-form-item>
				<u-form-item label="问题描述">
					<u-input
						v-model="form.description"
						type="textarea"
						:autoHeight="true"
						:clearable="false"
						placeholder="请输入售后诉求或客服问题"
					/>
				</u-form-item>
				<u-form-item label="联系电话">
					<u-input v-model="form.contact" placeholder="便于客服联系您" />
				</u-form-item>
			</u-form>
			<u-button type="primary" :loading="submitting" @click="submitTicket">提交工单</u-button>
		</view>

		<view class="card">
			<view class="card__title">我的售后记录</view>
			<view v-if="loadingTickets" class="empty">加载中...</view>
			<view v-else-if="!tickets.length" class="empty">暂无售后记录</view>
			<view v-else>
				<view class="ticket-item" v-for="ticket in tickets" :key="ticket.ticket_no">
					<view class="ticket-item__header">
						<text class="ticket-item__no">{{ ticket.ticket_no }}</text>
						<text class="ticket-item__status">{{ statusText(ticket.status) }}</text>
					</view>
					<view class="ticket-item__desc">{{ ticket.description }}</view>
					<view class="ticket-item__meta">
						<text>{{ formatTime(ticket.created_at) }}</text>
						<text v-if="ticket.order_no">订单号：{{ ticket.order_no }}</text>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	import supportService from '@/common/services/support.js'

	export default {
		data() {
			return {
				form: {
					orderNo: '',
					category: 'after_sale',
					description: '',
					contact: ''
				},
				categoryOptions: [{
					label: '售后问题',
					value: 'after_sale'
				}, {
					label: '配送/外卖',
					value: 'delivery'
				}, {
					label: '投诉建议',
					value: 'complaint'
				}, {
					label: '其他咨询',
					value: 'other'
				}],
				tickets: [],
				loadingTickets: false,
				submitting: false
			}
		},
		onShow() {
			this.loadTickets()
		},
		methods: {
			async loadTickets() {
				this.loadingTickets = true
				try {
					this.tickets = await supportService.listTickets()
				} catch (err) {
					console.error('load tickets failed', err)
					this.$u.toast(err.message || '加载失败')
				} finally {
					this.loadingTickets = false
				}
			},
			handleCategorySelect({ value }) {
				if (Array.isArray(value) && value.length) {
					this.form.category = value[0].value
				}
			},
			async submitTicket() {
				if (!this.form.description.trim()) {
					return this.$u.toast('请填写问题描述')
				}
				this.submitting = true
				try {
					await supportService.createTicket({ ...this.form })
					this.$u.toast('提交成功，客服将尽快联系您')
					this.form.description = ''
					this.form.orderNo = ''
					this.loadTickets()
				} catch (err) {
					console.error('submit ticket failed', err)
					this.$u.toast(err.message || '提交失败')
				} finally {
					this.submitting = false
				}
			},
			formatTime(timestamp) {
				if (!timestamp) return '--'
				const date = new Date(Number(timestamp))
				return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
			},
			statusText(status) {
				const map = {
					pending: '待处理',
					replied: '已回复',
					resolved: '已完成'
				}
				return map[status] || status
			}
		}
	}
</script>

<style lang="scss" scoped>
	.support-page {
		padding: 30rpx;
	}

	.card {
		background: #fff;
		border-radius: 24rpx;
		box-shadow: 0 10rpx 30rpx rgba(0, 0, 0, 0.05);
		padding: 30rpx;
		margin-bottom: 30rpx;

		&__title {
			font-size: 30rpx;
			font-weight: bold;
			margin-bottom: 20rpx;
		}
	}

	.ticket-item {
		padding: 20rpx 0;
		border-bottom: 1px solid #f3f4f6;

		&:last-child {
			border-bottom: none;
		}

		&__header {
			display: flex;
			justify-content: space-between;
			align-items: center;
		}

		&__no {
			font-weight: bold;
			color: #303133;
		}

		&__status {
			color: #EE2F37;
			font-size: 26rpx;
		}

		&__desc {
			margin: 10rpx 0;
			color: #606266;
			font-size: 26rpx;
		}

		&__meta {
			color: #909399;
			font-size: 22rpx;
			display: flex;
			justify-content: space-between;
		}
	}

	.empty {
		text-align: center;
		color: #909399;
		padding: 30rpx 0;
	}
</style>
