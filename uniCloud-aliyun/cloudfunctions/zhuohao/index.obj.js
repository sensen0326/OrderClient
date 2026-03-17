// 云对象教程: https://uniapp.dcloud.net.cn/uniCloud/cloud-obj
// 小程序码接口文档: https://developers.weixin.qq.com/miniprogram/dev/OpenApiDoc/qrcode-link/qr-code/getUnlimitedQRCode.html
const db = uniCloud.database()

// 微信小程序配置，可直接改写或通过环境变量覆盖
const sharedConfig = require('./shared/app.config.js')
const weapp = sharedConfig && sharedConfig.weapp ? sharedConfig.weapp : {}

const WEAPP_APPID = weapp.appId || process.env.WX_APP_ID || ''
const WEAPP_SECRET = weapp.appSecret || process.env.WX_APP_SECRET || ''
const QR_PAGE = 'pages/index/index'
const ENV_VERSION = 'release'

async function getAccessToken() {
	if (!WEAPP_APPID || !WEAPP_SECRET) {
		throw new Error('missing WeChat appId/appSecret, please set env or app.config.local.js')
	}
	const res = await uniCloud.httpclient.request('https://api.weixin.qq.com/cgi-bin/token', {
		method: 'GET',
		data: {
			grant_type: 'client_credential',
			appid: WEAPP_APPID,
			secret: WEAPP_SECRET
		},
		dataType: 'json',
		timeout: 5000
	})

	const { access_token: token, errcode, errmsg } = res.data || {}
	if (!token) {
		throw new Error(errmsg || `获取 access_token 失败，errcode: ${errcode}`)
	}
	return token
}

async function getQrCodeBuffer(scene, page) {
	const token = await getAccessToken()
	const res = await uniCloud.httpclient.request(`https://api.weixin.qq.com/wxa/getwxacodeunlimit?access_token=${token}`, {
		method: 'POST',
		dataType: 'arraybuffer',
		data: {
			scene,
			page,
			check_path: false,
			env_version: ENV_VERSION
		},
		contentType: 'json',
		timeout: 10000
	})

	const contentType = res.headers['content-type'] || ''
	if (contentType.includes('json')) {
		const body = res.data.toString()
		let json
		try {
			json = JSON.parse(body)
		} catch (e) {
			throw new Error(`二维码接口返回异常: ${body}`)
		}
		throw new Error(json.errmsg || `二维码获取失败，errcode: ${json.errcode}`)
	}

	return Buffer.from(res.data)
}

module.exports = {
	_before() {
		// 预处理器，可在此做鉴权等
	},
	/**
	 * 生成桌号小程序码并写入 zhuohao 集合
	 * @param {string} tableNo 桌号，支持数字或字母
	 * @returns {Promise<object>} 桌号记录
	 */
	async create(payload = {}) {
		const { tableNo, page: customPage, scene: customScene } = payload
		if (!tableNo) {
			return {
				errCode: 'INVALID_TABLE_NO',
				errMsg: '桌号不能为空'
			}
		}

		const page = customPage || QR_PAGE
		const cleanedTableNo = String(tableNo).replace(/[^a-zA-Z0-9]/g, '')
		const safeTableNo = cleanedTableNo || Date.now().toString(36)
		const baseScene = customScene ? String(customScene).replace(/[^a-zA-Z0-9]/g, '') : `table${safeTableNo}`
		const scene = baseScene.length > 32 ? baseScene.slice(0, 32) : baseScene

		let qrBuffer
		try {
			qrBuffer = await getQrCodeBuffer(scene, page)
		} catch (error) {
			return {
				errCode: 'WXACODE_FAILED',
				errMsg: `获取小程序码失败: ${error.message}`
			}
		}

		let fileID = ''
		let tempUrl = ''
		try {
			const fileName = `/cloudstorage/zhuohao/${tableNo}-${Date.now()}.png`
			const uploadRes = await uniCloud.uploadFile({
				cloudPath: fileName,
				fileContent: qrBuffer
			})
			fileID = uploadRes.fileID

			const urlRes = await uniCloud.getTempFileURL({
				fileList: [fileID]
			})
			tempUrl = urlRes.fileList?.[0]?.tempFileURL || ''
		} catch (error) {
			return {
				errCode: 'UPLOAD_FAILED',
				errMsg: `二维码上传失败: ${error.message}`
			}
		}

		const collection = db.collection('zhuohao')
		const existed = await collection.where({
			table_no: String(tableNo)
		}).limit(1).get()

		if (existed.data.length) {
			const docId = existed.data[0]._id
			await collection.doc(docId).update({
				scene,
				page,
				qrcode_file_id: fileID,
				qrcode_url: tempUrl
			})
			return {
				...existed.data[0],
				scene,
				page,
				qrcode_file_id: fileID,
				qrcode_url: tempUrl
			}
		}

		const addRes = await collection.add({
			table_no: String(tableNo),
			scene,
			page,
			qrcode_file_id: fileID,
			qrcode_url: tempUrl,
			create_time: Date.now()
		})

		return {
			_id: addRes.id,
			table_no: String(tableNo),
			scene,
			page,
			qrcode_file_id: fileID,
			qrcode_url: tempUrl
		}
	}
}
