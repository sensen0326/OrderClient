const fs = require('fs')
const path = require('path')

const rootDir = path.resolve(__dirname, '..')
const appConfigPath = path.resolve(rootDir, 'app.config.js')
const appConfig = require(appConfigPath)
const dcloud = appConfig.dcloud || {}
const weapp = appConfig.weapp || {}

if (!weapp.appId) {
	console.error('[sync-weapp-config] weapp.appId is empty in app.config.js')
	process.exit(1)
}

if (!dcloud.appId) {
	console.error('[sync-weapp-config] dcloud.appId is empty in app.config.js')
	process.exit(1)
}

function updateJson(fileRelativePath, updater) {
	const filePath = path.resolve(rootDir, fileRelativePath)
	const raw = fs.readFileSync(filePath, 'utf8')
	const json = JSON.parse(raw)
	const next = updater(json)
	if (!next.changed) {
		console.log(`[sync-weapp-config] ${fileRelativePath} already up-to-date`)
		return
	}
	fs.writeFileSync(filePath, JSON.stringify(next.data, null, 2))
	console.log(`[sync-weapp-config] updated ${fileRelativePath}`)
}

updateJson('manifest.json', (data) => {
	const nextData = data
	let changed = false
	if (nextData.appid !== dcloud.appId) {
		nextData.appid = dcloud.appId
		changed = true
	}
	if (!data['mp-weixin']) {
		nextData['mp-weixin'] = {}
	}
	const current = nextData['mp-weixin'].appid
	if (current === weapp.appId) {
		return { data: nextData, changed }
	}
	nextData['mp-weixin'].appid = weapp.appId
	return { data: nextData, changed: true }
})

updateJson('project.config.json', (data) => {
	if (data.appid === weapp.appId) {
		return { data, changed: false }
	}
	data.appid = weapp.appId
	return { data, changed: true }
})

console.log('[sync-weapp-config] done')
