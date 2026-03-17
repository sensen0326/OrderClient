const fs = require('fs')
const path = require('path')

function loadConfig() {
	const candidates = [
		path.resolve(__dirname, 'app.config.local.js'),
		path.resolve(__dirname, '../../shared/app.config.local.js')
	]
	for (const file of candidates) {
		if (!fs.existsSync(file)) continue
		try {
			return require(file)
		} catch (err) {
			console.warn(`[app.config] failed to load ${file}: ${err.message}`)
		}
	}
	return {}
}

const localConfig = loadConfig()
const localWeapp = localConfig && localConfig.weapp ? localConfig.weapp : {}

module.exports = {
	weapp: {
		appId: localWeapp.appId || process.env.WX_APP_ID || '',
		appSecret: localWeapp.appSecret || process.env.WX_APP_SECRET || ''
	}
}
