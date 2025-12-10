'use strict'

const db = uniCloud.database()
const USER_COLLECTION = 'user_profile'
const RATE_LIMIT_CACHE = Object.create(null)

class ServiceError extends Error {
	constructor(code, message) {
		super(message)
		this.code = code
	}
}

function makeError(code, message) {
	return new ServiceError(code, message || 'Service error')
}

const SCHEMA_HELPERS = {
	string(value, field) {
		if (value === undefined || value === null || value === '') {
			throw makeError('VALIDATION_ERROR', `${field} is required`)
		}
		if (typeof value !== 'string') {
			throw makeError('VALIDATION_ERROR', `${field} must be string`)
		}
	},
	number(value, field) {
		if (value === undefined || value === null || value === '') {
			throw makeError('VALIDATION_ERROR', `${field} is required`)
		}
		if (Number.isNaN(Number(value))) {
			throw makeError('VALIDATION_ERROR', `${field} must be number`)
		}
	}
}

function validatePayload(payload, schema = []) {
	if (!schema.length) return payload
	const clone = Object.assign({}, payload)
	for (const rule of schema) {
		if (rule.required) {
			const val = clone[rule.field]
			if (val === undefined || val === null || val === '') {
				throw makeError('VALIDATION_ERROR', `${rule.field} is required`)
			}
		}
		if (rule.type && clone[rule.field] !== undefined) {
			const checker = SCHEMA_HELPERS[rule.type]
			if (checker) {
				checker(clone[rule.field], rule.field)
			}
		}
		if (rule.default !== undefined && clone[rule.field] === undefined) {
			clone[rule.field] = rule.default
		}
	}
	return clone
}

const SERVICE_REGISTRY = {
	dish: {
		module: 'dish',
		actions: {
			listCategories: { auth: false },
			list: {
				auth: false,
				rateLimit: { window: 500, limit: 10 },
				schema: [{ field: 'restaurantId', type: 'string', required: false, default: 'default' }]
			},
			detail: {
				auth: false,
				schema: [{ field: 'dishId', type: 'string', required: true }]
			},
			search: {
				auth: false,
				schema: [{ field: 'restaurantId', type: 'string', required: false, default: 'default' }, { field: 'keyword', type: 'string', required: true }]
			},
			listRecommend: { auth: false }
		}
	},
	cart: {
		module: 'cart',
		actions: {
			sync: { auth: true, rateLimit: { window: 800, limit: 6 } },
			get: { auth: true },
			clear: { auth: true }
		}
	},
	order: {
		module: 'order',
		actions: {
			create: { auth: true },
			detail: { auth: true, schema: [{ field: 'orderNo', type: 'string', required: true }] },
			list: { auth: true }
		}
	},
	member: {
		module: 'member',
		actions: {
			profile: { auth: true },
			pointLedger: { auth: true },
			pointOrders: { auth: true }
		}
	},
	coupon: {
		module: 'coupon',
		actions: {
			list: { auth: true },
			listUsable: { auth: true }
		}
	},
	support: {
		module: 'support',
		actions: {
			create: { auth: true },
			list: { auth: true },
			reply: { auth: true }
		}
	},
	operation: {
		module: 'operation',
		actions: {
			fetch: { auth: false }
		}
	},
	analytics: {
		module: 'analytics',
		actions: {
			track: { auth: false, rateLimit: { window: 300, limit: 20 } }
		}
	}
}

const MODULE_CACHE = Object.create(null)

function getModule(name) {
	if (!MODULE_CACHE[name]) {
		MODULE_CACHE[name] = uniCloud.importObject(name)
	}
	return MODULE_CACHE[name]
}

function purgeOldRequests(timestamps, windowMs) {
	const now = Date.now()
	return timestamps.filter(ts => now - ts < windowMs)
}

function checkRateLimit(key, rule) {
	if (!rule) return
	const { window = 1000, limit = 5 } = rule
	const list = RATE_LIMIT_CACHE[key] || []
	const cleaned = purgeOldRequests(list, window)
	if (cleaned.length >= limit) {
		throw makeError('RATE_LIMITED', 'Too many requests')
	}
	cleaned.push(Date.now())
	RATE_LIMIT_CACHE[key] = cleaned
}

async function verifyToken(token) {
	if (!token) throw makeError('AUTH_REQUIRED', 'token is required')
	const res = await db.collection(USER_COLLECTION).where({ token }).limit(1).get()
	if (!res.data || !res.data.length) {
		throw makeError('AUTH_INVALID', 'token invalid or expired')
	}
	return res.data[0]
}

function attachUserParam(params, user, key = 'userId') {
	if (params[key]) return params
	return Object.assign({}, params, { [key]: user._id || user.userId || user.id })
}

module.exports = {
	async call(event = {}) {
		const requestId = event.requestId || `req_${Date.now()}`
		try {
			const { token, service, action, params = {} } = event
			if (!service || !action) {
				throw makeError('INVALID_REQUEST', 'service and action are required')
			}
			const descriptor = SERVICE_REGISTRY[service]
			if (!descriptor) {
				throw makeError('SERVICE_NOT_ALLOWED', `service ${service} is not allowed`)
			}
			const actionConf = descriptor.actions[action]
			if (!actionConf) {
				throw makeError('SERVICE_NOT_ALLOWED', `action ${service}.${action} is not allowed`)
			}

			let userDoc = null
			if (actionConf.auth) {
				userDoc = await verifyToken(token)
			}

			const finalParams = validatePayload(params, actionConf.schema)
			const limiterKey = `${service}:${action}:${userDoc ? userDoc._id : 'public'}`
			checkRateLimit(limiterKey, actionConf.rateLimit)

			const handler = getModule(descriptor.module || service)
			let invokeParams = finalParams
			if (actionConf.auth) {
				invokeParams = attachUserParam(finalParams, userDoc)
			}

			if (typeof handler[action] !== 'function') {
				throw makeError('ACTION_NOT_IMPLEMENTED', `method ${action} not found in ${descriptor.module}`)
			}

			const data = await handler[action](invokeParams)
			return {
				success: true,
				requestId,
				data
			}
		} catch (err) {
			console.error('[service.call] failed', err)
			return {
				success: false,
				requestId,
				error: {
					code: err.code || 'SERVICE_ERROR',
					message: err.message || 'Internal server error'
				}
			}
		}
	}
}
