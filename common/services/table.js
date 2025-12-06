const hasUniCloud = typeof uniCloud !== 'undefined' && uniCloud && typeof uniCloud.importObject === 'function'
const hasUni = typeof uni !== 'undefined' && typeof uni.getStorageSync === 'function'

const STORAGE_KEY = 'tableInfo'

const getTableObject = (() => {
	let instance = null
	return () => {
		if (!hasUniCloud) return null
		if (!instance) {
			instance = uniCloud.importObject('table', {
				customUI: true
			})
		}
		return instance
	}
})()

function readLocalInfo() {
	if (!hasUni) return null
	try {
		return uni.getStorageSync(STORAGE_KEY) || null
	} catch (err) {
		console.warn('readLocalTable failed', err)
		return null
	}
}

function writeLocalInfo(info) {
	if (!hasUni) return
	try {
		uni.setStorageSync(STORAGE_KEY, info)
	} catch (err) {
		console.warn('writeLocalTable failed', err)
	}
}

function buildLocalSession(payload = {}) {
	const now = Date.now()
	return {
		tableNo: payload.tableNo,
		status: 'occupied',
		peopleCount: payload.peopleCount || 2,
		sessionId: `LOCAL-${now}`
	}
}

const tableService = {
	getLocal() {
		return readLocalInfo()
	},
	saveLocal(info) {
		writeLocalInfo(info)
		return info
	},
	async open(payload = {}) {
		const tableObj = getTableObject()
		if (!tableObj) {
			const localInfo = buildLocalSession(payload)
			writeLocalInfo(localInfo)
			return {
				sessionId: localInfo.sessionId,
				tableInfo: localInfo,
				mock: true
			}
		}
		const res = await tableObj.scanOpen(payload)
		if (res && res.tableInfo) {
			writeLocalInfo(res.tableInfo)
		}
		return res
	},
	async status(params = {}) {
		const tableObj = getTableObject()
		if (!tableObj) {
			return {
				table: readLocalInfo()
			}
		}
		const res = await tableObj.status(params)
		if (res && res.table) {
			writeLocalInfo(res.table)
		}
		return res
	},
	async callService(params = {}) {
		const tableObj = getTableObject()
		if (!tableObj) {
			return {
				success: true,
				mock: true
			}
		}
		return tableObj.callService(params)
	},
	async release(params = {}) {
		const tableObj = getTableObject()
		if (!tableObj) {
			writeLocalInfo(null)
			return {
				success: true,
				mock: true
			}
		}
		const res = await tableObj.release(params)
		if (res && res.success) {
			writeLocalInfo(null)
		}
		return res
	}
}

export default tableService
