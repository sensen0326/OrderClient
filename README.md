# 点餐小程序用户端

基于 `uni-app + uView UI + uniCloud` 的微信点餐小程序用户端，覆盖首页运营、点餐、购物车、结算、订单、会员、积分、优惠券、客服消息等核心流程。

## 项目特点

- 前端框架：`uni-app (Vue2)`
- UI 组件：`uview-ui`
- 云端能力：`uniCloud` 云对象 + 数据库 schema
- 运行模式：支持云端模式，也支持部分本地降级调试

## 目录说明

```text
.
|-- pages/                         主包页面
|-- subPack/                       分包页面
|-- common/services/               前端服务层
|-- uniCloud-aliyun/
|   |-- cloudfunctions/            云对象与云函数
|   |-- database/                  数据库 schema
|-- scripts/
|   |-- sync-weapp-config.js       同步本地私有配置到运行文件
|   |-- reset-public-config.js     恢复仓库公开占位配置
|-- manifest.json                  uni-app 配置
|-- project.config.json            微信开发者工具配置
```

## 隐私与公开仓策略

本仓库默认不提交以下真实敏感配置：

- DCloud `AppID`
- 微信小程序 `AppID`
- 微信小程序 `AppSecret`

仓库中的公开文件使用占位符：

- [manifest.json](d:/code/HBworkspace/点餐小程序用户端/manifest.json)
- [project.config.json](d:/code/HBworkspace/点餐小程序用户端/project.config.json)
- [app.config.local.example.js](d:/code/HBworkspace/点餐小程序用户端/uniCloud-aliyun/cloudfunctions/shared/app.config.local.example.js)

本地私有配置文件已被忽略，不会上传到 GitHub：

- [app.config.local.js](d:/code/HBworkspace/点餐小程序用户端/uniCloud-aliyun/cloudfunctions/shared/app.config.local.js)
- [app.config.local.js](d:/code/HBworkspace/点餐小程序用户端/uniCloud-aliyun/cloudfunctions/auth/shared/app.config.local.js)
- [app.config.local.js](d:/code/HBworkspace/点餐小程序用户端/uniCloud-aliyun/cloudfunctions/zhuohao/shared/app.config.local.js)

## 本地运行前需要准备的配置

你需要准备 3 组信息：

1. DCloud `AppID`
2. 微信小程序 `AppID`
3. 微信小程序 `AppSecret`

本地私有配置模板如下：

```js
module.exports = {
	dcloud: {
		appId: '__UNI__YOUR_DCLOUD_APPID__'
	},
	weapp: {
		appId: 'YOUR_WECHAT_APP_ID',
		appSecret: 'YOUR_WECHAT_APP_SECRET'
	}
}
```

## 本地运行步骤

1. 复制配置模板：

```powershell
Copy-Item uniCloud-aliyun/cloudfunctions/shared/app.config.local.example.js uniCloud-aliyun/cloudfunctions/shared/app.config.local.js
```

2. 编辑 [app.config.local.js](d:/code/HBworkspace/点餐小程序用户端/uniCloud-aliyun/cloudfunctions/shared/app.config.local.js)，填入你自己的：

- `dcloud.appId`
- `weapp.appId`
- `weapp.appSecret`

3. 运行同步脚本，把私有配置回填到本地运行文件：

```bash
node scripts/sync-weapp-config.js
```

4. 重新导入或重新编译微信开发者工具项目。

5. 重新部署需要依赖微信配置的云对象，至少包括：

- `auth`
- `zhuohao`

## 提交到 GitHub 前怎么处理

提交前不要直接把真实 `appid` 留在跟踪文件里。执行下面的脚本恢复公开占位配置：

```bash
node scripts/reset-public-config.js
```

该脚本会把以下文件恢复为公开安全状态：

- [manifest.json](d:/code/HBworkspace/点餐小程序用户端/manifest.json)
- [project.config.json](d:/code/HBworkspace/点餐小程序用户端/project.config.json)

然后再执行：

```bash
git diff
git status
```

确认没有真实的 `AppID / AppSecret` 出现在待提交内容中，再推送到 GitHub。

## 推荐工作流

本地开发：

```bash
node scripts/sync-weapp-config.js
```

准备提交：

```bash
node scripts/reset-public-config.js
```

再次开始本地联调：

```bash
node scripts/sync-weapp-config.js
```

## 注意事项

- [project.config.json](d:/code/HBworkspace/点餐小程序用户端/project.config.json) 是跟踪文件，虽然 `.gitignore` 写了规则，但已经被 Git 跟踪后仍然会参与提交，因此必须在提交前执行 `reset-public-config.js`。
- 云端生产环境建议优先使用环境变量注入 `WX_APP_ID`、`WX_APP_SECRET`、`UNI_APP_ID`，不要依赖明文文件。
- 如果获取手机号时报 `appid mismatch` 或 `invalid appid`，先检查微信开发者工具当前运行的真实小程序 `AppID` 是否和本地配置一致。
