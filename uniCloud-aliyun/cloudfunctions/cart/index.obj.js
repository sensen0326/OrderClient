'use strict'

const db = uniCloud.database()
const CART_COLLECTION = 'cart_sessions'
const PARTICIPANT_TTL = 1000 * 60 * 30 // 30 minutes

function ensureString(val) {
  if (typeof val === 'string') return val
  if (val === undefined || val === null) return ''
  return String(val)
}

function buildItemKey(item = {}) {
  if (item.key) return item.key
  const dish = ensureString(item.dishId || item.dish_id)
  const sku = ensureString(item.skuId || item.sku_id)
  const options = ensureString(item.optionsText || item.options_text)
  return `${dish}_${sku}_${options || 'default'}`
}

function normalizeItems(items = []) {
  if (!Array.isArray(items)) return []
  return items
    .map(item => {
      const quantity = Number(item.quantity || item.value) || 0
      const price = Number(item.price) || 0
      const packageFee = Number(item.packageFee || item.package_fee || 0)
      return {
        key: buildItemKey(item),
        dishId: ensureString(item.dishId || item.dish_id),
        dishName: ensureString(item.dishName || item.dish_name || item.name),
        dishImg: ensureString(item.dishImg || item.dish_img || item.icon || item.cover),
        skuId: ensureString(item.skuId || item.sku_id),
        skuName: ensureString(item.skuName || item.sku_name),
        quantity,
        price,
        packageFee,
        options: Array.isArray(item.options) ? item.options : [],
        optionsText: ensureString(item.optionsText || item.options_text),
        desc: ensureString(item.desc || item.remark || '')
      }
    })
    .filter(item => item.quantity > 0)
}

function mergeCartItems(existing = [], incoming = [], strategy = 'replace') {
  if (strategy === 'replace' || !existing.length) {
    return incoming
  }
  const map = new Map()
  for (const item of existing) {
    map.set(buildItemKey(item), Object.assign({}, item))
  }
  for (const item of incoming) {
    const key = buildItemKey(item)
    const current = map.get(key)
    if (!current) {
      map.set(key, Object.assign({}, item))
      continue
    }
    if (strategy === 'merge') {
      current.quantity = Math.max(0, Number(current.quantity || 0) + Number(item.quantity || 0))
    } else {
      current.quantity = Number(item.quantity || 0)
    }
    current.price = item.price || current.price
    current.packageFee = item.packageFee || current.packageFee
    current.options = item.options && item.options.length ? item.options : current.options
    current.optionsText = item.optionsText || current.optionsText
    current.desc = item.desc || current.desc
  }
  return Array.from(map.values()).filter(item => item.quantity > 0)
}

function buildParticipantKey(participant = {}) {
  return participant.user_id || (participant.client_id ? `client_${participant.client_id}` : '')
}

function normalizeParticipant(participant = {}) {
  const normalized = {
    user_id: ensureString(participant.user_id || participant.userId),
    client_id: ensureString(participant.client_id || participant.clientId),
    nickname: ensureString(participant.nickname || participant.name || ''),
    avatar: ensureString(participant.avatar || participant.avatarUrl || ''),
    role: ensureString(participant.role || 'guest'),
    last_active_at: Number(participant.last_active_at || participant.lastActiveAt) || Date.now()
  }
  if (!normalized.user_id && !normalized.client_id) {
    return null
  }
  return normalized
}

function mergeMeta(existing = {}, incoming = {}) {
  return Object.assign({}, existing || {}, incoming || {})
}

function mergeParticipants(existing = [], incoming = [], actor = null) {
  const now = Date.now()
  const map = new Map()
  const push = participant => {
    if (!participant) return
    const normalized = normalizeParticipant(participant)
    if (!normalized) return
    const key = buildParticipantKey(normalized)
    if (!key) return
    const cached = map.get(key) || {}
    map.set(
      key,
      Object.assign({}, cached, normalized, {
        joined_at: cached.joined_at || normalized.joined_at || now,
        last_active_at: normalized.last_active_at || now
      })
    )
  }
  existing.forEach(push)
  incoming.forEach(push)
  if (actor) {
    push(Object.assign({}, actor, { last_active_at: now }))
  }
  const cutoff = now - PARTICIPANT_TTL
  return Array.from(map.values()).filter(item => !item.last_active_at || item.last_active_at >= cutoff)
}

async function getCart(sessionId) {
  const res = await db.collection(CART_COLLECTION).doc(sessionId).get()
  return res.data && res.data.length ? res.data[0] : null
}

async function ensureCart(sessionId, base = {}) {
  let cart = await getCart(sessionId)
  if (cart) return cart
  const now = Date.now()
  cart = {
    _id: sessionId,
    session_id: sessionId,
    restaurant_id: base.restaurantId || base.restaurant_id || 'default',
    channel: base.channel || 'dine_in',
    table_no: base.tableNo || base.table_no || '',
    table_info: base.tableInfo || base.table_info || null,
    remark: base.remark || '',
    items: [],
    participants: [],
    meta: base.meta || {},
    created_at: now,
    updated_at: now
  }
  await db.collection(CART_COLLECTION).doc(sessionId).set(cart)
  return cart
}

