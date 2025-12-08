<template>
	<view class="ledger-page">
		<view v-if="needLogin" class="ledger-empty">
			<u-empty text="请先登录后查看积分流水" mode="data"></u-empty>
		</view>
		<view v-else>
			<view class="ledger-header">
				<view class="ledger-title">积分流水</view>
				<view class="rule-btn" @click="toggleRule">
					<u-icon name="question-circle" size="32" color="#909399" />
					<text>获取规则</text>
				</view>
			</view>
			<view v-if="loading" class="ledger-loading">
				<u-loading icon="circle" :show-text="true" text="加载中..." />
			</view>
			<view v-else>
				<view v-if="!list.length" class="ledger-empty">
					<u-empty text="暂无积分流水" mode="integral" />
				</view>
				<view class="ledger-tip">展示最近 {{ list.length }} 条记录</view>
				<view class="ledger-item" v-for="item in list" :key="item._id">
					<view class="ledger-item__main">
						<view class="ledger-item__event">{{ item.remark || formatEvent(item.event) }}</view>
						<view class="ledger-item__time">{{ formatTime(item.created_at) }}</view>
					</view>
					<view class="ledger-item__change" :class="{ 'is-plus': item.change > 0 }">
						{{ item.change > 0 ? '+' : '' }}{{ item.change }}
					</view>
				</view>
			</view>
		</view>
		<u-popup v-model="rulePopup" mode="center" :mask-close-able="true">
			<view class="rule-popup">
				<view class="rule-popup__title">积分获取规则</view>
				<scroll-view scroll-y class="rule-popup__list">
					<view class="rule-popup__item" v-for="rule in pointRules" :key="rule.event">
						<view class="rule-popup__name">{{ rule.name }}</view>
						<view class="rule-popup__desc">{{ formatRule(rule) }}</view>
					</view>
				</scroll-view>
				<u-button size="mini" type="primary" @click="rulePopup = false">我知道了</u-button>
			</view>
		</u-popup>
	</view>
</template>

<script>
import memberService from '@/common/services/member.js'

export default {
	data() {
		return {
			list: [],
			pointRules: [],
			rulePopup: false,
			loading: false,
			needLogin: false
		}
	},
	onShow() {
		this.fetchLedger()
	},
	methods: {
		async fetchLedger() {
			const profile = memberService.getStoredProfile()
			if (!profile || !profile.userId) {
				this.needLogin = true
				return
			}
			this.needLogin = false
			this.loading = true
			try {
				const [records, rules] = await Promise.all([
					memberService.fetchPointLedger(50),
					memberService.getPointRules()
				])
				this.list = records || []
				this.pointRules = rules || []
			} catch (err) {
				console.warn('fetch ledger failed', err)
				this.list = []
				this.pointRules = []
				this.$u.toast(err.message || '加载失败')
			} finally {
				this.loading = false
			}
		},
		formatEvent(event) {
			const map = {
				daily_sign: '每日签到',
				order_pay: '消费积分',
				review_post: '评价奖励',
				invite_friend: '邀请好友',
				exchange_goods: '积分兑换'
			}
			return map[event] || event
		},
		formatTime(ts) {
			if (!ts) return ''
			const date = new Date(ts)
			const pad = n => String(n).padStart(2, '0')
			return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`
		},
		formatRule(rule) {
			if (!rule) return ''
			if (rule.description) return rule.description
			if (rule.calc_type === 'ratio') {
				return `每消费 1 元积 ${rule.ratio || 0} 分`
			}
			return `完成一次获得 ${rule.value || 0} 分`
		},
		toggleRule() {
			if (!this.pointRules.length) {
				this.$u.toast('暂无规则信息')
				return
			}
			this.rulePopup = true
		}
	}
}
</script>

<style lang="scss">
.ledger-page {
	min-height: 100vh;
	background-color: #f7f8fa;
	padding: 20rpx;
	box-sizing: border-box;
}

.ledger-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 10rpx;
}

.ledger-title {
	font-size: 34rpx;
	font-weight: bold;
}

.rule-btn {
	display: flex;
	align-items: center;
	gap: 8rpx;
	color: #909399;
	font-size: 24rpx;
}

.ledger-loading,
.ledger-empty {
	padding: 120rpx 0;
	display: flex;
	justify-content: center;
}

.ledger-tip {
	font-size: 24rpx;
	color: #909399;
	margin: 10rpx 0 20rpx;
	text-align: center;
}

.ledger-item {
	background: #fff;
	border-radius: 16rpx;
	padding: 24rpx;
	display: flex;
	justify-content: space-between;
	align-items: center;
	box-shadow: 0 8rpx 20rpx rgba(0, 0, 0, 0.05);
	margin-bottom: 16rpx;
}

.ledger-item__event {
	font-size: 30rpx;
	font-weight: 600;
	color: #303133;
}

.ledger-item__time {
	font-size: 24rpx;
	color: #909399;
	margin-top: 6rpx;
}

.ledger-item__change {
	font-size: 34rpx;
	font-weight: bold;
	color: #fa5151;
}

.ledger-item__change.is-plus {
	color: #09bb07;
}

.recent-orders {
	margin-top: 30rpx;
	padding: 24rpx;
	background: #fff;
	border-radius: 16rpx;
	box-shadow: 0 8rpx 20rpx rgba(0, 0, 0, 0.05);
}

.recent-orders__title {
	font-size: 28rpx;
	font-weight: bold;
	margin-bottom: 12rpx;
}

.recent-orders__item {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 16rpx 0;
	border-bottom: 1px solid #f5f5f5;

	&:last-child {
		border-bottom: none;
	}
}

.recent-orders__name {
	font-size: 26rpx;
	font-weight: 500;
	color: #303133;
}

.recent-orders__time {
	font-size: 22rpx;
	color: #909399;
	margin-top: 6rpx;
}

.recent-orders__points {
	font-size: 26rpx;
	font-weight: bold;
	color: #fa5151;
}

.rule-popup {
	width: 600rpx;
	padding: 30rpx;
	background: #fff;
	border-radius: 20rpx;
	box-sizing: border-box;

	&__title {
		text-align: center;
		font-size: 32rpx;
		font-weight: bold;
		margin-bottom: 20rpx;
	}

	&__list {
		max-height: 400rpx;
	}

	&__item {
		margin-bottom: 16rpx;
	}

	&__name {
		font-size: 26rpx;
		font-weight: 600;
	}

	&__desc {
		font-size: 24rpx;
		color: #666;
		margin-top: 6rpx;
		line-height: 1.5;
	}
}
</style>
