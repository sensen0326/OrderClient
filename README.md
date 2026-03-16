# 点餐小程序用户端

基于 `uni-app + uView UI + uniCloud` 的微信点餐小程序前端，覆盖堂食、外卖、下单、支付、订单、会员、客服消息等核心流程。  
项目支持两种运行模式：
- 云端模式：调用 `uniCloud` 云对象（`dish/cart/order/member/...`）。
- 本地降级模式：云对象不可用时自动回退到本地 mock + `uni storage`，方便离线联调。

## 技术栈
- `uni-app`（Vue2，见 `main.js`）
- `uview-ui@1.8.8`
- `z-paging@2.6.9`（已安装，当前页面未深度使用）
- `uniCloud` 云对象 + `uniCloud-aliyun/database` schema
- `uni-pay-co`（支付能力，未配置时自动走模拟支付）

## 项目架构

### 1) 页面层
- 主包：`pages/index/index`、`pages/menu/menu`、`pages/order/list`、`pages/order/detail`、`pages/my/my`
- 分包：`subPack/index/indexSettlement`、`subPack/index/indexPaysuccess`、`subPack/member/pointLedger`、`subPack/order/reviewSubmit`、`subPack/service/supportCenter`、`subPack/service/messageCenter`

### 2) 服务层
位于 `common/services`，按业务拆分：
- 点餐链路：`dish`、`cart`、`checkout`、`order`、`payment`、`kitchen`
- 到店/配送：`table`、`queue`、`delivery`
- 会员营销：`auth`、`member`、`coupon`、`operation`
- 互动能力：`review`、`support`、`message`
- 埋点：`analytics`

### 3) 云端层
- 云对象目录：`uniCloud-aliyun/cloudfunctions/*/index.obj.js`
- 数据模型：`uniCloud-aliyun/database/*.schema.json`
- 统一服务网关：`service` 云对象（保留扩展）

## 当前功能（按页面）

### 首页 `pages/index/index.vue`
- 运营位动态加载（banner、入口卡片、推荐卡片），失败自动回退本地默认配置
- 菜品搜索入口（写入 `menuSearchKeyword`，跳转点餐页）
- 堂食桌台状态展示、呼叫服务
- 排队取号/预约到店弹窗
- 热卖推荐、积分/活动入口

### 点餐页 `pages/menu/menu.vue`
- 分类 + 菜品列表 + 推荐位
- 关键词搜索、热销/新品/推荐筛选
- 单规格快速加购、多规格/加料选择弹窗
- 购物车弹层、数量编辑、价格汇总
- 购物车本地缓存与云端同步（`cart.sync/get/clear`）
- 堂食桌号自动绑定、刷新桌台状态、呼叫服务
- 结算跳转并传递 `dishData`

### 结算页 `subPack/index/indexSettlement.vue`
- 堂食/外卖双模式表单
- 地址管理（新增、删除、默认选择、手机号校验）
- 配送可达性与费用估算（`delivery.quote/validate`）
- 优惠券可用集加载与选择（`coupon.listUsable`）
- 发票、餐具、备注、预约时间等字段
- `checkout.preview/submit` 创建订单，随后支付
- 支付成功后推送后厨票据（`kitchen.push`）并跳转支付成功页/订单详情

### 订单列表/详情
- `pages/order/list.vue`：按状态筛选、关键词搜索、下拉刷新、取消订单、催单
- `pages/order/detail.vue`：订单明细、费用拆分、状态时间线、退款申请

### 我的 `pages/my/my.vue`
- 登录态管理（`auth + member`）
- 昵称/头像编辑、手机号授权绑定
- 积分签到、积分流水、等级规则
- 积分商品兑换
- 优惠券模板领取与我的优惠券
- 精选运营卡片、服务入口（客服/消息中心等）

### 其他分包页面
- `reviewSubmit`：订单评价提交与重复提交保护
- `supportCenter`：售后工单提交与历史记录
- `messageCenter`：消息列表与一键已读
- `pointLedger`：积分流水与积分规则弹窗
- `indexPaysuccess`：支付成功页

## 关键数据流
1. 首页搜索/推荐 -> 点餐页：通过 `menuSearchKeyword` / `menuTargetDish`
2. 点餐页 -> 结算页：通过 `dishData` 传递购物车快照
3. 结算提交 -> 支付 -> 后厨：`checkout.submit` -> `payment.payOrder` -> `kitchen.push`
4. 订单详情跳转：使用 `orderNo`（同时写入 `lastOrderNo` 兜底）

## 本地降级策略
当 `uniCloud.importObject` 不可用时，服务层统一降级到本地：
- 菜品：`common/menu.js`
- 购物车/订单/消息/工单/评价：本地 `storage` mock
- 支付：弹窗确认模拟成功

这保证了在“未部署云端”阶段依然可以完整演示主要业务流程。

## 常用本地缓存键
- `subCurrent`：堂食/外卖模式
- `tableNo`、`tableInfo`、`peopleCount`：桌台信息
- `menuSearchKeyword`、`menuTargetDish`：首页联动点餐页
- `cartSessionId`、`menuCartData`、`menuCartDataRemoteShadow`：购物车
- `dishData`：结算入参
- `checkoutProfile`：结算表单回填
- `memberProfile`、`memberToken`、`authSession`：会员与登录态
- `lastOrderNo`：最近一次订单号

## 目录结构（核心）
```text
.
├─ pages/                     # 主包页面
├─ subPack/                   # 分包页面（结算/评价/客服/消息/积分）
├─ common/
│  ├─ menu.js                # 菜品本地数据
│  └─ services/              # 前端服务层（云端优先 + 本地降级）
├─ uniCloud-aliyun/
│  ├─ cloudfunctions/        # 云对象
│  └─ database/              # schema
├─ static/                    # 静态资源
├─ docs/                      # 联调测试清单
└─ scripts/sync-weapp-config.js
```

## 运行方式

### HBuilderX（推荐）
1. 用 HBuilderX 打开项目根目录
2. 检查 `manifest.json` 中 `mp-weixin.appid`
3. 运行到微信开发者工具或真机

### 配置同步脚本
项目提供了 AppID 同步脚本：
```bash
node scripts/sync-weapp-config.js
```
作用：
- 同步 `app.config.js` 到 `manifest.json`、`project.config.json`
- 同步共享配置到 `uniCloud-aliyun/cloudfunctions/auth/shared` 与 `zhuohao/shared`

### 关于 npm
当前仓库只有 `package-lock.json`，没有 `package.json`。  
如果你要走 CLI 构建，请先在 HBuilderX 中创建 `package.json` 或手动补齐脚本。

## 云端部署建议
1. 先导入 `uniCloud-aliyun/database` 下 schema
2. 上传并部署业务云对象（至少：`dish/cart/checkout/order/member/coupon/table/queue/delivery`，支付侧部署 `uni-pay-co`）
3. 配置支付前确认 `uni-pay-co` 与微信商户参数完整
4. 联调时优先跑通 `docs/cart-checkout-tests.md` 与 `docs/order-payment-tests.md`

## 注意事项
- `app.config.js` 与 `shared/app.config.js` 涉及敏感配置，生产环境建议改为环境变量注入，不要明文提交。
- `unpackage/` 为编译产物，不应入库（已在 `.gitignore` 中忽略）。
- 文档以当前代码为准；新增页面/服务后请同步更新本 README。
