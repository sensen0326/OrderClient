<template>
	<view class="wrap">
		<!-- channel info -->
		<view v-if="cartChannel === 'takeout'" class="card address-card" @click="openAddressPopup">
			<view class="card-main" v-if="selectedAddress">
				<view class="card-title">
					<text class="strong">{{selectedAddress.receiver}}</text>
					<text class="tel">{{selectedAddress.mobile}}</text>
				</view>
				<view class="card-desc">{{selectedAddress.detail}}</view>
			</view>
			<view v-else class="card-placeholder">
				请选择送餐地址
			</view>
			<u-icon name="arrow-right" color="#909399"></u-icon>
		</view>
		<view v-else class="card table-card">
			<view class="card-title">{{restaurantName}}</view>
			<view class="card-desc">
				<text>桌号：{{displayTableNo}}</text>
				<text v-if="tableInfo && tableInfo.distance" class="distance"> · 距离您 {{tableInfo.distance}}</text>
			</view>
		</view>

		<!-- order list -->
		<view class="section-header">
			<text>{{restaurantName || '私房菜'}}</text>
			<u-tag :text="cartChannel === 'takeout' ? '外卖' : '堂食'" mode="dark" bg-color="#EE2F37" size="mini" />
		</view>
		<view v-for="(item,index) in orderList" :key="index" class="u-flex list-box">
			<image class="item-menu-image" :src="item.icon || item.dishImg" mode="aspectFill"></image>
			<view class="item-menu-name">
				<text class="u-font-26">{{item.name}}</text>
				<view class="u-line-2 u-font-20 u-type-info u-m-t-10 u-m-b-10">
					{{item.skuName}}<text v-if="item.optionsText"> · {{item.optionsText}}</text>
				</view>
				<view class="u-flex u-row-between">
					<view class="u-font-weight u-font-24" style="color: #EE2F37;">
						<text class="u-font-20">￥</text>
						{{Number(item.price).toFixed(2)}}
					</view>
					<view class="u-type-info u-font-22">
						x{{item.value}}
					</view>
				</view>
			</view>
		</view>

		<!-- detail cells -->
		<view class="u-cell-box">
			<u-cell-group :border="false">
				<u-cell-item
					v-if="cartChannel === 'dine_in'"
					title="用餐人数"
					:value="form.people ? form.people + '人' : '请选择'"
					:title-style="titleStyle"
					:value-style="valueStyle"
					hover-class="none"
					@click="PopupModal(0)"
					:border-bottom="false"
				></u-cell-item>
				<u-cell-item
					v-else
					title="送达时间"
					:value="form.mealsTime ? form.mealsTime : '尽快送达'"
					:title-style="titleStyle"
					:value-style="valueStyle"
					hover-class="none"
					@click="TimerShow = true"
					:border-bottom="false"
				></u-cell-item>
				<u-cell-item
					title="餐具份数"
					:value="utensilsCountText"
					:title-style="titleStyle"
					:value-style="valueStyle"
					hover-class="none"
					@click="changeUtensils"
				></u-cell-item>
				<u-cell-item
					title="备注"
					:value="form.leave ? (form.leave.length > 10 ? form.leave.slice(0, 10) + '...' : form.leave) : '无'"
					:title-style="titleStyle"
					:value-style="valueStyle"
					hover-class="none"
					@click="PopupModal(1)"
				></u-cell-item>
				<u-cell-item
					title="优惠"
					:value="couponText"
					:title-style="titleStyle"
					:value-style="valueStyle"
					hover-class="none"
					@click="couponSheetShow = true"
				></u-cell-item>
				<u-cell-item
					title="发票"
					:value="invoiceText"
					:title-style="titleStyle"
					:value-style="valueStyle"
					hover-class="none"
					@click="openInvoicePopup"
				></u-cell-item>
			</u-cell-group>
		</view>

		<!-- fee breakdown -->
		<view class="fee-card">
			<view class="fee-row">
				<text>商品小计</text>
				<text>￥{{feeDetail.goodsTotal.toFixed(2)}}</text>
			</view>
			<view class="fee-row">
				<text>包装费</text>
				<text>￥{{feeDetail.packageFee.toFixed(2)}}</text>
			</view>
			<view class="fee-row" v-if="cartChannel === 'takeout'">
				<text>配送费</text>
				<text>￥{{feeDetail.deliveryFee.toFixed(2)}}</text>
			</view>
			<view class="fee-row" v-if="feeDetail.discount > 0">
				<text>优惠减免</text>
				<text>-￥{{feeDetail.discount.toFixed(2)}}</text>
			</view>
			<view class="fee-row total">
				<text>应付金额</text>
				<text>￥{{feeDetail.payable.toFixed(2)}}</text>
			</view>
		</view>
		<view v-if="cartChannel === 'takeout' && deliveryWarning" class="delivery-warning">
			<u-icon name="warning-fill" size="28" color="#ff9f1a"></u-icon>
			<text>{{deliveryWarning}}</text>
		</view>

		<u-gap height="100"></u-gap>

		<!-- bottom -->
		<view class="u-bottom">
			<view class="u-bottom__wrap">
				<view class="u-font-weight u-font-40 u-m-l-20">
					<text class="u-font-24">￥</text>
					{{feeDetail.payable.toFixed(2)}}
				</view>
				<view class="u-bottom__nums">共{{orderNum}} 件商品</view>
			</view>
			<view class="u-bottom__place" :class="{'is-disabled': !orderNum || submitLoading}" @click="confirmPay">
				{{ submitLoading ? '处理中' : '确认支付' }}
			</view>
		</view>

		<!-- people/remark popup -->
		<u-popup v-model="PopupShow" mode="bottom" height="80%" border-radius="14" closeable :mask-close-able="false">
			<view v-if="!PopupPage">
				<view class="popup-inner">
					<u-image src="https://mp-a83aee34-7c6d-40e3-a241-85ab45b7ff6e.cdn.bspapp.com/cloudstorage/static/menu/index-dining.png" width="220" height="180"></u-image>
					<view class="popup-title">请选择用餐人数</view>
					<u-grid :col="4" :border="false" hover-class="none">
						<u-grid-item
							v-for="person in peopleOptions"
							:key="person"
							:custom-style="customStyle"
							@click="SelectPeople(person)"
						>
							<view class="u-font-weight">{{person}}</view>
						</u-grid-item>
					</u-grid>
				</view>
			</view>
			<view v-else>
				<view class="popup-inner">
					<u-image src="https://mp-a83aee34-7c6d-40e3-a241-85ab45b7ff6e.cdn.bspapp.com/cloudstorage/static/menu/index-leave.jpg" width="220" height="180"></u-image>
					<view class="popup-title">快捷标签</view>
					<u-grid :col="4" :border="false" hover-class="none">
						<u-grid-item v-for="item in tags" :key="item" :custom-style="customStyle" @click="SelectTags(item)">
							<view class="u-font-weight">{{item}}</view>
						</u-grid-item>
					</u-grid>
					<view class="popup-title">自定义留言</view>
					<view class="form-textarea" :style="inputStyle">
						<textarea
							class="form-textarea__inner"
							placeholder="请输入您的需求"
							placeholder-style="color: #909399"
							:value="form.leave"
							auto-height
							@input="handleLeaveInput"
						></textarea>
					</view>
				</view>
			</view>
		</u-popup>

		<!-- address popup -->
		<u-popup v-model="addressPopup" mode="bottom" height="80%" border-radius="20">
			<view class="address-popup">
				<view class="address-popup__title">选择收货地址</view>
				<u-radio-group v-model="selectedAddressId">
					<u-radio
						class="address-radio"
						v-for="item in addressList"
						:key="item.id"
						:name="item.id"
						@change="noop"
						active-color="#EE2F37"
					>
						<view class="address-item">
							<view class="address-item__title">
								<text class="strong">{{item.receiver}}</text>
								<text class="tel">{{item.mobile}}</text>
								<text class="tag" v-if="item.tag">{{item.tag}}</text>
								<view class="address-item__delete">
									<u-button type="error" size="mini" plain @click.stop="removeAddress(item.id)">删除</u-button>
								</view>
							</view>
							<view class="address-item__desc">{{item.detail}}</view>
						</view>
					</u-radio>
				</u-radio-group>
				<view v-if="addressFormVisible" class="address-form">
					<view class="form-input u-m-b-20">
						<input
							class="form-input__inner"
							:value="addressForm.receiver"
							placeholder="收货人"
							@input="handleAddressInput('receiver', $event)"
						/>
					</view>
					<view class="form-input u-m-b-20">
						<input
							class="form-input__inner"
							type="number"
							maxlength="11"
							:value="addressForm.mobile"
							placeholder="手机号"
							@input="handleAddressInput('mobile', $event)"
							@blur="handleMobileBlur"
						/>
					</view>
					<view class="form-input">
						<input
							class="form-input__inner"
							:value="addressForm.detail"
							placeholder="详细地址"
							@input="handleAddressInput('detail', $event)"
						/>
					</view>
					<u-button type="primary" plain class="u-m-t-30 btn-save-address" @click="saveAddress">保存地址</u-button>
				</view>
				<u-button v-else type="primary" plain class="u-m-t-30" @click="startAddAddress">新增地址</u-button>
				<u-button type="primary" class="u-m-t-20" @click="closeAddressPopup">完成</u-button>
			</view>
		</u-popup>

		<!-- invoice popup -->
		<u-popup v-model="invoicePopup" mode="bottom" height="60%" border-radius="20">
			<view class="invoice-popup">
				<view class="invoice-popup__title">填写发票抬头</view>
				<u-checkbox :value="invoiceInfo.needInvoice" active-color="#EE2F37" @change="handleInvoiceCheck">需要电子发票</u-checkbox>
				<view v-if="invoiceInfo.needInvoice" class="u-m-t-20">
					<view class="form-input u-m-b-20">
						<input
							class="form-input__inner"
							:value="invoiceInfo.title"
							placeholder="发票抬头"
							@input="handleInvoiceInput('title', $event)"
						/>
					</view>
					<view class="form-input">
						<input
							class="form-input__inner"
							:value="invoiceInfo.taxNo"
							placeholder="税号(选填)"
							@input="handleInvoiceInput('taxNo', $event)"
						/>
					</view>
				</view>
				<u-button type="primary" class="u-m-t-30" @click="saveInvoice">保存</u-button>
			</view>
		</u-popup>

		<u-action-sheet :list="couponActions" v-model="couponSheetShow" @click="handleSelectCoupon"></u-action-sheet>
		<u-picker v-model="TimerShow" mode="time" :params="TimerParams" @confirm="mealsPicker"></u-picker>
	</view>
