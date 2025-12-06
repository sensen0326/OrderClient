const fs = require('fs')
const path = require('path')

const rootDir = path.resolve(__dirname, '..')
const appConfigPath = path.resolve(rootDir, 'app.config.js')
const appConfig = require(appConfigPath)
const weapp = appConfig.weapp || {}

if (!weapp.appId) {
	console.error('[sync-weapp-config] weapp.appId is empty in app.config.js')
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
	if (!data['mp-weixin']) {
		data['mp-weixin'] = {}
	}
	const current = data['mp-weixin'].appid
	if (current === weapp.appId) {
		return { data, changed: false }
	}
	data['mp-weixin'].appid = weapp.appId
	return { data, changed: true }
})

updateJson('project.config.json', (data) => {
	if (data.appid === weapp.appId) {
		return { data, changed: false }
	}
	data.appid = weapp.appId
	return { data, changed: true }
})

function copySharedConfig(targetDir) {
	const src = path.resolve(rootDir, 'uniCloud-aliyun/cloudfunctions/shared/app.config.js')
	const destDir = path.resolve(rootDir, targetDir, 'shared')
	const dest = path.resolve(destDir, 'app.config.js')
	fs.mkdirSync(destDir, { recursive: true })
	const srcContent = fs.readFileSync(src, 'utf8')
	if (fs.existsSync(dest)) {
		const prev = fs.readFileSync(dest, 'utf8')
		if (prev === srcContent) {
			console.log(`[sync-weapp-config] ${dest} already synced`)
			return
		}
	}
	fs.writeFileSync(dest, srcContent)
	console.log(`[sync-weapp-config] synced ${dest}`)
}

copySharedConfig('uniCloud-aliyun/cloudfunctions/auth')
copySharedConfig('uniCloud-aliyun/cloudfunctions/zhuohao')

console.log('[sync-weapp-config] done')
