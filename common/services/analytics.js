const hasUniCloud = typeof uniCloud !== 'undefined' && uniCloud && typeof uniCloud.importObject === 'function'
const hasUni = typeof uni !== 'undefined'
const STORAGE_KEY = 'analyticsEventsMock'

const getAnalyticsObject = (() => {
	let instance = null
	return () => {
		if (!hasUniCloud) return null
		if (!instance) {
			instance = uniCloud.importObject('analytics', {
				customUI: true
			})
		}
		return instance
	}
})()

function appendMock(eventPayload) {
	if (!hasUni) return
	try {
		const list = uni.getStorageSync(STORAGE_KEY) || []
		list.unshift(eventPayload)
		if (list.length > 50) list.pop()
		uni.setStorageSync(STORAGE_KEY, list)
	} catch (err) {
		console.warn('mock analytics store failed', err)
	}
}

export async function track(event, data = {}) {
	if (!event) return
	const payload = {
		event,
		data,
		clientInfo: {}
	}
	if (hasUni && typeof uni.getSystemInfoSync === 'function') {
		try {
			payload.clientInfo = uni.getSystemInfoSync()
		} catch (err) {
			payload.clientInfo = {}
		}
	}
	const analyticsObj = getAnalyticsObject()
	if (!analyticsObj) {
		appendMock({
			...payload,
			created_at: Date.now()
		})
		return
}
	try {
		await analyticsObj.track(payload)
	} catch (err) {
		console.warn('track analytics failed', err)
		appendMock({
			...payload,
			created_at: Date.now()
		})
	}
}

export default {
	track
}
