# 点餐小程序用户端

> 基于 uni-app + uView UI 构建的扫码点餐 C 端小程序，覆盖堂食/外卖两个场景，提供菜单浏览、购物车、结算和订单查看的完整前端体验，同时预留了与 uniCloud 云端服务对接的能力。

## 功能概览

### 首页（`pages/index/index.vue`）
- Banner、九宫格运营模块和积分预告均采用自适应布局，方便后续替换为 CMS 数据。
- 搜索栏支持关键字联动点餐页，关键词通过 `menuSearchKeyword` 写入本地缓存后跳转菜单双列页。
- “堂食 / 外卖”入口对应底部 Tab 的 `subCurrent`，并能识别桌号 QR scene，在弹窗中补充用餐人数后进入点餐流程。
- 首页“热卖推荐”使用 `dishService.listRecommend` 拉取数据，如无云端接口则自动降级为 `common/menu.js` 中的精选菜品。

### 点餐页（`pages/menu/menu.vue`）
- 左侧类目 + 右侧菜品卡片的双栏结构，类目图标、名称和菜品均来源于 `dishService`，默认从 uniCloud `dish` 云对象读取，如未启用则读取 `common/menu.js` 中的静态菜单。
- 支持堂食/外卖切换、热销/新品/推荐筛选、搜索弹窗、今日推荐横滑、菜品标签、SKU + 口味/加料选择等能力。
- 购物车数据以 `cartMap` 维护，并通过 `cartService` 在本地缓存（`menuCartData`）与云端 `cart` 云对象间同步，实现断网/多设备容错。
- “快速加购”场景（单 SKU、无可选项）直连 `u-number-box`；多规格菜品会弹出规格面板，按 SKU + 选项组拼接唯一键值。
- 购物车弹窗支持数量编辑、清空、价格合计，结算时会把菜品明细、渠道、桌台信息等写入 `dishData`，交给结算页面使用。

### 结算页（`subPack/index/indexSettlement.vue`）
- 根据 `subCurrent` 自动切换堂食/外卖表单：堂食提示桌号和距离，外卖侧展示地址选择卡片。
- 支持本地地址薄、输入表单、餐具数量、用餐人数、送达时间、快速标签、备注输入、优惠券选择和发票信息录入。
- 费用明细会根据餐品金额、打包费、配送费和优惠券自动计算，并保存最近一次提交的 `checkoutProfile`，方便下次自动回填。
- 目前支付结果为模拟跳转到 `subPack/index/indexPaysuccess.vue`，后续可在 `confirmPay` 中接入微信支付。

### 订单模块
- `pages/order/order.vue` 提供历史订单列表，包含堂食/外卖标识、地址、菜品摘要和“再来一单”入口。
- `subPack/order/orderDetail.vue` 展示单笔订单详情（菜品、金额、订单编号、支付方式、下单时间、备注等），用于支付成功后或历史订单中跳转查看。

### 我的（`pages/my/my.vue`）
- 静态的会员卡片、头像、等级条和服务入口，用于展示整体视觉与模块布局。
- 可在该页挂载真实的会员/积分数据，或跳转到 `积分商城、领券中心、联系客服` 等业务子页。

## 技术栈与依赖
- **uni-app**：跨端开发框架，采用微信小程序语法规范，入口位于 `main.js` / `App.vue`。
- **uView UI 1.x**：主 UI 库，大部分组件（`u-swiper`、`u-number-box`、`u-popup` 等）来自 `uni_modules/uview-ui`。
- **z-paging**：已安装在 `node_modules`，目前尚未启用，如需列表无限滚动可直接引入。
- **uniCloud 云对象**：`common/services/dish.js` 与 `common/services/cart.js` 会尝试 `uniCloud.importObject('dish'|'cart')`。若云函数未部署，则读取/写入本地静态数据并在控制台输出提示。

## 目录速览
```
├── App.vue / main.js           # 应用入口
├── pages.json / manifest.json  # 路由、tabBar、平台配置
├── pages/
│   ├── index/index.vue         # 首页/桌台入口
│   ├── menu/menu.vue           # 点餐页（类目 + 菜品 + 购物车）
│   ├── order/order.vue         # 订单列表
│   └── my/my.vue               # 我的
├── subPack/
│   ├── index/indexSettlement.vue   # 结算页
│   ├── index/indexPaysuccess.vue   # 支付成功页
│   └── order/orderDetail.vue       # 订单详情
├── common/
│   ├── menu.js                 # 静态菜单数据（云端未开通时使用）
│   └── services/
│       ├── dish.js             # 菜品服务（云端 + 本地降级）
│       └── cart.js             # 购物车服务（云端 + 本地降级）
├── static/                     # 页面所用图片资源
├── uni_modules/uview-ui/       # uView 组件库
└── 需求文档.md                  # 后续功能规划
```

## 运行与调试
1. **HBuilderX（推荐）**
   - 使用 HBuilderX 打开本目录，确保已安装对应平台（如微信小程序）运行插件。
   - 可直接点击“运行”>“运行到小程序模拟器”或真机预览；调试器会读取 `manifest.json` 和 `pages.json`。
