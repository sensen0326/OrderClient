// 接口鉴权配置。由 security.js 控制是否启用权限校验
const { enableUniPayAuth } = require('./security')

const strictPermission = {
	refund: {
		// auth: true // 启用角色/权限控制时可省略，框架会自动要求已登录用户
		role: ['admin'] // 仅后台管理员可发起退款
		// permission: [] // 如需基于权限点控制可在此补充
	}
}

module.exports = enableUniPayAuth ? strictPermission : {}