</template>

<script>
import orderService from '@/common/services/order.js'
import paymentService from '@/common/services/payment.js'
import cartService from '@/common/services/cart.js'
import deliveryService from '@/common/services/delivery.js'
import kitchenService from '@/common/services/kitchen.js'
import memberService from '@/common/services/member.js'
import couponService from '@/common/services/coupon.js'

	export default {
		data() {
			return {
				subCurrent: 0,
				cartChannel: 'dine_in',
				sessionId: '',
				restaurantName: '',
				tableInfo: null,
				form: {
					mealsTime: '',
					people: 0,
					leave: ''
				},
				orderList: [],
				orderPrice: 0,
				orderNum: 0,
				addressList: [],
				selectedAddressId: '',
				addressPopup: false,
				addressFormVisible: false,
				addressForm: {
					receiver: '',
					mobile: '',
					detail: ''
				},
				mobilePattern: /^1[3-9]\d{9}$/,
				couponSheetShow: false,
				couponList: [],
				selectedCouponId: '',
				couponLoading: false,
				invoicePopup: false,
				invoiceInfo: {
					needInvoice: false,
					title: '',
					taxNo: ''
				},
				utensilsCount: 0,
				feeDetail: {
					goodsTotal: 0,
					packageFee: 0,
					deliveryFee: 0,
					discount: 0,
					payable: 0
				},
				deliveryQuote: null,
				deliveryLoading: false,
				memberProfile: memberService.getStoredProfile() || null,
				couponFetchTimer: null,
				valueStyle: {
					fontSize: '26rpx'
				},
				titleStyle: {
					fontWeight: 'bold',
					color: '#333',
					fontSize: '26rpx'
				},
				PopupShow: false,
				PopupPage: false,
				TimerShow: false,
				TimerParams: {
					year: false,
					month: false,
					day: true,
					hour: true,
					minute: true,
					second: false
				},
				customStyle: {
					border: '20rpx solid #fff',
					borderRadius: '50rpx',
					padding: '40rpx 0',
					backgroundColor: '#f4f4f5'
				},
				tags: ['不要葱', '少放辣', '多放辣', '少盐', '不要香菜', '不要花生', '少油', '多餐具'],
				peopleOptions: Array.from({ length: 12 }, (_, i) => i + 1),
				inputStyle: {
					backgroundColor: '#f3f4f6',
					borderRadius: '20rpx',
					padding: '30rpx'
				},
				submitLoading: false
			}
		},
		computed: {
			selectedAddress() {
				return this.addressList.find(item => item.id === this.selectedAddressId)
			},
			displayTableNo() {
				return this.tableInfo && this.tableInfo.tableNo ? this.tableInfo.tableNo : '未绑定'
			},
			couponText() {
				const coupon = this.activeCoupon
				if (!coupon) {
					return '未使用'
				}
				return `${coupon.title} -¥${coupon.amount}`
			},
			invoiceText() {
				if (!this.invoiceInfo.needInvoice) {
					return '无需发票'
				}
				return this.invoiceInfo.title || '点击填写抬头'
			},
			utensilsCountText() {
				if (!this.utensilsCount) {
					return '无需餐具'
				}
				return `${this.utensilsCount} 份`
			},
			couponActions() {
				return this.couponList.map(item => ({
					text: `${item.title}（-${item.amount}元）`,
					value: item.id
				})).concat([{
					text: '不使用优惠',
					value: ''
				}])
			},
			activeCoupon() {
				return this.couponList.find(item => item.id === this.selectedCouponId) || null
			},
			deliveryWarning() {
				if (this.cartChannel !== 'takeout') return ''
				if (!this.deliveryQuote) return ''
				if (!this.deliveryQuote.deliverable) {
					return this.deliveryQuote.reason || '超出配送范围'
				}
				if (this.deliveryQuote.minAmount && this.feeDetail.goodsTotal < this.deliveryQuote.minAmount) {
					return `未达起送价 ¥${this.deliveryQuote.minAmount}`
				}
				return ''
			}
		},
		watch: {
			orderList: {
				handler() {
					this.calcFeeDetail()
					this.scheduleCouponFetch()
					if (this.cartChannel === 'takeout') {
						this.refreshDeliveryQuote()
					}
				},
				deep: true
			},
			selectedCouponId() {
				this.calcFeeDetail()
			},
			cartChannel() {
				this.scheduleCouponFetch()
				this.refreshDeliveryQuote()
			},
			selectedAddressId() {
				this.refreshDeliveryQuote()
				this.scheduleCouponFetch()
			}
		},
		onLoad(param) {
			this.subCurrent = Number(param.subCurrent || 0)
			this.cartChannel = this.subCurrent === 1 ? 'takeout' : 'dine_in'
			const profile = uni.getStorageSync('checkoutProfile') || {}
			const addressStorage = uni.getStorageSync('userAddressList')
			if (addressStorage && Array.isArray(addressStorage)) {
				let newTagMarked = false
				this.addressList = addressStorage.map((addr) => {
					let tag = addr.tag === '新建' ? '新增' : addr.tag
					if (tag === '新增') {
						if (newTagMarked) {
							tag = ''
						} else {
							newTagMarked = true
						}
					}
					return {
						...addr,
						tag
					}
				})
			} else {
				this.addressList = [{
					id: 'addr_default',
					receiver: 'Kaiyuan_Q',
					mobile: '188****8888',
					detail: '北京市朝阳区万达广场4层·私房菜',
					tag: '默认'
				}]
			}
			this.selectedAddressId = profile.selectedAddressId || (this.addressList[0] && this.addressList[0].id) || ''
			if (profile.channel === this.cartChannel) {
				this.form.people = Number(profile.lastPeople) > 0 ? Number(profile.lastPeople) : 0
				this.form.mealsTime = profile.lastMealsTime || ''
				this.form.leave = profile.lastLeave || ''
				this.invoiceInfo = profile.invoice || this.invoiceInfo
				this.utensilsCount = profile.utensilsCount || 0
			}
			uni.getStorage({
				key: 'dishData',
				success: res => {
					this.orderList = res.data.order || []
					this.orderNum = res.data.menuNum || 0
					this.orderPrice = res.data.menuPrice || 0
					this.cartChannel = res.data.channel || this.cartChannel
					this.subCurrent = this.cartChannel === 'takeout' ? 1 : 0
					this.sessionId = res.data.sessionId || ''
					this.tableInfo = res.data.tableInfo || null
					this.restaurantName = res.data.restaurantName || '私房菜'
					this.calcFeeDetail()
					this.refreshDeliveryQuote()
				}
			})
		},
		onShow() {
			const latest = memberService.getStoredProfile()
			if (latest && latest.userId) {
				const changed = !this.memberProfile || (this.memberProfile.userId !== latest.userId) || (this.memberProfile.points !== latest.points)
				if (changed) {
					this.memberProfile = latest
					this.scheduleCouponFetch()
				}
			}
		},
		methods: {
			noop() {},
			handleLeaveInput(e) {
				this.form.leave = e && e.detail ? e.detail.value : ''
			},
			handleAddressInput(field, e) {
				let value = e && e.detail ? e.detail.value : ''
				if (field === 'mobile') {
					value = value.replace(/\D/g, '').slice(0, 11)
				}
				this.$set(this.addressForm, field, value)
			},
			handleMobileBlur() {
				if (this.addressForm.mobile && !this.mobilePattern.test(this.addressForm.mobile)) {
					this.$u.toast('请输入11位手机号')
				}
			},
			handleInvoiceInput(field, e) {
				const value = e && e.detail ? e.detail.value : ''
				this.$set(this.invoiceInfo, field, value)
			},
			calcFeeDetail() {
				const goodsTotal = this.orderList.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.value || 0), 0)
				const quote = this.deliveryQuote
				let packageFee = 0
				let deliveryFee = 0
				if (this.cartChannel === 'takeout') {
					packageFee = quote && quote.packageFee !== undefined ? Number(quote.packageFee) : this.orderNum * 1
					deliveryFee = quote && quote.deliveryFee !== undefined ? Number(quote.deliveryFee) : 5
				}
				let discount = 0
				const coupon = this.activeCoupon
				if (coupon && goodsTotal >= coupon.threshold) {
					discount = coupon.amount
				}
				const payable = Math.max(goodsTotal + packageFee + deliveryFee - discount, 0)
				this.feeDetail = {
					goodsTotal,
					packageFee,
					deliveryFee,
					discount,
					payable
				}
			},
			openAddressPopup() {
				this.addressPopup = true
				this.addressFormVisible = false
			},
			closeAddressPopup() {
				this.addressPopup = false
				this.persistAddresses()
			},
			startAddAddress() {
				this.addressFormVisible = true
				this.addressForm = {
					receiver: '',
					mobile: '',
					detail: ''
				}
			},
			saveAddress() {
				if (!this.addressForm.receiver || !this.addressForm.mobile || !this.addressForm.detail) {
					this.$u.toast('请完整填写地址信息')
					return
				}
				if (!this.mobilePattern.test(this.addressForm.mobile)) {
					this.$u.toast('请输入有效的手机号')
					return
				}
				this.addressList.forEach((addr, index) => {
					if (addr.tag === '新增') {
						this.$set(this.addressList[index], 'tag', '')
					}
				})
				const newAddress = {
					id: `addr_${Date.now()}`,
					receiver: this.addressForm.receiver,
					mobile: this.addressForm.mobile,
					detail: this.addressForm.detail,
					tag: '新增'
				}
				this.addressList.push(newAddress)
				this.selectedAddressId = newAddress.id
				this.addressFormVisible = false
				this.persistAddresses()
			},
			removeAddress(id) {
				const index = this.addressList.findIndex(item => item.id === id)
				if (index === -1) return
				this.addressList.splice(index, 1)
				if (this.selectedAddressId === id) {
					this.selectedAddressId = this.addressList.length ? this.addressList[0].id : ''
				}
				if (!this.addressList.length) {
					this.addressFormVisible = true
				}
				this.persistAddresses()
			},
			persistAddresses() {
				uni.setStorage({
					key: 'userAddressList',
					data: this.addressList
				})
			},
			handleSelectCoupon(index) {
				const action = this.couponActions[index]
				if (!action) return
				this.selectedCouponId = action.value
			},
			changeUtensils() {
				const items = ['无需餐具', '1 份', '2 份', '3 份', '4 份']
				uni.showActionSheet({
					itemList: items,
					success: (res) => {
						this.utensilsCount = res.tapIndex
					}
				})
			},
			scheduleCouponFetch() {
				if (this.couponFetchTimer) {
					clearTimeout(this.couponFetchTimer)
					this.couponFetchTimer = null
				}
				this.couponFetchTimer = setTimeout(() => {
					this.loadCoupons()
				}, 150)
			},
			async loadCoupons() {
				const profile = this.memberProfile || memberService.getStoredProfile()
				if (!profile || !profile.userId) {
					this.couponList = []
					this.selectedCouponId = ''
					return
				}
				const goodsTotal = this.orderList.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.value || 0), 0)
				this.couponLoading = true
				try {
					const usable = await couponService.listUsable(profile.userId, goodsTotal, this.cartChannel)
					this.couponList = (usable || []).map(item => ({
						id: item._id || item.id,
						title: item.title,
						amount: item.amount,
						threshold: item.threshold,
						channel: item.channel_limit || 'all',
						status: item.status
					}))
					if (!this.couponList.find(item => item.id === this.selectedCouponId)) {
						this.selectedCouponId = ''
					}
				} catch (err) {
					console.warn('load coupons failed', err)
					this.couponList = []
					this.selectedCouponId = ''
				} finally {
					this.couponLoading = false
				}
			},
			async refreshDeliveryQuote() {
				if (this.cartChannel !== 'takeout') {
					this.deliveryQuote = null
					this.calcFeeDetail()
					return
				}
				const address = this.selectedAddress
				if (!address) {
					this.deliveryQuote = null
					this.calcFeeDetail()
					return
				}
				const goodsAmount = this.orderList.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.value || 0), 0)
				this.deliveryLoading = true
				try {
					const quote = await deliveryService.quote({
						address,
						goodsAmount
					})
					this.deliveryQuote = quote
				} catch (err) {
					console.warn('delivery quote failed', err)
					this.deliveryQuote = null
				} finally {
					this.deliveryLoading = false
					this.calcFeeDetail()
				}
			},
			openInvoicePopup() {
				this.invoicePopup = true
			},
			handleInvoiceCheck(e) {
				this.invoiceInfo.needInvoice = !!(e && e.value)
			},
			saveInvoice() {
				if (this.invoiceInfo.needInvoice && !this.invoiceInfo.title) {
					this.$u.toast('请输入发票抬头')
					return
				}
				this.invoicePopup = false
			},
			PopupModal(param) {
				this.PopupPage = Boolean(param)
				this.PopupShow = true
			},
			SelectTags(param) {
				if (!this.form.leave) {
					this.form.leave = param
					return
				}
				this.form.leave = `${this.form.leave}；${param}`
			},
			SelectPeople(param) {
				const people = Number(param) || 0
				this.form.people = people > 0 ? people : 1
				this.PopupShow = false
			},
			mealsPicker(param) {
				this.form.mealsTime = `${param.day} ${param.hour}:${param.minute}`
			},
			buildOrderItemsSnapshot() {
				return this.orderList
					.filter(item => Number(item.value || 0) > 0)
					.map(item => ({
						dishId: item.dishId || '',
						dishName: item.name || item.dishName || '',
						name: item.name || item.dishName || '',
						desc: item.desc || '',
						icon: item.icon || item.dishImg || '',
						skuId: item.skuId || '',
						skuName: item.skuName || '',
						optionsText: item.optionsText || '',
						options: item.options || [],
						price: Number(item.price || 0),
						value: Number(item.value || 0),
						quantity: Number(item.value || 0)
					}))
			},
			buildOrderPayload() {
				return {
					sessionId: this.sessionId || uni.getStorageSync('cartSessionId') || 'local',
					channel: this.cartChannel,
					tableInfo: this.tableInfo,
					peopleCount: this.cartChannel === 'dine_in' ? this.form.people : 0,
					remark: this.form.leave || '',
					mealsTime: this.form.mealsTime || '',
					utensilsCount: this.utensilsCount || 0,
					couponId: this.selectedCouponId || '',
					invoice: this.invoiceInfo.needInvoice ? { ...this.invoiceInfo } : {},
					address: this.cartChannel === 'takeout' ? (this.selectedAddress ? { ...this.selectedAddress } : null) : null,
					itemsSnapshot: this.buildOrderItemsSnapshot(),
					feeDetail: {
						goods: Number(this.feeDetail.goodsTotal || 0),
						packageFee: Number(this.feeDetail.packageFee || 0),
						deliveryFee: Number(this.feeDetail.deliveryFee || 0),
						discount: Number(this.feeDetail.discount || 0),
						payable: Number(this.feeDetail.payable || 0)
					}
				}
			},
			async clearCartCaches(targetSession) {
				const sessionId = targetSession || this.sessionId || 'local'
				try {
					await cartService.clear({ sessionId })
				} catch (err) {
					console.warn('clear remote cart failed', err)
				}
				this.orderList = []
				this.orderNum = 0
				this.orderPrice = 0
				this.feeDetail = {
					goodsTotal: 0,
					packageFee: 0,
					deliveryFee: 0,
					discount: 0,
					payable: 0
				}
				uni.removeStorageSync('dishData')
				uni.removeStorageSync('menuCartData')
				uni.removeStorageSync('menuCartDataRemoteShadow')
				uni.setStorageSync('cartLastClearedAt', Date.now())
			},


			async confirmPay() {
				if (this.submitLoading) return
				if (this.cartChannel === 'dine_in' && !this.form.people) {
					this.$u.toast('请选择用餐人数')
					return
				}
				if (this.cartChannel === 'takeout' && !this.selectedAddressId) {
					this.$u.toast('请选择送餐地址')
					return
				}
				if (this.cartChannel === 'takeout' && this.deliveryWarning) {
					this.$u.toast(this.deliveryWarning)
					return
				}
				const itemsSnapshot = this.buildOrderItemsSnapshot()
				if (!itemsSnapshot.length) {
					this.$u.toast('请重新选择菜品')
					return
				}
				const payload = this.buildOrderPayload()
				this.submitLoading = true
				uni.showLoading({
					title: '正在创建订单',
					mask: true
				})
				let orderNo = ''
				try {
					const res = await orderService.createFromCart(payload)
					orderNo = res.orderNo || (res.order && (res.order.order_no || res.order.orderNo)) || ''
					if (!orderNo) {
						throw new Error('订单信息异常')
					}
					uni.setStorageSync('lastOrderNo', orderNo)
					await this.clearCartCaches(payload.sessionId)
					uni.removeStorageSync('checkoutProfile')
					let paid = false
					try {
						await paymentService.payOrder(orderNo, {
							payChannel: this.cartChannel === 'takeout' ? 'wxpay_mp' : 'wxpay',
							amount: this.feeDetail.payable
						})
						paid = true
					} catch (payErr) {
						console.warn('pay order failed', payErr)
						this.$u.toast(payErr.message || '支付未完成，订单已保留待支付')
					}
					if (paid) {
						try {
							await kitchenService.push({
								orderNo,
								channel: payload.channel,
								tableInfo: payload.tableInfo,
								peopleCount: payload.peopleCount,
								itemsSnapshot,
								markPaid: true
							})
						} catch (kitchenErr) {
							console.warn('push kitchen ticket failed', kitchenErr)
						}
					}
					setTimeout(() => {
						if (paid) {
							this.$u.toast('支付成功')
							uni.redirectTo({
								url: `/subPack/index/indexPaysuccess?orderNo=${orderNo}`
							})
						} else {
							uni.redirectTo({
								url: `/subPack/order/orderDetail?orderNo=${orderNo}`
							})
						}
					}, 400)
				} catch (err) {
					console.error('create order failed', err)
					this.$u.toast(err.message || '下单失败，请稍后再试')
				} finally {
					uni.hideLoading()
					this.submitLoading = false
				}
			}
		}
	}