2. **CLI 方式**
   - 该工程来自 HBuilderX 导出，默认未包含 `package.json`。如需 CLI 构建，可执行 `npm init -y`，随后安装 `@dcloudio/uni-app` 相关依赖或通过 `HBuilderX -> 工程 -> 创建 package.json` 生成。
   - 安装完依赖后，可使用 `npm run dev:mp-weixin` / `npm run build:mp-weixin` 等 uni-app 脚本（需在 `package.json` 中配置）。
3. **依赖管理**
   - `node_modules` 已包含 uView/z-paging，若需要重新安装，可删除该目录后在 HBuilderX 中执行 “工具 -> npm -> 安装依赖”。
   - 如果要升级 uView，可在 `uni_modules` 中直接替换版本或使用 HBuilderX 插件市场。

## 数据与服务交互
- **菜品数据**：优先通过 `dish` 云对象提供的 `listCategories/list/listRecommend/detail/search` 等方法获取；若 `uniCloud` 不可用，则加载 `common/menu.js`，同时提供关键字过滤以保障搜索功能可用。
- **购物车**：`cart` 云对象应实现 `sync/get/clear` 三个方法，用于多端共享。同样提供了本地降级逻辑（`menuCartData` + `menuCartDataRemoteShadow`），保证即使离线也能继续下单。
- **结算数据**：菜品列表、渠道、桌号等由点餐页写入 `dishData`，结算页读取后展示；结算表单结果通过 `checkoutProfile` 等 key 缓存，便于二次进入自动填充。
- **优惠券/地址/发票**：当前为本地假数据，存储在 `couponList`、`userAddressList`、`invoiceInfo` 中，可替换为真实接口。
- **订单/会员**：`pages/order`、`subPack/order/orderDetail` 与 `pages/my` 仍为静态渲染，作为 UI 模板，后续对接后端即可。

### 常用本地缓存 Key
| Key | 用途 | 读写位置 |
| --- | --- | --- |
| `subCurrent` | 堂食/外卖 Tab 状态 | 首页、点餐页、结算页 |
| `tableNo` / `peopleCount` / `tableInfo` | 桌号与就餐人数 | 首页弹窗、点餐页、结算页 |
| `menuSearchKeyword` / `menuTargetDish` | 首页与菜单跳转间的搜索、菜品定位 | 首页、点餐页 |
| `cartSessionId` / `menuCartData` / `menuCartDataRemoteShadow` | 购物车会话与本地快照 | `pages/menu/menu.vue`、`common/services/cart.js` |
| `dishData` | 传递到结算页的购物车快照 | 点餐页 -> 结算页 |
| `checkoutProfile` | 结算表单最近一次填写信息 | 结算页 |
| `userAddressList` | 本地地址薄 | 结算页 |

## 后续扩展建议
- 参考《需求文档.md》中 F1-F25 的规划，优先完成 `dish`、`cart`、`order` 等核心 uniCloud 云对象，替换当前的本地假数据。
- 在 `confirmPay` 中对接微信支付 + 支付回调，生成真实订单号后再跳转支付成功页。
- 将订单列表、详情、我的页面改为实时接口，增加订单筛选、售后、会员信息等交互。
- 引入运营配置（banner、活动、推荐位等），可在 uniCloud/uni-admin 中维护并下发，减少手动改代码的频率。
- 根据需要启用 `z-paging` 以优化长列表性能，并结合数据埋点/通知模块完善统计能力。

如需了解更详细的业务规划，可查阅根目录下的《需求文档.md》。欢迎在此 README 基础上补充部署脚本、API 文档或测试说明，保持团队间的信息同步。
## ???



## 微信支付接入（真实环境）
当前项目默认使用 `common/services/payment.js` 中的模拟支付。若需要切换为真实支付，可参考下述步骤：

1. **准备商户资料**：包括微信小程序 AppID、微信支付商户号 MCHID、API v3 密钥/旧版 Key、商户证书 `apiclient_cert.pem` / `apiclient_key.pem` 以及支付回调 HTTPS 地址。
2. **配置 uni-pay 插件**：编辑 `uni_modules/uni-pay/uniCloud/cloudfunctions/common/uni-pay/config.js`，填入上述信息，并把证书放入 `cert/` 目录；如需自定义回调，修改 `notifyUrl` 等参数。
3. **前端调用方式**：使用 `const uniPay = uniCloud.importObject('uni-pay-co', { customUI: true })`，创建订单后调用 `uniPay.pay.requestPayment({...})` 获取 `uni.requestPayment` 所需参数；支付成功跳转 `indexPaysuccess`，失败或取消跳转订单详情；退款可调用 uni-pay 提供的 `refund` 接口。
4. **部署与调试**：在 HBuilderX -> uniCloud 面板上传 `uni-pay-co` 云对象及依赖，导入插件自带的数据库 Schema，真机调试时确保域名和 HTTPS 证书已在微信后台备案。

开发阶段可继续使用模拟支付，上线前再切换为 uni-pay 即可。
