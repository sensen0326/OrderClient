'use strict'

const db = uniCloud.database()
const dbCmd = db.command

const TABLE_COLLECTION = 'restaurant_table'
const SESSION_COLLECTION = 'table_session'

function buildSessionId(tableNo = 'A') {
	const rand = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
	return `TS${Date.now()}${tableNo.replace(/\W/g, '').toUpperCase()}${rand}`
}

async function ensureTable(tableNo) {
	const query = await db.collection(TABLE_COLLECTION).where({
		table_no: tableNo
	}).limit(1).get()
	if (query.data && query.data.length) {
		return query.data[0]
	}
	const now = Date.now()
	const doc = {
		table_no: tableNo,
		seat_count: 4,
		zone: 'default',
		status: 'idle',
		created_at: now,
		updated_at: now
	}
	const addRes = await db.collection(TABLE_COLLECTION).add(doc)
	return Object.assign({}, doc, { _id: addRes.id || addRes._id })
}

async function loadSession(sessionId) {
	if (!sessionId) return null
	const res = await db.collection(SESSION_COLLECTION).doc(sessionId).get()
	if (!res.data || !res.data.length) return null
	return res.data[0]
}

async function releaseSession(params = {}) {
	const sessionId = params.sessionId
	const tableNo = params.tableNo
	if (!sessionId && !tableNo) {
		throw new Error('sessionId or tableNo is required')
	}
	let targetSessionId = sessionId
	let table
	if (tableNo) {
		table = await ensureTable(tableNo)
		targetSessionId = targetSessionId || table.current_session_id
	}
	const now = Date.now()
	if (!targetSessionId) {
		if (table) {
			await db.collection(TABLE_COLLECTION).doc(table._id).update({
				status: 'idle',
				current_session_id: '',
				last_call_service_at: 0,
				updated_at: now
			})
		}
		return { success: true }
	}
	const sessionDoc = await loadSession(targetSessionId)
	if (!sessionDoc) {
		throw new Error('session not found')
	}
	await db.collection(SESSION_COLLECTION).doc(targetSessionId).update({
		status: 'closed',
		closed_at: now,
		updated_at: now
	})
	if (!table) {
		const tableRes = await db.collection(TABLE_COLLECTION).where({
			table_no: sessionDoc.table_no
		}).limit(1).get()
		table = tableRes.data && tableRes.data.length ? tableRes.data[0] : null
	}
	if (table) {
		await db.collection(TABLE_COLLECTION).doc(table._id).update({
			status: 'idle',
			current_session_id: '',
			last_session_id: targetSessionId,
			last_call_service_at: 0,
			updated_at: now
		})
	}
	return {
		success: true
	}
}

