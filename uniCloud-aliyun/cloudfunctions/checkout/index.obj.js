'use strict'

const db = uniCloud.database()\nconst dbCmd = db.command
const CART_COLLECTION = 'cart_sessions'
const TABLE_SESSION_COLLECTION = 'table_session'

function ensureString(val) {
  if (typeof val === 'string') return val
  if (val === undefined || val === null) return ''
  return String(val)
}

function roundToTwo(num) {
  return Number((Number(num) || 0).toFixed(2))
}

function normalizeItems(items = []) {
  if (!Array.isArray(items)) return []
  return items
    .map(item => {
      const quantity = Number(item.quantity || item.value) || 0
      const price = Number(item.price) || 0
      return {
        key: item.key || `${item.dishId || ''}_${item.skuId || ''}_${item.optionsText || ''}`,
        dishId: ensureString(item.dishId || item.dish_id),
        dishName: ensureString(item.dishName || item.dish_name || item.name),
        dishImg: ensureString(item.dishImg || item.dish_img || item.icon || item.cover),
        skuId: ensureString(item.skuId || item.sku_id),
        skuName: ensureString(item.skuName || item.sku_name),
        quantity,
        price,
        packageFee: Number(item.packageFee || item.package_fee || 0),
        options: Array.isArray(item.options) ? item.options : [],
        optionsText: ensureString(item.optionsText || item.options_text),
        desc: ensureString(item.desc || item.remark || '')
      }
    })
    .filter(item => item.quantity > 0)
}

async function loadCart(sessionId) {
  if (!sessionId || sessionId === 'local') return null
  const res = await db.collection(CART_COLLECTION).doc(sessionId).get()
  return res.data && res.data.length ? res.data[0] : null
}

async function loadTableSession(tableNo) {
  if (!tableNo) return null
  const res = await db
    .collection(TABLE_SESSION_COLLECTION)
    .where({ table_no: tableNo, status: dbCmd.neq('closed') })
    .orderBy('updated_at', 'desc')
    .limit(1)
    .get()
  return res.data && res.data.length ? res.data[0] : null
}

function calcFeeDetail(items, feeInput = {}, channel = 'dine_in') {
  const goods = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const autoPackage = items.reduce((sum, item) => sum + item.packageFee * item.quantity, 0)
  const packageFee = autoPackage + Number(feeInput.packageFee || feeInput.package || 0)
  const deliveryFee = channel === 'takeout' ? Number(feeInput.deliveryFee || feeInput.delivery || 5) : Number(feeInput.deliveryFee || feeInput.delivery || 0)
  const serviceFee = Number(feeInput.serviceFee || feeInput.service || 0)
  const discount = Number(feeInput.discount || 0)
  const payableInput = Number(feeInput.payable || 0)
  const payable = payableInput > 0 ? payableInput : goods + packageFee + deliveryFee + serviceFee - discount
  return {
    goods: roundToTwo(goods),
    packageFee: roundToTwo(packageFee),
    deliveryFee: roundToTwo(deliveryFee),
    serviceFee: roundToTwo(serviceFee),
    discount: roundToTwo(discount),
    payable: roundToTwo(Math.max(payable, 0))
  }
}

function resolvePeopleCount(payload, cart, tableInfo) {
  const fromPayload = Number(payload.peopleCount) || 0
  if (fromPayload > 0) return fromPayload
  if (payload.meta && Number(payload.meta.peopleCount)) return Number(payload.meta.peopleCount)
  if (cart && cart.meta && Number(cart.meta.peopleCount)) return Number(cart.meta.peopleCount)
  if (tableInfo && Number(tableInfo.people_count || tableInfo.peopleCount)) {
    return Number(tableInfo.people_count || tableInfo.peopleCount)
  }
  const participantCount = cart && Array.isArray(cart.participants) ? cart.participants.length : 0
  return participantCount || 0
}

function buildSnapshotItems(items = []) {
  return items.map(item => ({
    dishId: item.dishId,
    dishName: item.dishName,
    skuId: item.skuId,
    skuName: item.skuName,
    options: item.options,
    optionsText: item.optionsText,
    price: item.price,
    quantity: item.quantity,
    packageFee: item.packageFee,
    desc: item.desc,
    icon: item.dishImg
  }))
}

function mergeMeta(base = {}, incoming = {}) {
  return Object.assign({}, base || {}, incoming || {})
}

module.exports = {
  async preview(payload = {}) {
    const sessionId = ensureString(payload.sessionId || payload.session_id || 'local')
    const cart = await loadCart(sessionId)
    const itemsSource = Array.isArray(payload.items) && payload.items.length ? payload.items : cart && cart.items
    const items = normalizeItems(itemsSource)
    if (!items.length) {
      throw new Error('cart is empty')
    }
    const channel = payload.channel || (cart && cart.channel) || 'dine_in'
    let tableInfo = payload.tableInfo || (cart && cart.table_info) || null
    if (!tableInfo) {
      const tableNo = payload.tableNo || (cart && cart.table_no) || ''
      const session = await loadTableSession(tableNo)
      if (session) {
        tableInfo = {
          tableNo: tableNo || session.table_no,
          sessionId: session._id,
          status: session.status,
          people_count: session.people_count
        }
      } else if (tableNo) {
        tableInfo = { tableNo }
      }
    }
    const feeRef = mergeMeta(cart && cart.meta && cart.meta.feeDetail, payload.feeDetail)
    const feeDetail = calcFeeDetail(items, feeRef, channel)
    const remark = payload.remark !== undefined ? payload.remark : (cart && cart.remark) || ''
    const meta = mergeMeta(cart && cart.meta, payload.meta)
    const peopleCount = resolvePeopleCount(payload, cart, tableInfo)
    return {
      sessionId,
      channel,
      restaurantId: payload.restaurantId || (cart && cart.restaurant_id) || 'default',
      items,
      participants: (cart && cart.participants) || [],
      tableInfo,
      feeDetail,
      amountDetail: feeDetail,
      remark,
      peopleCount,
      address: payload.address || null,
      invoice: payload.invoice || {},
      meta,
      utensilsCount: Number(payload.utensilsCount || 0)
    }
  },
  async submit(payload = {}) {
    const preview = await this.preview(payload)
    const orderObj = uniCloud.importObject('order')
    const orderPayload = {
      sessionId: preview.sessionId,
      restaurantId: preview.restaurantId,
      channel: preview.channel,
      tableInfo: preview.tableInfo,
      peopleCount: preview.peopleCount,
      remark: payload.remark !== undefined ? payload.remark : preview.remark,
      address: payload.address || null,
      invoice: payload.invoice || preview.invoice || {},
      utensilsCount: payload.utensilsCount || preview.utensilsCount || 0,
      itemsSnapshot: buildSnapshotItems(preview.items),
      feeDetail: {
        packageFee: preview.feeDetail.packageFee,
        deliveryFee: preview.feeDetail.deliveryFee + preview.feeDetail.serviceFee,
        discount: preview.feeDetail.discount,
        payable: preview.feeDetail.payable
      },
      couponId: payload.couponId || payload.selectedCouponId || '',
      meta: mergeMeta(preview.meta, payload.meta)
    }
    const orderRes = await orderObj.createFromCart(orderPayload)
    return {
      orderNo: orderRes.orderNo,
      order: orderRes.order,
      preview
    }
  }
}
