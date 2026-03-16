const fs = require('fs')
const path = require('path')

function loadLocalConfig() {
	const localConfigPath = path.resolve(__dirname, 'app.config.local.js')
	if (!fs.existsSync(localConfigPath)) {
		return {}
	}
	try {
		return require(localConfigPath)
	} catch (err) {
		console.warn('[app.config] failed to load app.config.local.js', err.message)
		return {}
	}
}

const localConfig = loadLocalConfig()
const localWeapp = localConfig && localConfig.weapp ? localConfig.weapp : {}

module.exports = {
	weapp: {
		// Priority: env > local private config > empty placeholder
		appId: process.env.WX_APP_ID || localWeapp.appId || '',
		appSecret: process.env.WX_APP_SECRET || localWeapp.appSecret || ''
	}
}
