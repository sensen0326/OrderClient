<template>
	<view class="my-wrap">
		<view class="header">
			<view class="header__bg"></view>
			<view class="header__card">
				<view class="header__info">
					<view class="header__name">{{ isLoggedIn ? (userProfile.nickname || '会员') : '登录解锁更多权益' }}</view>
					<view class="header__hint">{{ isLoggedIn ? '' : '新用户注册立得积分好礼' }}</view>
					<view class="header__level" v-if="isLoggedIn">
						<u-tag :text="userProfile.level_name || 'V0'" mode="plain" border-color="#EE2F37" color="#EE2F37" size="mini" shape="circle" />
						<text class="header__vip-desc" v-if="userProfile.next_level_need">
							距{{ userProfile.next_level_name || '下一级' }} 还差 {{ userProfile.next_level_need }} 积分
						</text>
					</view>
					<u-line-progress v-if="isLoggedIn" active-color="#EE2F37" :percent="userProfile.level_progress || 0" />
					<view class="header__phone" v-if="isLoggedIn">
						<text class="label">手机号码</text>
						<text class="value" v-if="userProfile.mobile">{{ userProfile.mobile }}</text>
						<u-button
							v-else
							size="mini"
							type="primary"
							:loading="phoneAuthLoading"
							open-type="getPhoneNumber"
							@getphonenumber="handleGetPhoneNumber"
						>
							授权手机号
						</u-button>
					</view>
				</view>
				<view class="header__avatar">
					<u-avatar :src="userProfile.avatar || defaultAvatar" size="160" />
					<u-button v-if="!isLoggedIn" size="mini" type="primary" @click="handleLogin">登录</u-button>
					<u-button v-else size="mini" plain @click="openProfileEditor">编辑资料</u-button>
				</view>
			</view>
		</view>

		<view class="points-card" v-if="isLoggedIn">
			<view class="points-card__header">
				<view>
					<view class="points-card__label">我的积分</view>
					<view class="points-card__value">{{ userProfile.points || 0 }}</view>
				</view>
				<u-button size="mini" type="primary" plain @click="goPointLedger">查看明细</u-button>
			</view>
			<view class="points-card__progress" v-if="userProfile.next_level_need">
				<text class="points-card__progress-text">距 {{ userProfile.next_level_name || '下一级' }} 还差 {{ userProfile.next_level_need }} 积分</text>
				<u-line-progress :percent="userProfile.level_progress || 0" height="10" active-color="#EE2F37" background-color="#ffd9da" />
			</view>
			<view class="points-card__footer">
				<view class="points-card__item">
					<text class="points-card__item-label">最近变化</text>
					<view class="points-card__chip">
						<text class="points-card__chip-change">{{ lastLedgerValue }}</text>
						<text class="points-card__chip-time">{{ lastLedgerTime }}</text>
					</view>
				</view>
			</view>
		</view>

		<view class="coupon-center">
			<view class="coupon-center__header">
				<text>优惠券中心</text>
				<u-button size="mini" plain :loading="couponLoading" @click="refreshCoupons">刷新</u-button>
			</view>
			<view v-if="couponLoading" class="coupon-center__loading">
				<u-loading mode="circle" color="#EE2F37" :show-text="true" text="加载中..." />
			</view>
			<scroll-view v-else-if="couponTemplates.length" scroll-x class="coupon-center__list" show-scrollbar="false">
				<view class="coupon-card" v-for="tpl in couponTemplates" :key="tpl._id">
					<view class="coupon-card__amount">￥{{ tpl.amount }}</view>
					<view class="coupon-card__title">{{ tpl.title }}</view>
					<view class="coupon-card__desc">满{{ tpl.threshold }} 元可用</view>
					<view class="coupon-card__tag" v-if="tpl.channel_limit && tpl.channel_limit !== 'all'">
						{{ tpl.channel_limit === 'takeout' ? '外卖' : '堂食' }}
					</view>
					<u-button size="mini" type="primary" @click="handleClaim(tpl)">领取</u-button>
				</view>
			</scroll-view>
			<view v-else class="coupon-empty">
				<text>暂无优惠券，去领一张吧~</text>
				<u-button class="coupon-empty__btn" size="mini" type="primary" plain @click="handleGoClaim">立即去领取</u-button>
			</view>
			<view class="coupon-center__mine">
				<view class="section-title">我的优惠券</view>
				<view v-if="myCoupons.length">
					<view class="mine-coupon" v-for="coupon in myCoupons" :key="coupon._id">
						<view>
							<view class="mine-coupon__title">{{ coupon.title }}</view>
							<view class="mine-coupon__desc">满{{ coupon.threshold }} 减{{ coupon.amount }}</view>
						</view>
						<text class="mine-coupon__status">{{ coupon.status === 'unused' ? '未使用' : '已使用' }}</text>
					</view>
				</view>
				<view v-else class="coupon-empty coupon-empty--mine">
					<text>你还没有领取任何优惠券</text>
					<u-button class="coupon-empty__btn" size="mini" type="primary" plain @click="handleGoClaim">去看看</u-button>
				</view>
			</view>
		</view>

		<view class="point-goods" v-if="pointGoods.length">
			<view class="section-title">积分商城</view>
			<view class="point-goods__grid">
				<view class="point-goods__item" v-for="goods in pointGoods" :key="goods.__id">
					<image :src="goods.cover" mode="aspectFill" />
					<view class="point-goods__name">{{ goods.name }}</view>
					<view class="point-goods__cost">{{ goods.cost_points }} 积分</view>
					<u-button size="mini" type="primary" plain @click="handleExchange(goods)">兑换</u-button>
				</view>
			</view>
		</view>

		<view class="operation-section" v-if="operationQuickLinks.length">
			<view class="section-title">精选推荐</view>
			<scroll-view scroll-x class="operation-section__scroll" show-scrollbar="false">
				<view class="operation-card" v-for="card in operationQuickLinks" :key="card.title" @click="handleOperationCard(card, 'my_quick_link')">
					<image :src="card.image" mode="aspectFill" />
					<view class="operation-card__body">
						<view class="operation-card__title">{{ card.title }}</view>
						<view class="operation-card__desc">{{ card.desc }}</view>
					</view>
				</view>
			</scroll-view>
		</view>

		<view class="operation-campaigns" v-if="operationCampaigns.length">
			<view class="section-title">专属权益</view>
			<view class="operation-campaigns__grid">
				<view class="operation-campaign" v-for="card in operationCampaigns" :key="card.title" @click="handleOperationCard(card, 'my_campaign')">
					<image :src="card.image" mode="aspectFill" />
					<view class="operation-campaign__info">
						<view class="operation-campaign__title">{{ card.title }}</view>
						<view class="operation-campaign__desc">{{ card.desc }}</view>
					</view>
				</view>
			</view>
		</view>

		<view class="service-list">
			<view class="section-title">我的服务</view>
			<u-grid :col="4" :border="false">
				<u-grid-item v-for="item in serviceList" :key="item.text" @click="handleServiceClick(item.text)">
					<u-icon :name="item.icon" :size="50" />
					<view class="grid-box__text">{{ item.text }}</view>
				</u-grid-item>
			</u-grid>
		</view>

		<view class="links">
			<u-cell-group>
				<u-cell-item icon="rmb-circle" title="我的钱包" />
				<u-cell-item icon="order" title="我的订单" />
				<u-cell-item icon="coupon" title="我的优惠券" @click="refreshCoupons" />
				<u-cell-item icon="chat" title="消息中心" @click="goMessageCenter" />
				<u-cell-item icon="edit-pen" title="意见反馈" />
				<u-cell-item icon="star" title="给个好评" />
			</u-cell-group>
		</view>

		<u-popup v-model="showProfileModal" mode="center" :mask-close-able="false">
			<view class="profile-modal">
				<view class="profile-modal__title">完善个人信息</view>
				<view class="profile-modal__field">
					<text class="label">头像</text>
					<button class="avatar-btn" open-type="chooseAvatar" @chooseavatar="handleAvatarChoose">
						<u-avatar :src="profileForm.avatarTemp || profileForm.avatar || defaultAvatar" size="120" />
					</button>
				</view>
				<view class="profile-modal__field">
					<text class="label">昵称</text>
					<input class="profile-input" type="nickname" v-model="profileForm.nickname" placeholder="请输入昵称" />
				</view>
				<view class="profile-modal__actions">
					<u-button plain size="mini" @click="showProfileModal = false" :disabled="profileSubmitting">稍后再说</u-button>
					<u-button type="primary" size="mini" :loading="profileSubmitting" @click="submitProfile">保存</u-button>
				</view>
			</view>
		</u-popup>
	</view>
