# 点餐小程序用户端

> 基于 **uni-app + uView UI + uniCloud** 的微信点餐 C 端方案，覆盖堂食、外卖、会员、营销、售后等完整流程，可单独体验本地 mock，也可无缝切换到云端服务。

---

## 1. 架构速览

| 模块 | 说明 |
| --- | --- |
| 前端 | `uni-app` 小程序工程，主要页面位于 `pages/`，结算/订单详情等放在 `subPack/`。UI 统一使用 `uni_modules/uview-ui`。 |
| 云服务 | `uniCloud` 云对象 + Schema：共计 `dish`、`cart`、`order`、`member`、`coupon`、`queue`、`table`、`delivery`、`kitchen`、`support`、`message`、`analytics`、`operation` 等十余个云对象；所有 schema 位于 `uniCloud-aliyun/database/`。 |
| 本地降级 | `common/services/*.js` 会优先调用云对象，失败时自动切换到本地 mock（如 `common/menu.js`、`menuCartData` 缓存），保证在未部署云端时也能完整体验。 |
| 资源配置 | `app.config.js` 集中管理 AppID/AppSecret，`scripts/sync-weapp-config.js` 用于同步 `manifest.json` / `project.config.json`，云对象可读取相同配置。 |

---

## 2. 功能地图（F1 ~ F22）

| 编号 | 功能 | 前端入口 | 核心云对象/服务 |
| --- | --- | --- | --- |
| F1~F3 | 点餐、菜品详情、购物车 | `pages/menu/menu.vue` | `dish`、`cart` |
| F4~F9 | 购物车、结算、订单创建、订单中心 | `subPack/index/indexSettlement.vue`、`pages/order/order.vue` | `cart`、`order`、`paymentService`（模拟）、`review` |
| F10 | 厨房/备餐通知 | `subPack/order/orderDetail.vue` | `kitchen` |
| F11~F13 | 桌台/外卖、排队、配送策略 | `pages/index/index.vue`、`pages/menu/menu.vue`、`subPack/index/indexSettlement.vue` | `table`、`queue`、`delivery` |
| F14~F17 | 会员、积分、优惠券、积分商城 | `pages/my/my.vue`、`subPack/member/pointLedger.vue` | `member`、`coupon`、`point_goods` |
| F18~F20 | 评价、售后、消息中心 | `subPack/order/orderDetail.vue`、`subPack/service/supportCenter.vue`、`subPack/service/messageCenter.vue` | `review`、`support`、`message` |
| F21~F22 | 运营配置、数据埋点 | `pages/index/index.vue`、`pages/my/my.vue` | `operation`、`analytics` |
| **F23** | uniCloud 服务网关 | 统一由 `service.call` 间接访问 | `service` |

> 需求详情可参考根目录《需求文档.md》，README 仅对已实现部分做工程化描述。

---

## 3. 页面与模块说明

### 3.1 首页 `pages/index/index.vue`
- Banner、九宫格权益、积分提示全部通过 `operationService.fetchSlots('home_banner' 等)` 动态渲染，支持云端配置与本地兜底。
- 支持 `subCurrent`（堂食/外卖）切换，并能解析桌号二维码的 scene，触发桌台绑定、人数选择及排队信息。
- 搜索框写入 `menuSearchKeyword`，跳转点餐页后自动定位关键词。
- “今日推荐/热卖菜品” 调用 `dishService.listRecommend`，云端返回失败时读取 `common/menu.js`。

### 3.2 点餐页 `pages/menu/menu.vue`
- 左侧类目 + 右侧菜品卡片，均来源于 `dishService.listCategories/list`（可降级读取 `common/menu.js`）。
- 顶部堂食/外卖切换为自定义 tabs，桌台信息显示呼叫/刷新，按钮样式紧凑。
- 提供热销/新品/推荐筛选、搜索弹窗、今日推荐滑块，菜品支持标签、SKU、多规格 + 加料组合、快速加购。
- 购物车使用 `cartMap` 与 `cartService`，自动在本地缓存与云端 `cart.sync` 之间同步，并支持断网缓存（`menuCartData`）。
- 选规格弹窗/购物车弹窗样式已升级，按钮与 u-number-box 颜色统一；加减操作即时同步总价及角标。

