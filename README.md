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
- 接入 `member` 云对象与登录授权，支持微信头像/昵称同步、默认头像兜底以及会员等级/积分展示。
- 提供每日签到、积分商城、优惠券中心、我的优惠券等组件，优惠券列表带骨架 loading、空态跳转按钮，便于快速体验真实运营场景。
- 支持头像编辑、昵称修改、手机号授权，本地缓存会自动更新，且云端资料已避免被微信默认头像/昵称二次覆盖。

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
- **订单/会员**：订单页仍以静态数据演示；“我的”页已对接 `member` 云对象，登录后会读取 `user_profile`、`coupon_template`、`coupon`、`point_goods` 等集合，并在本地缓存 `memberProfile`、`memberToken`，保证多次进入仍能展示真实会员信息。

### AppID / AppSecret 统一管理
- 根目录新增 `app.config.js`，集中维护微信小程序的 `appId` 与 `appSecret`，云对象（如 `auth`、`zhuohao`）会统一从该文件或 `WX_APP_ID / WX_APP_SECRET` 环境变量中读取，无需在多处重复修改。
- 由于 `manifest.json`、`project.config.json` 等文件必须写入字面量，可在修改 `app.config.js` 后执行 `node scripts/sync-weapp-config.js` 一键同步。该脚本除了更新上述配置外，还会把 `uniCloud-aliyun/cloudfunctions/shared/app.config.js` 的内容复制到 `auth`、`zhuohao` 等云对象的 `shared/app.config.js` 子目录中，确保上传云函数时也能读取到相同的 AppID/AppSecret。
- **上线切换 APPID checklist**  
  1. 更新 `app.config.js` 中的 `weapp.appId` / `appSecret`；如需使用环境变量部署，可将 `WX_APP_ID/WX_APP_SECRET` 配置到对应空间的环境变量中。  
  2. 运行 `node scripts/sync-weapp-config.js`，自动同步 `manifest.json` 与 `project.config.json` 的 `appid`。如有必要，将 `manifest.json` 的变更重新提交到版本库。  
  3. 重新上传依赖 AppID 的云对象（如 `auth`、`zhuohao`、`paymentService` 等），它们都会从 `app.config.js` 或环境变量读取最新配置。  
  4. 使用新的 AppID 到微信公众平台配置合法域名/服务器等信息，并在微信开发者工具中切换为该 AppID 运行或上传。  
  5. 若脚本提示某文件已是最新版本，请确认你当前工作区的 `appId` 与目标一致即可，无需手动改动其他位置。

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




## 微信支付接入（真实环境）
当前项目默认使用 `common/services/payment.js` 中的模拟支付。若需要切换为真实支付，可参考下述步骤：

1. **准备商户资料**：包括微信小程序 AppID、微信支付商户号 MCHID、API v3 密钥/旧版 Key、商户证书 `apiclient_cert.pem` / `apiclient_key.pem` 以及支付回调 HTTPS 地址。
2. **配置 uni-pay 插件**：编辑 `uni_modules/uni-pay/uniCloud/cloudfunctions/common/uni-pay/config.js`，填入上述信息，并把证书放入 `cert/` 目录；如需自定义回调，修改 `notifyUrl` 等参数。
3. **前端调用方式**：使用 `const uniPay = uniCloud.importObject('uni-pay-co', { customUI: true })`，创建订单后调用 `uniPay.pay.requestPayment({...})` 获取 `uni.requestPayment` 所需参数；支付成功跳转 `indexPaysuccess`，失败或取消跳转订单详情；退款可调用 uni-pay 提供的 `refund` 接口。
4. **部署与调试**：在 HBuilderX -> uniCloud 面板上传 `uni-pay-co` 云对象及依赖，导入插件自带的数据库 Schema，真机调试时确保域名和 HTTPS 证书已在微信后台备案。

开发阶段可继续使用模拟支付，上线前再切换为 uni-pay 即可。

> **安全提示（务必配置鉴权）**
> - `uni-pay-co` 默认开启 token 校验与角色权限，仅后台管理员账号才能调用退款等敏感接口。
> - 若为方便联调临时关闭鉴权，请务必仅在本地或测试空间操作，联调完成后立即恢复校验。
> - 生产环境必须保留 token 鉴权与权限判断，确保只有通过 uni-id 登录且具备管理员角色的账号才能执行退款或代客支付，防止被恶意调用。

