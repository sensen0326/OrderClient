const fs = require('fs')
const path = require('path')

function loadConfig() {
	const candidates = [
		path.resolve(__dirname, 'shared/app.config.local.js'),
		path.resolve(__dirname, '../shared/app.config.local.js')
	]
	let loadedFrom = ''
	for (const file of candidates) {
		if (!fs.existsSync(file)) continue
		try {
			loadedFrom = file
			return {
				config: require(file),
				loadedFrom
			}
		} catch (err) {
			console.warn(`[auth-config] failed to load ${file}: ${err.message}`)
		}
	}
	return {
		config: {},
		loadedFrom: ''
	}
}

const loaded = loadConfig()
const localConfig = loaded && loaded.config ? loaded.config : {}
const weapp = localConfig && localConfig.weapp ? localConfig.weapp : {}
const appId = (weapp.appId || process.env.WX_APP_ID || '').trim()
const appSecret = (weapp.appSecret || process.env.WX_APP_SECRET || '').trim()
const source = weapp.appId ? `local:${loaded.loadedFrom}` : (process.env.WX_APP_ID ? 'env:WX_APP_ID' : 'none')

module.exports = {
	appId,
	appSecret,
	meta: {
		source
	}
}