</template>

<script>
import memberService from '@/common/services/member.js'
import couponService from '@/common/services/coupon.js'
import authService from '@/common/services/auth.js'
import operationService from '@/common/services/operation.js'
import analyticsService from '@/common/services/analytics.js'

const TAB_PAGES = ['/pages/index/index', '/pages/menu/menu', '/pages/order/list', '/pages/my/my']

export default {
	data() {
		const stored = memberService.getStoredProfile()
		return {
			defaultAvatar: 'https://mp-a83aee34-7c6d-40e3-a241-85ab45b7ff6e.cdn.bspapp.com/cloudstorage/static/my/avatarurl.jpg',
			userProfile: stored || {
				nickname: '未登录',
				points: 0,
				level_name: 'V0',
				level_progress: 0
			},
			isLoggedIn: !!(stored && stored.userId),
			signInLoading: false,
			couponLoading: false,
			couponTemplates: [],
			myCoupons: [],
			pointGoods: [],
			levelRules: [],
			pointLedger: [],
			phoneAuthLoading: false,
			operationQuickLinks: [],
			operationCampaigns: [],
			serviceList: [
				{ icon: 'https://mp-a83aee34-7c6d-40e3-a241-85ab45b7ff6e.cdn.bspapp.com/cloudstorage/static/my/icon-1.png', text: '积分签到' },
				{ icon: 'https://mp-a83aee34-7c6d-40e3-a241-85ab45b7ff6e.cdn.bspapp.com/cloudstorage/static/my/icon-2.png', text: '积分商城' },
				{ icon: 'https://mp-a83aee34-7c6d-40e3-a241-85ab45b7ff6e.cdn.bspapp.com/cloudstorage/static/my/icon-3.png', text: '领券中心' },
				{ icon: 'https://mp-a83aee34-7c6d-40e3-a241-85ab45b7ff6e.cdn.bspapp.com/cloudstorage/static/my/icon-4.png', text: '联系客服' }
			],
			showProfileModal: false,
			profileSubmitting: false,
			profileForm: {
				nickname: '',
				avatar: '',
				avatarTemp: ''
			}
		}
	},
	onShow() {
		this.initMemberData()
		this.loadOperationSlots()
		analyticsService.track('page_view', {
			page: 'my'
		})
	},
	computed: {
		pointLedgerSummary() {
			if (!this.pointLedger.length) return '暂无记录'
			const record = this.pointLedger[0]
			const change = record.change > 0 ? `+${record.change}` : record.change
			return `${change}`
		},
		lastLedgerValue() {
			if (!this.pointLedger.length) return '--'
			const record = this.pointLedger[0]
			return record.change > 0 ? `+${record.change}` : `${record.change}`
		},
		lastLedgerTime() {
			if (!this.pointLedger.length) return '--'
			const record = this.pointLedger[0]
			return this.formatRecordTime(record.created_at)
		}
	},
	methods: {
		async loadOperationSlots() {
			try {
				const slots = await operationService.fetchSlots(['my_quick_links', 'my_campaigns'])
				this.operationQuickLinks = (slots.my_quick_links && slots.my_quick_links.items) || []
				this.operationCampaigns = (slots.my_campaigns && slots.my_campaigns.items) || []
			} catch (err) {
				console.warn('load my operation slots failed', err)
				this.operationQuickLinks = []
				this.operationCampaigns = []
			}
		},
		handleOperationCard(item, source = 'my') {
			if (!item) return
			analyticsService.track('operation_click', {
				source,
				title: item.title,
				action: item.action,
				target: item.target
			})
			this.openOperationTarget(item)
		},
		openOperationTarget(item = {}) {
			const action = item.action || 'page'
			if ((action === 'tab' || action === 'page' || action === 'url') && item.target) {
				this.navigateSmart(item.target)
			}
		},
		navigateSmart(url) {
			if (!url) return
			if (TAB_PAGES.includes(url)) {
				uni.switchTab({ url })
			} else {
				uni.navigateTo({ url })
			}
		},
		withDefaultAvatar(profile = {}) {
			if (!profile) return profile
			return profile.avatar ? profile : { ...profile, avatar: this.defaultAvatar }
		},
		async initMemberData() {
			try {
				await this.loadLevelRules()
				const profile = await memberService.fetchProfile()
				if (profile) {
					this.userProfile = this.withDefaultAvatar(profile)
					this.isLoggedIn = true
					this.ensureProfileInfo()
					this.loadPointLedger()
				} else {
					this.isLoggedIn = false
					this.pointLedger = []
				}
			} catch (err) {
				console.warn('fetch profile failed', err)
				this.pointLedger = []
			}
			this.loadPointGoods()
			this.refreshCoupons()
		},
		async handleLogin() {
			try {
				let userInfo = null
				if (typeof uni !== 'undefined' && typeof uni.getUserProfile === 'function') {
					const res = await uni.getUserProfile({
						desc: '用于完善会员资料'
					})
					userInfo = res.userInfo
				}
				const result = await memberService.login({
					nickname: userInfo && userInfo.nickName,
					avatar: userInfo && userInfo.avatarUrl,
					userInfo
				})
				const profile = result && result.profile ? result.profile : result
				this.userProfile = this.withDefaultAvatar(profile)
				this.isLoggedIn = true
				this.$u.toast('登录成功')
				this.initMemberData()
				this.loadPointLedger()
				if ((result && result.isNew) || !profile.avatar || !profile.nickname) {
					this.prepareProfileForm(profile)
					this.showProfileModal = true
				}
			} catch (err) {
				console.warn('login failed', err)
				this.$u.toast(err.message || '登录失败')
			}
		},
		async handleSignIn() {
			if (!this.isLoggedIn) {
				this.$u.toast('请先登录')
				return
			}
			this.signInLoading = true
			try {
				const res = await memberService.signIn()
				if (res && res.profile) {
					this.userProfile = this.withDefaultAvatar(res.profile)
				}
				this.loadPointLedger()
				this.$u.toast('签到成功')
			} catch (err) {
				this.$u.toast(err.message || '今日已签到')
			} finally {
				this.signInLoading = false
			}
		},
		async handleGetPhoneNumber(e) {
			if (!this.isLoggedIn) {
				this.$u.toast('请先登录')
				return
			}
			if (!e.detail || e.detail.errMsg !== 'getPhoneNumber:ok') {
				const errMsg = e && e.detail && e.detail.errMsg ? e.detail.errMsg : '未授权手机号'
				console.warn('getPhoneNumber rejected', e && e.detail ? e.detail : e)
				this.$u.toast(errMsg)
				return
			}
			const code = e.detail.code
			if (!code) {
				console.warn('getPhoneNumber missing code', e.detail)
				this.$u.toast('授权信息无效：未拿到 code')
				return
			}
			this.phoneAuthLoading = true
			try {
				const res = await authService.bindPhoneNumber(code, this.userProfile.userId)
				if (res && res.phoneNumber) {
					this.userProfile = Object.assign({}, this.userProfile, {
						mobile: res.phoneNumber
					})
					memberService.saveProfile(this.userProfile, memberService.getStoredToken ? memberService.getStoredToken() : '')
					this.$u.toast('手机号已更新')
				} else {
					this.$u.toast('未获取到手机号')
				}
			} catch (err) {
				console.warn('bind phone failed', err)
				this.$u.toast(err.message || '绑定失败')
			} finally {
				this.phoneAuthLoading = false
			}
		},
		async loadLevelRules() {
			try {
				const rules = await memberService.getLevelRules()
				this.levelRules = rules || []
			} catch (err) {
				console.warn('load level rules failed', err)
				this.levelRules = []
			}
		},
		async loadPointLedger() {
			if (!this.isLoggedIn) {
				this.pointLedger = []
				return
			}
			try {
				this.pointLedger = await memberService.fetchPointLedger(10)
			} catch (err) {
				console.warn('load ledger failed', err)
				this.pointLedger = []
			}
		},
		async loadPointGoods() {
			try {
				const list = await memberService.listPointGoods()
				this.pointGoods = (list || []).map(item =>
					Object.assign({}, item, {
						__id: item._id || item.goods_id || item.id || `${item.name}_${Date.now()}`
					})
				)
			} catch (err) {
				console.warn('load goods failed', err)
				this.pointGoods = []
			}
		},
		async refreshCoupons() {
			this.couponLoading = true
			try {
				this.couponTemplates = await listCouponTemplates()
				if (this.userProfile && this.userProfile.userId) {
					this.myCoupons = await couponService.listMy(this.userProfile.userId)
				} else {
					this.myCoupons = []
				}
			} catch (err) {
				console.warn('load coupons failed', err)
				this.myCoupons = []
			} finally {
				this.couponLoading = false
			}
		},
		async handleClaim(tpl) {
			if (!this.isLoggedIn) {
				this.$u.toast('请先登录后领取')
				return
			}
			try {
				await couponService.claim(tpl._id || tpl.id, this.userProfile.userId)
				this.$u.toast('领取成功')
				this.refreshCoupons()
			} catch (err) {
				this.$u.toast(err.message || '领取失败')
			}
		},
		async handleExchange(goods) {
			if (!this.isLoggedIn) {
				this.$u.toast('请先登录')
				return
			}
			try {
				const goodsId = goods._id || goods.goods_id || goods.id || goods.__id
				const res = await memberService.exchangeGoods(goodsId)
				if (res && res.profile) {
					this.userProfile = this.withDefaultAvatar(res.profile)
				}
				if (res && res.pointOrder) {
					this.loadPointLedger()
				}
				this.$u.toast('兑换成功')
			} catch (err) {
				this.$u.toast(err.message || '兑换失败')
			}
		},
		handleServiceClick(name) {
			analyticsService.track('service_entry_click', {
				name
			})
			if (name === '积分签到') {
				this.handleSignIn()
			} else if (name === '积分商城') {
				this.loadPointGoods()
			} else if (name === '领券中心') {
				this.refreshCoupons()
			} else if (name === '联系客服') {
				this.goSupportCenter()
			} else {
				this.$u.toast(`${name} 敬请期待`)
			}
		},
		goSupportCenter() {
			if (!this.isLoggedIn) {
				this.$u.toast('请先登录')
				return
			}
			analyticsService.track('support_entry', {
				source: 'my_service'
			})
			uni.navigateTo({
				url: '/subPack/service/supportCenter'
			})
		},
		goMessageCenter() {
			if (!this.isLoggedIn) {
				this.$u.toast('请先登录')
				return
			}
			analyticsService.track('message_center_entry', {
				source: 'my_links'
			})
			uni.navigateTo({
				url: '/subPack/service/messageCenter'
			})
		},
		goPointLedger() {
			if (!this.isLoggedIn) {
				this.$u.toast('请先登录')
				return
			}
			uni.navigateTo({
				url: '/subPack/member/pointLedger'
			})
		},
		formatPointStatus(status) {
			const map = {
				pending: '待处理',
				processing: '处理中',
				completed: '已完成',
				cancelled: '已取消'
			}
			return map[status] || '处理中'
		},
		formatRecordTime(ts) {
			if (!ts) return ''
			const date = new Date(ts)
			const pad = n => String(n).padStart(2, '0')
			return `${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`
		},
		prepareProfileForm(profile) {
			this.profileForm = {
				nickname: profile.nickname || '',
				avatar: profile.avatar || '',
				avatarTemp: ''
			}
		},
		openProfileEditor() {
			if (!this.isLoggedIn) {
				this.handleLogin()
				return
			}
			this.prepareProfileForm(this.userProfile)
			this.showProfileModal = true
		},
		ensureProfileInfo() {
			if (this.userProfile && !this.userProfile.avatar) {
				this.prepareProfileForm(this.userProfile)
				this.showProfileModal = true
			}
		},
		handleAvatarChoose(e) {
			const avatarUrl = e.detail && e.detail.avatarUrl
			if (!avatarUrl) return
			this.profileForm.avatarTemp = avatarUrl
		},
		async uploadAvatarIfNeeded() {
			if (!this.profileForm.avatarTemp) {
				return this.profileForm.avatar
			}
			try {
				const cloudPath = `/cloudstorage/avatar/${Date.now()}-${Math.floor(Math.random() * 100000)}.png`
				const uploadRes = await uniCloud.uploadFile({
					cloudPath,
					filePath: this.profileForm.avatarTemp,
					fileType: 'image'
				})
				const fileID = uploadRes.fileID
				const urlRes = await uniCloud.getTempFileURL({
					fileList: [fileID]
				})
				const tempUrl = urlRes.fileList?.[0]?.tempFileURL || ''
				return tempUrl || this.profileForm.avatarTemp
			} catch (err) {
				console.warn('upload avatar failed', err)
				this.$u.toast('头像上传失败')
				return this.profileForm.avatarTemp || this.profileForm.avatar
			}
		},
		async submitProfile() {
			if (!this.profileForm.nickname) {
				this.$u.toast('请输入昵称')
				return
			}
			this.profileSubmitting = true
			try {
				const avatarUrl = await this.uploadAvatarIfNeeded()
				const profile = await memberService.updateProfile({
					userId: this.userProfile.userId,
					nickname: this.profileForm.nickname,
					avatar: avatarUrl
				})
				this.userProfile = this.withDefaultAvatar(profile)
				this.showProfileModal = false
				this.$u.toast('资料已更新')
			} catch (err) {
				console.warn('submit profile failed', err)
				this.$u.toast(err.message || '更新失败')
			} finally {
				this.profileSubmitting = false
			}
		},
		handleGoClaim() {
			this.$u.toast('优惠券中心即将开放，敬请期待')
		}
	}
}

