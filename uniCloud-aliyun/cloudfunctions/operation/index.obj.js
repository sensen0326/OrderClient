'use strict'

const db = uniCloud.database()
const dbCmd = db.command
const SLOT_COLLECTION = 'operation_slot'

module.exports = {
	async list(payload = {}) {
		const slotCodes = Array.isArray(payload.slotCodes) && payload.slotCodes.length ? payload.slotCodes : []
		const env = payload.env || 'all'
		const where = {
			status: 'online'
		}
		if (slotCodes.length) {
			where.slot_code = dbCmd.in(slotCodes)
		}
		const res = await db.collection(SLOT_COLLECTION)
			.where(where)
			.get()
		const data = res.data || []
		const slots = {}
		data.forEach(item => {
			if (env !== 'all' && item.env && item.env !== env) {
				return
			}
			slots[item.slot_code] = {
				slot_code: item.slot_code,
				title: item.title || '',
				items: item.items || [],
				env: item.env || 'all'
			}
		})
		return {
			slots
		}
	}
}