### 鉴权开关（测试 / 生产切换）
- **关闭鉴权（当前默认）**：`uni_modules/uni-pay/uniCloud/cloudfunctions/uni-pay-co/config/security.js` 中将 `enableUniPayAuth` 设为 `false`。用于本地联调或演示，上传云端后退款等接口不再校验角色。
- **重新开启鉴权**：将 `enableUniPayAuth` 改为 `true`，重新上传 `uni-pay-co` 到对应服务空间。此时会恢复 `config/permission.js` 中的管理员角色限制，并要求调用方传入合法的 uni-id token。
- **注意**：切回生产前务必确认鉴权已开启，并在 README 中保留上述步骤以便后续团队成员同步。

## 厨房 / 备餐通知（F10）
- **数据与云对象**：新增 `kitchen_ticket` 集合（`uniCloud-aliyun/database/kitchen_ticket.schema.json`）与 `kitchen` 云对象，提供 `push`（推送订单到后厨）、`list`（按订单/档口查询）与 `updateStatus`（更新备餐/出餐状态），并与 `order_status_log` 打通。
- **前端联动**：`subPack/index/indexSettlement.vue` 在支付成功后调用 `kitchenService.push`，自动生成厨房工单并将订单状态推进到“备餐中”。`subPack/order/orderDetail.vue` 新增“备餐进度”卡片，实时展示厨房事件、加急标记与菜品列表。
- **测试方法**  
  1. 使用 HBuilderX 真机调试完成一次下单 + 支付，支付成功后在 uniCloud 控制台（数据库 -> `kitchen_ticket`）可看到新工单。  
  2. 在 “订单详情” 页面应出现“备餐进度”模块，默认状态为“备餐中”。  
  3. 可在 HBuilderX 右键 `kitchen` 云对象 → 运行云对象，执行 `updateStatus({ orderNo: 'ODxxxx', nextStatus: 'ready' })` / `updateStatus({... 'completed'})`，订单详情中的时间线将同步更新。  
  4. 若仅做本地模拟（未连接 uniCloud），`kitchenService` 会把工单缓存在本地，同样可以在订单详情看到进度。

## 桌台与外卖场景（F11-F13）
- **桌台管理（F11）**：添加 `restaurant_table`、`table_session` 集合与 `table` 云对象（`scanOpen/status/callService/release`）。首页扫码后会调用 `tableService.open` 生成会话；点餐页头部展示桌号/状态并支持“呼叫服务”“刷新状态”。
- **排队与预约（F12）**：新增 `queue_ticket` 集合与 `queue` 云对象，首页提供取号与预约弹窗，`queueService.take/reserve` 支撑排队、统计等待桌数，本地离线也有模拟数据。
- **外卖配送策略（F13）**：引入 `delivery_area` 集合与 `delivery` 云对象，结算页（外卖模式）会依据地址实时计算配送距离、起送价、打包费，`deliveryWarning` 会提醒用户未达配送条件并阻止支付。
- **测试指南**  
  1. **桌台**：在首页输入桌号并选择人数，确认后进入点餐页，顶部显示桌号与状态。点击“呼叫服务”可在云端 `table_session` 中看到 `call_service_logs`。  
  2. **排队**：在首页点击“取号”填写人数，成功后可在 `queue_ticket` 集合查看待叫号列表，页面的“当前等待”会实时刷新。  
  3. **外卖配送**：切换外卖并选择地址，结算页会展示“配送费/打包费”，若地址超范围或金额未达起送价，按钮会提示原因且无法支付；在 `delivery_area` 集合配置不同 radius/fee 即可模拟范围变化。