async function listCouponTemplates() {
	try {
		const list = await couponService.listTemplates({
			channel: 'all'
		})
		return list || []
	} catch (err) {
		console.warn('list templates failed', err)
		return []
	}
}
</script>

<style lang="scss">
.my-wrap {
	min-height: 100vh;
	background-color: #f6f7fb;
	padding-bottom: 40rpx;
}

.header {
	position: relative;
	padding-bottom: 140rpx;

	&__bg {
		height: 360rpx;
		background-color: #ee2f37;
	}

	&__card {
		position: absolute;
		left: 30rpx;
		right: 30rpx;
		top: 120rpx;
		background: #fff;
		border-radius: 20rpx;
		padding: 30rpx;
		display: flex;
		justify-content: space-between;
		box-shadow: 0 20rpx 40rpx rgba(238, 47, 55, 0.15);
	}

	&__info {
		flex: 1;
		padding-right: 20rpx;
	}

	&__name {
		font-size: 34rpx;
		font-weight: bold;
		margin-bottom: 10rpx;
	}

	&__hint {
		font-size: 24rpx;
		color: #909399;
		margin-bottom: 12rpx;
	}

	&__level {
		display: flex;
		align-items: center;
		gap: 14rpx;
		margin-bottom: 16rpx;
	}

	&__vip-desc {
		font-size: 24rpx;
		color: #909399;
	}

	&__points {
		margin-top: 20rpx;
		display: flex;
		justify-content: space-between;
		align-items: center;

		.label {
			font-size: 26rpx;
			color: #909399;
		}

		.value {
			font-size: 42rpx;
			font-weight: bold;
			margin-left: 10rpx;
		}

		.value.placeholder {
			color: #c0c4cc;
			font-weight: normal;
		}
	}

	&__phone {
		margin-top: 10rpx;
		display: flex;
		align-items: center;
		gap: 12rpx;

		.label {
			font-size: 24rpx;
			color: #909399;
		}

		.value {
			font-size: 30rpx;
			font-weight: bold;
		}
	}

	&__avatar {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 12rpx;
	}
}

