const sharedConfig = require('../shared/app.config.js')
const weapp = sharedConfig && sharedConfig.weapp ? sharedConfig.weapp : {}

module.exports = {
	appId: process.env.WX_APP_ID || weapp.appId || '',
	appSecret: process.env.WX_APP_SECRET || weapp.appSecret || ''
}