### 3.3 结算页 `subPack/index/indexSettlement.vue`
- **堂食模式**：显示桌号、用餐人数、套餐时间、备注、优惠券、餐具、发票等表单。
- **外卖模式**：地址簿支持新增/删除/默认/“新增”标签，仅最近创建的地址保留红标；手机号只能输入数字且必须为 11 位（输入过滤 + blur 校验 + 保存校验）。删除按钮固定在地址行最右侧。
- 费用明细根据餐品金额、打包费、配送费、优惠券自动计算；提交成功写入 `checkoutProfile` 以便下次回填。
- 支付流程目前模拟调用 `paymentService.mockPay`，可按 README 的微信支付章节切换 uni-pay 真实支付。

### 3.4 订单模块
- `pages/order/order.vue` 列表支持堂食/外卖标识、菜品摘要、订单金额、支付状态、催单/再来一单按钮，并与评价/售后流程联动。
- `subPack/order/orderDetail.vue` 显示菜品明细、费用、桌台、配送地址、支付状态、备注、发票；若订单处于制作中，会展示厨房备餐进度时间线，并提供评价入口。
- `subPack/order/reviewSubmit.vue` 负责菜品/服务评价，支持打分 + 图片上传（模拟） + 文本填写；提交后 `review` 集合会记录，按钮状态随之改变。

### 3.5 我的 `pages/my/my.vue`
- 登录采用 `auth` + `member` 云对象，首次建档统一使用静态默认头像与“微信用户 + 6 位随机数”昵称，避免被微信默认值覆盖；云端资料存在时不会二次覆盖。
- 顶部卡片显示等级、积分、最近变化、查看明细；积分卡片整合为单个信息盒，避免多处展示。
- 我的服务：积分签到、积分商城、领券中心、联系客服、消息中心等入口；每个入口都有骨架屏/空态兜底，支持离线体验。
- 我的资产：钱包、订单、优惠券、意见反馈、给好评等入口；积分流水、兑换记录合并至单个页面（`subPack/member/pointLedger.vue`），并附带右上角“积分规则”说明弹窗。
- 消息中心/客服中心均通过 `message`、`support` 云对象提供真实交互（含本地 fallback）。

### 3.6 其他页面
- `subPack/index/indexPaysuccess.vue`：支付完成提示，可进一步跳到订单详情。
- `subPack/service/supportCenter.vue`、`subPack/service/messageCenter.vue`：售后与消息模块。
- `subPack/member/pointOrders.vue`：积分兑换记录，配合积分流水展示用户积分行为。

---

## 4. 云对象、数据库与本地降级

| 云对象 | 主要方法 | 对应集合 | 本地降级 |
| --- | --- | --- | --- |
| `dish` | `listCategories/list/detail/listRecommend/search` | `dish`、`dish_category` | 读取 `common/menu.js` |
| `cart` | `sync/get/clear` | `cart_session` | 本地 `menuCartData` |
| `order` | `create/list/detail/updateStatus` | `order`、`order_item`、`order_status_log` | 本地 `mockOrders` |
| `member` | `login/profile/signIn/exchangeGoods/fetchPointLedger` | `user_profile`、`point_ledger`、`point_goods` | `memberProfileMock` |
| `coupon` | `listTemplate/listUsable/claim/use` | `coupon_template`、`coupon` | `couponMockList` |
| `table` / `queue` / `delivery` | 桌台绑定、呼叫服务 / 排队叫号 / 配送范围 | `restaurant_table`、`table_session`、`queue_ticket`、`delivery_area` | `tableMock`、`queueMock`、`deliveryMock` |
| `kitchen` | `push/list/updateStatus` | `kitchen_ticket` | 本地 `kitchenTicketsMock` |
| `review` / `support` / `message` | 评价 / 售后 / 消息中心 | `review`、`support_ticket`、`message_center` | 对应本地缓存 |
| `operation` / `analytics` | 运营位拉取 / 埋点 | `operation_slot`、`analytics_event` | 本地静态配置 + `analyticsEventsMock` |
| `auth` | `login/checkSession/resetSession` | `user_session` | 若未配置 AppID，则降级为本地模拟登录 |
| `paymentService`（或 `uni-pay-co`） | 模拟支付 / 真实支付 | 依赖 `uni-pay` 插件 | 真实支付需按 README 配置 uni-pay |

> 导入数据库 Schema：HBuilderX -> uniCloud -> 右键 `database` 目录 -> “导入 db_init.json”，或在控制台手动创建。所有 schema 已位于 `uniCloud-aliyun/database/*.schema.json`。

---

## 5. 运行与调试

### 5.1 HBuilderX
1. 打开项目（建议 4.85 及以上）。
2. 确认 `manifest.json` 中 AppID 正确，或运行 `node scripts/sync-weapp-config.js` 同步。
3. 运行 -> 微信小程序模拟器 / 真机调试。
4. 若需连接 uniCloud，请在 HBuilderX 中登录阿里云空间，将 `uniCloud-aliyun` 目录绑定到同一空间。

