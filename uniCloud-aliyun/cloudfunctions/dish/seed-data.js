'use strict'

const categories = [{
	_id: 'cat_sichuan',
	name: '川味麻辣风',
	icon: 'https://mp-a83aee34-7c6d-40e3-a241-85ab45b7ff6e.cdn.bspapp.com/cloudstorage/static/menu/menutab/cwmlf.png',
	sort: 10,
	status: 1,
	restaurant_scope: 'default'
}, {
	_id: 'cat_home',
	name: '家常小炒',
	icon: 'https://mp-a83aee34-7c6d-40e3-a241-85ab45b7ff6e.cdn.bspapp.com/cloudstorage/static/menu/menutab/jcxc.png',
	sort: 20,
	status: 1,
	restaurant_scope: 'default'
}, {
	_id: 'cat_veggie',
	name: '时蔬素菜',
	icon: 'https://mp-a83aee34-7c6d-40e3-a241-85ab45b7ff6e.cdn.bspapp.com/cloudstorage/static/menu/menutab/sssc.png',
	sort: 30,
	status: 1,
	restaurant_scope: 'default'
}, {
	_id: 'cat_soup',
	name: '汤品·主食',
	icon: 'https://mp-a83aee34-7c6d-40e3-a241-85ab45b7ff6e.cdn.bspapp.com/cloudstorage/static/menu/menutab/tpzs.png',
	sort: 40,
	status: 1,
	restaurant_scope: 'default'
}]