function resolveActor(payload = {}) {
  return normalizeParticipant(
    payload.actor ||
      payload.participant || {
        user_id: payload.userId,
        client_id: payload.clientId,
        nickname: payload.nickname,
        avatar: payload.avatar,
        role: payload.role
      }
  )
}

module.exports = {
  async sync(payload = {}) {
    const sessionId = ensureString(payload.sessionId || payload.session_id || '')
    if (!sessionId) throw new Error('sessionId is required')
    const baseInfo = {
      restaurantId: payload.restaurantId || payload.restaurant_id,
      channel: payload.channel,
      tableNo: payload.tableNo || payload.table_no,
      tableInfo: payload.tableInfo,
      meta: payload.meta,
      remark: payload.remark
    }
    const cart = await ensureCart(sessionId, baseInfo)
    const incomingItems = normalizeItems(payload.items)
    const strategy = payload.mergeStrategy || payload.strategy || 'replace'
    const mergedItems = mergeCartItems(cart.items || [], incomingItems, strategy)
    const now = Date.now()
    const actor = resolveActor(payload)
    const participantsFromPayload = Array.isArray(payload.participants)
      ? payload.participants.map(normalizeParticipant).filter(Boolean)
      : []
    const participants = mergeParticipants(cart.participants || [], participantsFromPayload, actor)
    const nextMeta = mergeMeta(cart.meta || {}, payload.meta || {})
    const tableInfo = payload.tableInfo || cart.table_info || null
    const doc = {
      _id: sessionId,
      session_id: sessionId,
      restaurant_id: baseInfo.restaurantId || cart.restaurant_id || 'default',
      channel: baseInfo.channel || cart.channel || 'dine_in',
      table_no: baseInfo.tableNo || cart.table_no || '',
      table_info: tableInfo,
      remark: payload.remark !== undefined ? payload.remark : cart.remark || '',
      items: mergedItems,
      participants,
      meta: nextMeta,
      updated_at: now,
      created_at: cart.created_at || now
    }
    await db.collection(CART_COLLECTION).doc(sessionId).set(doc)
    return {
      sessionId,
      updated_at: now,
      items: mergedItems,
      participants,
      channel: doc.channel,
      tableInfo,
      meta: nextMeta
    }
  },
  async join(payload = {}) {
    const sessionId = ensureString(payload.sessionId || payload.session_id || '')
    if (!sessionId) throw new Error('sessionId is required')
    const actor = resolveActor(payload)
    if (!actor) {
      throw new Error('participant userId or clientId is required')
    }
    const cart = await ensureCart(sessionId)
    const participants = mergeParticipants(cart.participants || [], [], actor)
    await db.collection(CART_COLLECTION).doc(sessionId).update({
      participants,
      updated_at: Date.now()
    })
    return {
      sessionId,
      participants
    }
  },
  async leave(payload = {}) {
    const sessionId = ensureString(payload.sessionId || payload.session_id || '')
    if (!sessionId) throw new Error('sessionId is required')
    const cart = await ensureCart(sessionId)
    const userId = ensureString(payload.userId || payload.user_id)
    const clientId = ensureString(payload.clientId || payload.client_id)
    const participants = (cart.participants || []).filter(item => {
      if (userId && item.user_id === userId) return false
      if (clientId && item.client_id === clientId) return false
      return true
    })
    await db.collection(CART_COLLECTION).doc(sessionId).update({
      participants,
      updated_at: Date.now()
    })
    return {
      sessionId,
      participants
    }
  },
  async heartbeat(payload = {}) {
    const sessionId = ensureString(payload.sessionId || payload.session_id || '')
    if (!sessionId) throw new Error('sessionId is required')
    const cart = await ensureCart(sessionId)
    const actor = resolveActor(payload)
    const now = Date.now()
    const updates = {
      updated_at: now
    }
    if (payload.remark !== undefined) {
      updates.remark = payload.remark
    }
    if (payload.meta) {
      updates.meta = mergeMeta(cart.meta || {}, payload.meta)
    }
    if (actor) {
      updates.participants = mergeParticipants(cart.participants || [], [], actor)
    }
    await db.collection(CART_COLLECTION).doc(sessionId).update(updates)
    return {
      sessionId,
      updated_at: now,
      participants: updates.participants || cart.participants || []
    }
  },
  async get(params = {}) {
    const sessionId = ensureString(params.sessionId || params.session_id || '')
    if (!sessionId) throw new Error('sessionId is required')
    return await getCart(sessionId)
  },
  async clear(params = {}) {
    const sessionId = ensureString(params.sessionId || params.session_id || '')
    if (!sessionId) throw new Error('sessionId is required')
    await db.collection(CART_COLLECTION).doc(sessionId).remove()
    return {
      success: true
    }
  }
}