## 会员与营销（F14-F17）
- **登录与会员档案（F14）**：新增 `member` 云对象与 `user_profile` 集合，`pages/my/my.vue` 通过 `memberService.login` 获取昵称/头像/积分，未开通云端时可自动降级为本地会员。
- **积分/等级体系（F15）**：维护 `member_level_rule`、`point_ledger`，支持每日签到（加积分）、等级权益展示以及积分流水；`member.signIn` 会校验当日是否已签到。
- **优惠券中心（F16）**：`coupon` 云对象驱动 `coupon_template`、`coupon` 集合，首页结算页会实时拉取可用优惠券；“我的”页提供领取与查看入口，结算页会依据订单金额/渠道自动筛选可用券。
- **积分商城（F17）**：`point_goods` 集合+`member.exchangeGoods` 支撑积分兑换，前端“我的”页展示可兑换商品并在成功后扣减积分。
- **会员信息防覆盖**：老用户再次登录时，云端仅在档案缺失时才写入微信头像/昵称；首次建档时统一使用云空间静态头像 `https://mp-a83aee34-7c6d-40e3-a241-85ab45b7ff6e.cdn.bspapp.com/cloudstorage/static/my/avatarurl.jpg` 与“微信用户 + 6位随机数”作为昵称，初始积分 400，与前端默认头像保持一致，需要换默认形象只需改该地址即可。
- **测试方法**  
  1. 打开“我的”页，点击“登录”并授权头像昵称，可看到会员等级条/积分值；点击“签到 +10”验证积分累加。  
  2. 在同一页面的“优惠券中心”领取一张券，再前往结算页确认优惠栏中出现对应的券，并能在金额满足门槛时选择使用。  
  3. 在“积分商城”中兑换一件商品，返回顶部查看积分是否减少；同时在 `point_goods` 集合中可看到库存减 1。  
  4. 若在无云端环境运行，上述操作会自动使用本地 mock 数据，保证流程可体验。
  5. 体验优惠券中心的骨架屏/空态按钮：切换网络或短暂断开 uniCloud 时可看见 `u-loading` 占位，模板为空时会出现“立即去领取”/“去看看”按钮，可引导用户跳转运营活动。

## 微信登录认证
- **接口实现**：新增 `common/services/auth.js` 与 `uniCloud-aliyun/cloudfunctions/auth` 云对象，分别封装了 `wx.login -> code2Session`、`checkSessionKey`、`ResetUserSessionKey` 流程，后端遵循官方文档（`code2Session`、`checkSession`、`ResetUserSessionKey`）完成 openid/session_key 的下发与校验，并把 session 信息持久化到 `user_session` 集合。
- **配置步骤**  
  1. 在微信小程序管理后台获取 `AppID` 与 `AppSecret`，写入 `uniCloud-aliyun/cloudfunctions/auth/config.js`（或通过 `WX_APP_ID/WX_APP_SECRET` 环境变量注入）。  
  2. 在 HBuilderX -> uniCloud 面板上传 `auth` 云对象，并在数据库中导入 `user_session.schema.json`。  
  3. 微信开发者工具内运行小程序时，点击“我的”页 → “登录”触发 `uni.getUserProfile` + `wx.login`，前端会把 code 与用户信息传给 `auth.login`，再由 `member.login` 根据 openid 生成/更新会员档案。
- **校验与调试**  
  - 在真机或模拟器上完成一次登录后，可在 `user_session` 集合看到对应记录，字段 `expires_at` 表示 session_key 在后端缓存的过期时间。  
  - 关闭小程序重新进入，`common/services/auth.js` 会优先使用本地缓存的 session 并在过期前自动刷新；若想验证接口，可在控制台执行 `uniCloud.importObject('auth').checkSession({ openid, sessionKey })` 或 `resetSession`，返回 `valid: true` 即表示与官方接口对接成功。  
  - 登录后若用户未主动设置头像/昵称，前端会使用 `pages/my/my.vue` 中的 `defaultAvatar` 兜底；云端 `auth.login` 负责落库 openid 并赋予“微信用户 + 随机数”昵称与静态头像，`member.login` 会在资料存在时跳过覆盖，避免清缓存重登导致资料丢失。若需要变更默认头像或昵称格式，只需修改 `auth/index.obj.js` 中的常量并重新上传该云对象。
  - 验证默认头像/昵称是否生效：先在 `user_profile` 中删除测试 openid，再清除小程序本地缓存，重新登录后应看到 `[member.login] create profile ...` 日志，数据库对应记录的 `nickname` 与 `avatar` 即为统一默认值。
  - 如果尚未配置 `AppID/AppSecret` 或当前运行环境不支持 `wx.login`，服务会自动降级为本地 mock 登录，方便继续开发，但不会产生真实的 openid。上线前务必补齐密钥并在 README 的该段说明中打勾确认。