### 5.2 命令行
1. `npm install`（若无 `package.json` 可在 HBuilderX 中创建）。
2. `npm run dev:mp-weixin`（需自行在 package.json 中配置脚本 `cross-env UNI_PLATFORM=mp-weixin vue-cli-service uni-build --watch`）。
3. 使用微信开发者工具导入 `dist/dev/mp-weixin` 目录，关联 AppID 调试。

### 5.3 常见问题
- **uView 组件找不到**：已将 `order-mode-tabs`、地址管理等自定义组件手动注册；若报某组件路径错误，请确保 `unpackage/dist` 目录被清理并重新编译。
- **dart-sass 错误**：项目已全部兼容 dart-sass，如需旧语法，可在 `manifest.json` 加入 `"sassImplementationName": "node-sass"`。
- **AppID/AppSecret 未配置**：`auth` 云对象将提示 `appid missing`；请在 `app.config.js` 或环境变量补齐并重新上传云对象。

---

## 6. 微信登录与支付

### 6.1 登录流程
1. 前端调用 `uni.login` + `uni.getUserProfile`，`authService.login` 将 `code`、`userInfo` 传递给 `auth` 云对象。
2. `auth.login` 根据 `code2Session` 拿到 `openid/session_key`，写入 `user_session`，并把 `openid` 返回给前端。
3. 前端继续调用 `memberService.login`，云端根据 `openid` 创建/更新 `user_profile`，返回 `memberToken` + profile 信息。
4. “我的”页和其他需要鉴权的模块读取 `memberProfile`、`memberToken`，自动刷新或提醒登录。

> 若 `wx.login` 不可用（模拟器未授权/未配置 AppID），`authService` 会降级为本地 mock 登录，同时在控制台输出警告。

### 6.2 微信支付（可选）
- 当前 `paymentService` 仅模拟支付，支付成功后直接写入订单并跳转成功页。
- 要切换真实支付，请部署 `uni_modules/uni-pay` 中的 `uni-pay-co` 云对象：
  1. 在 `uni_modules/uni-pay/uniCloud/cloudfunctions/common/uni-pay/config.js` 填写商户号、API Key、证书等。
  2. 在 `manifest.json` -> mp-weixin -> 微信支付中填写商户号，并配置合法域名。
  3. 重新上传 `uni-pay-co`，在 `common/services/payment.js` 中改为调用 `uniPayCo.pay` / `uniPayCo.refund`。
  4. 调试结束后务必开启 `config/security.js` 中的鉴权开关，生产环境必须校验管理员权限。

---

## 7. 关键本地缓存 Key 与说明

| Key | 说明 |
| --- | --- |
| `subCurrent` | 堂食/外卖状态；首页、点餐页、结算页共用。 |
| `tableInfo` / `peopleCount` | 当前桌台信息，用于桌台展示、呼叫服务。 |
| `menuSearchKeyword` / `menuTargetDish` | 首页搜索与点餐页联动，支持直接定位菜品。 |
| `menuCartData` / `menuCartDataRemoteShadow` | 购物车本地快照及云端同步影子。 |
| `dishData` | 点餐页 -> 结算页 传递的购物车详情。 |
| `checkoutProfile` | 结算表单最近一次提交结果（含地址 ID、备注、发票、餐具等）。 |
| `userAddressList` | 外卖地址薄，包含默认地址、新增地址等信息。 |
| `memberProfile` / `memberToken` | 登录后的会员数据与 token。 |
| `analyticsEventsMock` | 未接入云端时的埋点缓存，便于调试。 |

---

## 8. 测试建议

1. **基础流程**：首页切换堂食/外卖 -> 进入点餐页 -> 加购多种菜品 -> 打开购物车 -> 跳转结算 -> 填写堂食/外卖信息 -> 提交订单 -> 查看订单详情 -> 评价。
2. **桌台/排队**：在首页输入桌号和人数，或开启排队弹窗，确认 `tableService`、`queueService` 的云端记录同步成功。
3. **外卖地址**：新增多条地址（含手机号校验、删除、默认标签），确认“新增”标签只保留最后一条，删除按钮位于行内最右侧。
4. **优惠券/积分**：在“我的”页领取优惠券+签到，前往结算页验证优惠金额变化，再回“积分商城”兑换商品查看流水。
5. **售后/消息**：订单详情 -> 去评价；“我的” -> 客服中心、消息中心，提交工单并查看消息已读状态。
6. **运营位**：在云端 `operation_slot` 中修改 banner/卡片内容，刷新首页与“我的”页观察实时变更。
7. **埋点**：真机执行搜索/点击操作，查看 `analytics_event` 集合或本地 mock 是否生成记录。
8. **支付/厨房**：完成一次“支付”后，在 `order`、`kitchen_ticket`、`order_status_log` 中验证记录，并在订单详情查看备餐进度。