.coupon-center {
	margin: 20rpx 30rpx;
	padding: 30rpx;
	background: #fff;
	border-radius: 20rpx;
	box-shadow: 0 10rpx 30rpx rgba(0, 0, 0, 0.05);

	&__header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 20rpx;
		font-weight: bold;
		font-size: 30rpx;
	}

	&__list {
		white-space: nowrap;
		padding-bottom: 10rpx;
	}

	&__loading {
		display: flex;
		justify-content: center;
		align-items: center;
		padding: 40rpx 0;
	}

	&__mine {
		margin-top: 30rpx;
	}
}

.coupon-card {
	display: inline-flex;
	flex-direction: column;
	width: 240rpx;
	padding: 20rpx;
	margin-right: 20rpx;
	border-radius: 16rpx;
	background: linear-gradient(135deg, #ffefe7, #ffe8f0);
	box-shadow: 0 10rpx 20rpx rgba(255, 144, 144, 0.2);

	&__amount {
		font-size: 36rpx;
		font-weight: bold;
		color: #fa5151;
	}

	&__title {
		font-size: 28rpx;
		margin-top: 8rpx;
		font-weight: 600;
	}

	&__desc {
		font-size: 22rpx;
		color: #909399;
		margin: 6rpx 0 10rpx;
	}

	&__tag {
		align-self: flex-start;
		padding: 4rpx 12rpx;
		border-radius: 999rpx;
		background: rgba(238, 47, 55, 0.15);
		font-size: 20rpx;
		color: #ea3a3a;
		margin-bottom: 10rpx;
	}
}

.coupon-empty {
	margin-top: 20rpx;
	text-align: center;
	color: #909399;
	font-size: 26rpx;
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 16rpx;

	&__btn {
		border-radius: 999rpx;
		padding: 0 40rpx;
	}
}

.mine-coupon {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 20rpx 0;
	border-bottom: 1px solid #f0f0f0;

	&__title {
		font-size: 28rpx;
		font-weight: bold;
	}

	&__desc {
		font-size: 24rpx;
		color: #909399;
		margin-top: 6rpx;
	}

	&__status {
		font-size: 24rpx;
		color: #fa5151;
	}
}

.points-card {
	margin: -40rpx 30rpx 20rpx;
	padding: 30rpx;
	background: #fff;
	border-radius: 20rpx;
	box-shadow: 0 10rpx 30rpx rgba(238, 47, 55, 0.15);

	&__header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 20rpx;
	}

	&__label {
		font-size: 26rpx;
		color: #909399;
	}

	&__value {
		font-size: 52rpx;
		font-weight: bold;
		color: #ee2f37;
	}

	&__progress {
		margin-bottom: 20rpx;

		&-text {
			display: block;
			font-size: 24rpx;
			color: #909399;
			margin-bottom: 8rpx;
		}
	}

	&__footer {
		margin-top: 20rpx;
		background: linear-gradient(90deg, rgba(238, 47, 55, 0.08), rgba(238, 47, 55, 0.02));
		border-radius: 14rpx;
		padding: 20rpx;
	}

	&__item {
		display: flex;
		align-items: center;
		gap: 16rpx;
	}

	&__item-label {
		font-size: 26rpx;
		color: #606266;
		font-weight: 500;
		min-width: 120rpx;
	}
	&__chip {
		display: inline-flex;
		align-items: center;
		gap: 16rpx;
		background: #fff;
		border-radius: 999rpx;
		padding: 10rpx 28rpx;
		border: 1px solid rgba(238, 47, 55, 0.2);
		box-shadow: 0 6rpx 16rpx rgba(238, 47, 55, 0.1);
		margin-left: 30rpx;
	}

	&__chip-change {
		font-size: 36rpx;
		font-weight: 600;
		color: #303133;
	}

	&__chip-time {
		font-size: 24rpx;
		color: #909399;
	}

}

