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
const localDcloud = localConfig && localConfig.dcloud ? localConfig.dcloud : {}
const localWeapp = localConfig && localConfig.weapp ? localConfig.weapp : {}

module.exports = {
	dcloud: {
		appId: localDcloud.appId || process.env.UNI_APP_ID || ''
	},
	weapp: {
		// Prefer local private config, fallback to cloud env for deployment-only setup.
		appId: localWeapp.appId || process.env.WX_APP_ID || '',
		appSecret: localWeapp.appSecret || process.env.WX_APP_SECRET || ''
	}
}
