const fs = require('fs')
const path = require('path')

const rootDir = path.resolve(__dirname, '..')
const PUBLIC_DCLOUD_APPID = '__UNI__YOUR_DCLOUD_APPID__'
const PUBLIC_WECHAT_APPID = '__WX_APP_ID__'

function updateJson(fileRelativePath, updater) {
	const filePath = path.resolve(rootDir, fileRelativePath)
	const raw = fs.readFileSync(filePath, 'utf8')
	const json = JSON.parse(raw)
	const next = updater(json)
	if (!next.changed) {
		console.log(`[reset-public-config] ${fileRelativePath} already public-safe`)
		return
	}
	fs.writeFileSync(filePath, JSON.stringify(next.data, null, 2))
	console.log(`[reset-public-config] reset ${fileRelativePath}`)
}

updateJson('manifest.json', (data) => {
	let changed = false
	if (data.appid !== PUBLIC_DCLOUD_APPID) {
		data.appid = PUBLIC_DCLOUD_APPID
		changed = true
	}
	if (!data['mp-weixin']) {
		data['mp-weixin'] = {}
	}
	if (data['mp-weixin'].appid !== PUBLIC_WECHAT_APPID) {
		data['mp-weixin'].appid = PUBLIC_WECHAT_APPID
		changed = true
	}
	return { data, changed }
})

updateJson('project.config.json', (data) => {
	if (data.appid === PUBLIC_WECHAT_APPID) {
		return { data, changed: false }
	}
	data.appid = PUBLIC_WECHAT_APPID
	return { data, changed: true }
})

console.log('[reset-public-config] done')