</script>

<style lang="scss">
	.wrap {
		padding-bottom: 160rpx;
	}

	.card {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 30rpx;
		margin: 30rpx;
		border-radius: 24rpx;
		box-shadow: 0 8rpx 30rpx rgba(0, 0, 0, 0.05);
		background-color: #fff;
	}

	.address-card .card-desc {
		margin-top: 10rpx;
		color: #666;
		font-size: 26rpx;
	}

	.table-card .card-desc {
		color: #666;
		font-size: 26rpx;
	}

	.distance {
		color: #909399;
		font-size: 22rpx;
	}

	.card-title {
		font-size: 30rpx;
		font-weight: bold;
	}

	.card-placeholder {
		color: #909399;
		font-size: 26rpx;
		flex: 1;
	}

	.section-header {
		padding: 30rpx;
		display: flex;
		justify-content: space-between;
		align-items: center;
		font-weight: bold;
	}

	.list-box {
		padding: 20rpx 30rpx;
		margin: 0 30rpx 20rpx 30rpx;
		border-radius: 14rpx;
		box-shadow: 2px 0 8px 0 rgba(243, 244, 246, 0.95);
		background-color: #fff;
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

	.u-cell-box {
		border-radius: 30rpx;
		margin: 30rpx;
		background-color: #fff;
	}

	.fee-card {
		margin: 0 30rpx;
		padding: 30rpx;
		border-radius: 24rpx;
		background-color: #fff;
		box-shadow: 0 8rpx 30rpx rgba(0, 0, 0, 0.03);
	}

	.delivery-warning {
		margin: 10rpx 30rpx 0;
		padding: 16rpx 20rpx;
		display: flex;
		align-items: center;
		gap: 12rpx;
		background-color: #fff4e5;
		border-radius: 16rpx;
		color: #ff9f1a;
		font-size: 24rpx;
	}

	.fee-row {
		display: flex;
		justify-content: space-between;
		font-size: 26rpx;
		margin-bottom: 18rpx;
		color: #606266;
	}

	.fee-row.total {
		font-weight: bold;
		font-size: 30rpx;
		color: #303133;
	}

	.u-bottom {
		position: fixed;
		bottom: 0;
		width: 100%;
		left: 0;
		right: 0;
		display: flex;
		z-index: 99;
	}

	.u-bottom__nums {
		border-left: 1px solid #606266;
		font-size: 24rpx;
		margin-left: 20rpx;
		padding-left: 20rpx;
		font-weight: bold;
	}

	.u-bottom__wrap,
	.u-bottom__place {
		display: flex;
		color: #fff;
	}

	.u-bottom__wrap {
		width: 70%;
		padding: 30rpx 0 30rpx 30rpx;
		align-items: center;
		color: #303133;
		border-top: 1px solid #f3f4f6;
		background-color: white;
	}

	.u-bottom__place {
		background-color: #EE2F37;
		width: 30%;
		text-align: center;
		flex-direction: column;
		justify-content: center;
		font-size: 32rpx;
		font-weight: bold;
	}

	.popup-inner {
		padding: 40rpx;
	}

	.popup-title {
		font-size: 32rpx;
		font-weight: bold;
		margin: 40rpx 0 20rpx 0;
	}

	.form-textarea {
		width: 100%;
		border-radius: 20rpx;
		background-color: #f3f4f6;
		padding: 20rpx;
	}

	.form-textarea__inner {
		width: 100%;
		min-height: 160rpx;
		border: none;
		background: transparent;
		font-size: 26rpx;
		color: #303133;
	}

	.form-input {
		width: 100%;
		height: 70rpx;
		border-radius: 20rpx;
		background-color: #f3f4f6;
		display: flex;
		align-items: center;
		padding: 0 20rpx;
	}

	.form-input__inner {
		flex: 1;
		font-size: 26rpx;
		border: none;
		background: transparent;
	}

	.address-popup {
		padding: 40rpx;
	}

	.address-popup ::v-deep .u-radio-group {
		display: flex;
		flex-direction: column;
		gap: 10rpx;
	}

	.address-radio {
		display: block;
		width: 100%;
		padding: 10rpx 0;

		::v-deep .u-radio__label {
			width: 100%;
		}
	}

	.address-popup__title {
		font-size: 32rpx;
		font-weight: bold;
		margin-bottom: 20rpx;
	}

	.address-item {
		padding: 20rpx 0;
		border-bottom: 1px solid #f0f0f0;
	}

	.address-item__title {
		display: flex;
		align-items: center;
		gap: 12rpx;
		flex-wrap: nowrap;
		font-size: 28rpx;
	}

	.address-item__title .strong,
	.address-item__title .tel,
	.address-item__title .tag {
		white-space: nowrap;
	}

	.address-item__title .tel {
		color: #666;
		margin-left: 8rpx;
	}

	.address-item__title .tag {
		background-color: #fef2f2;
		color: #EE2F37;
		font-size: 22rpx;
		padding: 4rpx 12rpx;
		border-radius: 8rpx;
		margin-left: 12rpx;
	}

	.address-item__delete {
		margin-left: auto;
	}

	.address-item__desc {
		color: #666;
		font-size: 26rpx;
		margin-top: 8rpx;
	}

	.btn-save-address {
		background-color: #ecf4ff;
		color: #1677ff;
		border: 1px solid #c9dcff;
	}

	.invoice-popup {
		padding: 40rpx;
	}

	.invoice-popup__title {
		font-size: 32rpx;
		font-weight: bold;
		margin-bottom: 20rpx;
	}
</style>