const dishes = [{
	_id: 'dish_gbyd',
	name: '干煸芸豆',
	category_id: 'cat_sichuan',
	cover: 'https://mp-a83aee34-7c6d-40e3-a241-85ab45b7ff6e.cdn.bspapp.com/cloudstorage/static/menu/menulist/gbyd.png',
	description: '芸豆入味爽脆，辅以藤椒与蒜末，香辣开胃。',
	tags: ['hot', 'spicy'],
	recommend_weight: 95,
	status: 1,
	restaurant_scope: 'default',
	skus: [{
		sku_id: 'sku_gbyd_std',
		name: '标准份',
		price: 16,
		origin_price: 18,
		package_fee: 1,
		stock: 200,
		min_purchase: 1,
		max_purchase: 5
	}],
	option_groups: [{
		group_id: 'opt_spicy_level',
		name: '辣度',
		type: 'single',
		required: true,
		options: [{
			option_id: 'spicy_low',
			name: '微辣',
			price: 0
		}, {
			option_id: 'spicy_medium',
			name: '中辣',
			price: 0
		}, {
			option_id: 'spicy_high',
			name: '重辣',
			price: 0
		}]
	}, {
		group_id: 'opt_addon',
		name: '加料',
		type: 'multi',
		required: false,
		options: [{
			option_id: 'addon_peanut',
			name: '花生碎',
			price: 2
		}, {
			option_id: 'addon_garlic',
			name: '蒜蓉加倍',
			price: 1
		}]
	}],
	keywords: ['干煸', '芸豆', '川菜']
}, {
	_id: 'dish_mp_tofo',
	name: '麻婆豆腐',
	category_id: 'cat_sichuan',
	cover: 'https://mp-a83aee34-7c6d-40e3-a241-85ab45b7ff6e.cdn.bspapp.com/cloudstorage/static/menu/menulist/mpdf.png',
	description: '经典川味口碑菜，豆腐嫩滑，麻辣下饭。',
	tags: ['hot', 'recommend'],
	recommend_weight: 90,
	status: 1,
	restaurant_scope: 'default',
	skus: [{
		sku_id: 'sku_mpdf_std',
		name: '标准份',
		price: 12,
		origin_price: 12,
		package_fee: 1,
		stock: 300,
		min_purchase: 1,
		max_purchase: 5
	}],
	option_groups: [{
		group_id: 'opt_peppercorn',
		name: '花椒增香',
		type: 'single',
		required: false,
		options: [{
			option_id: 'peppercorn_normal',
			name: '标准',
			price: 0
		}, {
			option_id: 'peppercorn_extra',
			name: '加倍花椒',
			price: 1
		}]
	}],
	keywords: ['麻婆豆腐', '豆腐']
}, {
	_id: 'dish_yxrs',
	name: '鱼香肉丝',
	category_id: 'cat_home',
	cover: 'https://mp-a83aee34-7c6d-40e3-a241-85ab45b7ff6e.cdn.bspapp.com/cloudstorage/static/menu/menulist/yxrs.png',
	description: '精选猪里脊丝，酸甜适口，家常必点。',
	tags: ['recommend'],
	recommend_weight: 85,
	status: 1,
	restaurant_scope: 'default',
	skus: [{
		sku_id: 'sku_yxrs_small',
		name: '小份 (约250g)',
		price: 20,
		origin_price: 22,
		package_fee: 1,
		stock: 150,
		min_purchase: 1,
		max_purchase: 5
	}, {
		sku_id: 'sku_yxrs_large',
		name: '大份 (约400g)',
		price: 32,
		origin_price: 35,
		package_fee: 2,
		stock: 120,
		min_purchase: 1,
		max_purchase: 3
	}],
	option_groups: [{
		group_id: 'opt_vinegar',
		name: '酸度',
		type: 'single',
		required: true,
		options: [{
			option_id: 'vinegar_low',
			name: '少醋',
			price: 0
		}, {
			option_id: 'vinegar_std',
			name: '标准',
			price: 0
		}, {
			option_id: 'vinegar_extra',
			name: '多醋',
			price: 0
		}]
	}],
	keywords: ['鱼香肉丝', '肉丝', '家常']
}, {
	_id: 'dish_tclj',
	name: '糖醋里脊',
	category_id: 'cat_home',
	cover: 'https://mp-a83aee34-7c6d-40e3-a241-85ab45b7ff6e.cdn.bspapp.com/cloudstorage/static/menu/menulist/tclj.png',
	description: '酸甜酥脆口感双重，儿童最爱。',
	tags: ['hot', 'new'],
	recommend_weight: 70,
	status: 1,
	restaurant_scope: 'default',
	skus: [{
		sku_id: 'sku_tclj_small',
		name: '小份',
		price: 28,
		origin_price: 28,
		package_fee: 1.5,
		stock: 160,
		min_purchase: 1,
		max_purchase: 5
	}, {
		sku_id: 'sku_tclj_large',
		name: '大份',
		price: 42,
		origin_price: 45,
		package_fee: 2,
		stock: 90,
		min_purchase: 1,
		max_purchase: 3
	}],
	option_groups: [{
		group_id: 'opt_sesame',
		name: '淋酱配料',
		type: 'multi',
		required: false,
		options: [{
			option_id: 'sesame_white',
			name: '白芝麻',
			price: 1
		}, {
			option_id: 'sesame_black',
			name: '黑芝麻',
			price: 1
		}]
	}],
	keywords: ['糖醋里脊', '里脊']
}, {
	_id: 'dish_xhscjd',
	name: '西红柿炒鸡蛋',
	category_id: 'cat_veggie',
	cover: 'https://mp-a83aee34-7c6d-40e3-a241-85ab45b7ff6e.cdn.bspapp.com/cloudstorage/static/menu/menulist/xhscjd.png',
	description: '番茄酸甜浓郁，鸡蛋滑嫩，营养搭配。',
	tags: ['new', 'light'],
	recommend_weight: 60,
	status: 1,
	restaurant_scope: 'default',
	skus: [{
		sku_id: 'sku_xhscjd_std',
		name: '标准份',
		price: 14,
		origin_price: 14,
		package_fee: 1,
		stock: 200,
		min_purchase: 1,
		max_purchase: 5
	}],
	option_groups: [],
	keywords: ['西红柿', '鸡蛋']
}, {
	_id: 'dish_mf',
	name: '米饭',
	category_id: 'cat_soup',
	cover: 'https://mp-a83aee34-7c6d-40e3-a241-85ab45b7ff6e.cdn.bspapp.com/cloudstorage/static/menu/menulist/mf.png',
	description: '现蒸东北大米，颗颗饱满。',
	tags: ['staple'],
	recommend_weight: 30,
	status: 1,
	restaurant_scope: 'default',
	skus: [{
		sku_id: 'sku_mf_single',
		name: '单人份',
		price: 2.5,
		origin_price: 2.5,
		package_fee: 0,
		stock: 500,
		min_purchase: 1,
		max_purchase: 10
	}],
	option_groups: [],
	keywords: ['米饭', '主食']
}]

module.exports = {
	categories,
	dishes
}