.point-goods {
	margin: 20rpx 30rpx;
	padding: 30rpx;
	background: #fff;
	border-radius: 20rpx;
	box-shadow: 0 10rpx 30rpx rgba(0, 0, 0, 0.05);

	&__grid {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 20rpx;
	}

	&__item {
		background: #f9fafc;
		border-radius: 16rpx;
		padding: 20rpx;
		display: flex;
		flex-direction: column;
		gap: 10rpx;

		image {
			width: 100%;
			height: 160rpx;
			border-radius: 14rpx;
		}
	}

	&__name {
		font-size: 26rpx;
		font-weight: bold;
	}

	&__cost {
		font-size: 24rpx;
		color: #fa5151;
	}
}

.operation-section {
	margin: 0 30rpx 30rpx;

	&__scroll {
		white-space: nowrap;
	}
}

.operation-card {
	display: inline-flex;
	width: 520rpx;
	background: linear-gradient(135deg, #fff3f2, #ffe8e4);
	border-radius: 24rpx;
	padding: 20rpx;
	margin-right: 20rpx;
	align-items: center;
	box-shadow: 0 10rpx 24rpx rgba(238, 47, 55, 0.1);

	image {
		width: 140rpx;
		height: 140rpx;
		border-radius: 18rpx;
		margin-right: 20rpx;
	}

	&__body {
		flex: 1;
	}

	&__title {
		font-size: 30rpx;
		font-weight: bold;
		margin-bottom: 6rpx;
	}

	&__desc {
		color: #606266;
		font-size: 24rpx;
	}
}

.operation-campaigns {
	margin: 0 30rpx 30rpx;

	&__grid {
		display: flex;
		flex-direction: column;
		gap: 20rpx;
	}
}

.operation-campaign {
	display: flex;
	background: #fff;
	border-radius: 20rpx;
	border: 1px solid #f2f2f2;
	padding: 20rpx;
	box-shadow: 0 8rpx 20rpx rgba(0, 0, 0, 0.04);

	image {
		width: 160rpx;
		height: 120rpx;
		border-radius: 16rpx;
		margin-right: 20rpx;
	}

	&__info {
		flex: 1;
		display: flex;
		flex-direction: column;
		justify-content: center;
	}

	&__title {
		font-size: 30rpx;
		font-weight: bold;
	}

	&__desc {
		font-size: 24rpx;
		color: #606266;
		margin-top: 6rpx;
	}
}

.service-list {
	margin: 20rpx 30rpx;
	padding: 20rpx;
	background: #fff;
	border-radius: 20rpx;
	box-shadow: 0 10rpx 20rpx rgba(0, 0, 0, 0.04);
}

.section-title {
	font-size: 30rpx;
	font-weight: bold;
	margin-bottom: 20rpx;
}

.grid-box__text {
	margin-top: 20rpx;
	font-size: 24rpx;
	font-weight: bold;
}

.links {
	margin: 20rpx 30rpx;
	border-radius: 20rpx;
	overflow: hidden;
	box-shadow: 0 10rpx 20rpx rgba(0, 0, 0, 0.03);

}

.profile-modal {
	width: 560rpx;
	padding: 40rpx;
	background: #fff;
	border-radius: 24rpx;
	box-sizing: border-box;

	&__title {
		font-size: 32rpx;
		font-weight: bold;
		text-align: center;
		margin-bottom: 30rpx;
	}

	&__field {
		display: flex;
		align-items: center;
		margin-bottom: 24rpx;

		.label {
			width: 120rpx;
			font-size: 28rpx;
			color: #606266;
		}

		.avatar-btn {
			border: none;
			background: transparent;
			padding: 0;
		}

		.profile-input {
			flex: 1;
			border: 1px solid #ebeef5;
			border-radius: 12rpx;
			padding: 12rpx 20rpx;
			font-size: 28rpx;
		}
	}

	&__actions {
		display: flex;
		justify-content: space-between;
		margin-top: 20rpx;
	}
}
</style>