module.exports = {
	async scanOpen(payload = {}) {
		const tableNo = payload.tableNo
		const peopleCount = Number(payload.peopleCount || 0)
		if (!tableNo) {
			throw new Error('tableNo is required')
		}
		const table = await ensureTable(tableNo)
		const now = Date.now()
		const sessionId = payload.sessionId || buildSessionId(tableNo)
		const sessionDoc = {
			table_no: tableNo,
			people_count: peopleCount > 0 ? peopleCount : table.seat_count,
			status: 'ordering',
			channel: 'dine_in',
			remark: payload.remark || '',
			call_service_logs: [],
			opened_at: now,
			updated_at: now
		}
		await db.collection(SESSION_COLLECTION).doc(sessionId).set(sessionDoc)
		await db.collection(TABLE_COLLECTION).doc(table._id).update({
			status: 'occupied',
			current_session_id: sessionId,
			updated_at: now
		})
		return {
			sessionId,
			tableInfo: {
				tableNo,
				status: 'occupied',
				sessionId,
				peopleCount: sessionDoc.people_count,
				openedAt: now
			}
		}
	},
	async overview(params = {}) {
		const query = db.collection(TABLE_COLLECTION)
		if (params.zone) {
			query.where({
				zone: params.zone
			})
		}
		const res = await query.orderBy('table_no', 'asc').get()
		const tables = res.data || []
		const sessionIds = tables.map(t => t.current_session_id).filter(Boolean)
		let sessionMap = {}
		if (sessionIds.length) {
			const sessionRes = await db.collection(SESSION_COLLECTION)
				.where({
					_id: dbCmd.in(sessionIds)
				})
				.get()
			;(sessionRes.data || []).forEach(session => {
				sessionMap[session._id] = session
			})
		}
		const summary = {
			total: tables.length,
			idle: 0,
			occupied: 0,
			cleaning: 0,
			reserved: 0,
			alert: 0
		}
		const list = tables.map(table => {
			const session = table.current_session_id ? sessionMap[table.current_session_id] : null
			const status = table.status || 'idle'
			if (summary[status] !== undefined) {
				summary[status]++
			}
			const lastCallAt = session && session.call_service_logs && session.call_service_logs.length
				? session.call_service_logs[session.call_service_logs.length - 1].created_at
				: table.last_call_service_at || 0
			if (lastCallAt && Date.now() - lastCallAt > 1000 * 60 * 5 && status === 'occupied') {
				summary.alert++
			}
			return {
				tableNo: table.table_no,
				status,
				zone: table.zone || 'default',
				seatCount: table.seat_count || 4,
				sessionId: table.current_session_id || '',
				peopleCount: session ? session.people_count : table.seat_count || 4,
				lastCallAt,
				openedAt: session ? session.opened_at : 0,
				callLogs: session ? session.call_service_logs || [] : [],
				note: session ? session.remark || '' : '',
				tags: table.tags || []
			}
		})
		return {
			list,
			summary
		}
	},
	async markStatus(params = {}) {
		const tableNo = params.tableNo
		const status = params.status
		if (!tableNo || !status) {
			throw new Error('tableNo and status are required')
		}
		if (status === 'idle') {
			await releaseSession({ tableNo })
			return { success: true, status }
		}
		const table = await ensureTable(tableNo)
		const now = Date.now()
		await db.collection(TABLE_COLLECTION).doc(table._id).update({
			status,
			updated_at: now
		})
		if (params.peopleCount && table.current_session_id) {
			await db.collection(SESSION_COLLECTION).doc(table.current_session_id).update({
				people_count: Number(params.peopleCount),
				updated_at: now
			})
		}
		return {
			success: true,
			status
		}
	},
	async status(params = {}) {
		const tableNo = params.tableNo
		if (!tableNo) {
			throw new Error('tableNo is required')
		}
		const table = await ensureTable(tableNo)
		let session = null
		if (table.current_session_id) {
			session = await loadSession(table.current_session_id)
		}
		return {
			table: {
				tableNo,
				status: table.status || 'idle',
				sessionId: table.current_session_id || '',
				peopleCount: (session && session.people_count) || table.seat_count,
				lastCallAt: table.last_call_service_at || 0
			},
			session
		}
	},
	async callService(params = {}) {
		const tableNo = params.tableNo
		const sessionId = params.sessionId
		if (!tableNo && !sessionId) {
			throw new Error('tableNo or sessionId is required')
		}
		let targetTable = null
		if (tableNo) {
			targetTable = await ensureTable(tableNo)
		} else {
			const session = await loadSession(sessionId)
			if (!session) {
				throw new Error('session not found')
			}
			const tableRes = await db.collection(TABLE_COLLECTION).where({
				table_no: session.table_no
			}).limit(1).get()
			if (!tableRes.data || !tableRes.data.length) {
				throw new Error('table not found')
			}
			targetTable = tableRes.data[0]
		}
		const activeSessionId = sessionId || targetTable.current_session_id
		if (!activeSessionId) {
			throw new Error('table has no active session')
		}
		const sessionDoc = await loadSession(activeSessionId)
		if (!sessionDoc) {
			throw new Error('session not found')
		}
		const now = Date.now()
		const logs = Array.isArray(sessionDoc.call_service_logs) ? sessionDoc.call_service_logs : []
		logs.push({
			type: params.type || 'waiter',
			note: params.note || '',
			created_at: now
		})
		await db.collection(SESSION_COLLECTION).doc(activeSessionId).update({
			call_service_logs: logs,
			updated_at: now
		})
		await db.collection(TABLE_COLLECTION).doc(targetTable._id).update({
			last_call_service_at: now
		})
		return {
			success: true,
			sessionId: activeSessionId
		}
	},
	release: releaseSession
}