---

## 9. 后续规划 / 提示

- 结合《需求文档.md》继续补齐未上线的 F23+ 功能（如排队取号联通知会、商户端看板等）。
- 真实部署前请确认：AppID/AppSecret 已同步、云对象与 Schema 已上传、支付鉴权开启、`common/services/*` 中的 mock 开关按需关闭。
- 若调整默认头像/昵称/积分等规则，请同时修改 `uniCloud-aliyun/cloudfunctions/member/index.obj.js` 和 `pages/my/my.vue` 的默认常量，保持前后台一致。

---

## 10. API / 云对象速查表

| 云对象 | 方法 | 请求示例 | 说明 |
| --- | --- | --- | --- |
| `service` | `call({ service, action, params, token })` | `uniCloud.importObject('service').call({ service: 'dish', action: 'list', params: { restaurantId: 'default' } })` | 统一服务网关（F23），支持鉴权、参数校验、限流、日志；其余接口都可通过此方法调用。 |
| `dish` | `list({ restaurantId })` | `uniCloud.importObject('dish').list({ restaurantId: 'default', categoryId })` | 返回菜品列表，包含 SKU、加料选项。 |
| `cart` | `sync({ sessionId, payload })` | `cartService.syncRemote(cartSessionId, cartMap)` | 把本地购物车同步到云端，会返回最新 session。 |
| `order` | `create(payload)` | `orderService.create(cartSnapshot)` | 创建订单，支持堂食/外卖字段、优惠券、发票等。 |
| `member` | `login({ code, userInfo })` | `memberService.login({ code, userInfo })` | 微信登录，返回会员档案 + token。 |
| `coupon` | `listUsable({ userId, totalAmount, channel })` | `couponService.listUsable(uid, goodsTotal, channel)` | 结算页按金额/渠道筛选可使用的优惠券。 |
| `support` | `create({ orderNo, type, desc })` | `supportService.create(ticketForm)` | 创建售后工单；`list/detail/reply` 用于客服对话。 |
| `message` | `list({ userId })` | `messageService.list(uid)` | 获取消息中心列表，`markRead` 可批量已读。 |
| `kitchen` | `push({ order })` | `kitchenService.push(order)` | 支付后推送到后厨队列，`updateStatus` 用于出餐。 |
| `operation` | `fetch({ slotCodes })` | `operationService.fetchSlots(['home_banner'])` | 单次批量拉取多个运营位配置。 |
| `analytics` | `track({ event, data })` | `analyticsService.track('search', { keyword })` | 埋点上报，`data` 支持自定义结构。 |

> 表格中展示的是云对象方法及典型调用方式，详细字段见对应 `uniCloud-aliyun/cloudfunctions/*/index.obj.js`。

---

## 11. 部署脚本 / 自动化示例

下方脚本展示了一个最简的构建 + 同步流程，可根据团队 CI/CD 需求扩展。

```bash
# scripts/deploy.sh
#!/usr/bin/env bash
set -e

# 1. 同步 AppID / Config
node scripts/sync-weapp-config.js

# 2. 安装依赖
npm install

# 3. 构建微信小程序
npm run build:mp-weixin

# 4. 上传云对象（示例：dish/cart/order/member）
for fn in dish cart order member coupon kitchen delivery table queue support message operation analytics auth; do
  echo "upload $fn ..."
  hbx uniCloud upload cloudfunctions/$fn --provider aliyun
done

echo "Done."
```

使用方式：
1. 先在 `package.json` 中配置 `build:mp-weixin`（`cross-env UNI_PLATFORM=mp-weixin vue-cli-service uni-build`）。
2. 保证 HBuilderX CLI (`hbx`) 已配置在系统 PATH 中，并已登录对应 uniCloud 空间。
3. `bash scripts/deploy.sh` 即可完成 AppID 同步、依赖安装、构建与云对象上传。若需要上传数据库 Schema，可在脚本中追加 `hbx uniCloud db import` 的命令。

---

欢迎在此 README 基础上继续补充：如 API 文档、部署脚本、CI/CD 流程、监控告警说明等。也欢迎提交 Issue/PR 供团队协作。 |
