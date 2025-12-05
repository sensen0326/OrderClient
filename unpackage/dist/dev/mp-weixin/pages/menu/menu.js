(global["webpackJsonp"] = global["webpackJsonp"] || []).push([["pages/menu/menu"],{

/***/ 82:
/*!***************************************************************************!*\
  !*** D:/code/HBworkspace/点餐小程序用户端/main.js?{"page":"pages%2Fmenu%2Fmenu"} ***!
  \***************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(wx, createPage) {

var _interopRequireDefault = __webpack_require__(/*! @babel/runtime/helpers/interopRequireDefault */ 4);
__webpack_require__(/*! uni-pages */ 26);
__webpack_require__(/*! @dcloudio/vue-cli-plugin-uni/packages/uni-cloud/dist/index.js */ 27);
var _vue = _interopRequireDefault(__webpack_require__(/*! vue */ 25));
var _menu = _interopRequireDefault(__webpack_require__(/*! ./pages/menu/menu.vue */ 83));
// @ts-ignore
wx.__webpack_require_UNI_MP_PLUGIN__ = __webpack_require__;
createPage(_menu.default);
/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! ./node_modules/@dcloudio/uni-mp-weixin/dist/wx.js */ 1)["default"], __webpack_require__(/*! ./node_modules/@dcloudio/uni-mp-weixin/dist/index.js */ 2)["createPage"]))

/***/ }),

/***/ 83:
/*!********************************************************!*\
  !*** D:/code/HBworkspace/点餐小程序用户端/pages/menu/menu.vue ***!
  \********************************************************/
/*! no static exports found */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _menu_vue_vue_type_template_id_368aef34_scoped_true___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./menu.vue?vue&type=template&id=368aef34&scoped=true& */ 84);
/* harmony import */ var _menu_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./menu.vue?vue&type=script&lang=js& */ 86);
/* harmony reexport (unknown) */ for(var __WEBPACK_IMPORT_KEY__ in _menu_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_1__) if(["default"].indexOf(__WEBPACK_IMPORT_KEY__) < 0) (function(key) { __webpack_require__.d(__webpack_exports__, key, function() { return _menu_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_1__[key]; }) }(__WEBPACK_IMPORT_KEY__));
/* harmony import */ var _menu_vue_vue_type_style_index_0_id_368aef34_lang_scss_scoped_true___WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./menu.vue?vue&type=style&index=0&id=368aef34&lang=scss&scoped=true& */ 89);
/* harmony import */ var _soft_HBuilderX_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_runtime_componentNormalizer_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../../../../soft/HBuilderX/HBuilderX/plugins/uniapp-cli/node_modules/@dcloudio/vue-cli-plugin-uni/packages/vue-loader/lib/runtime/componentNormalizer.js */ 44);

var renderjs





/* normalize component */

var component = Object(_soft_HBuilderX_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_runtime_componentNormalizer_js__WEBPACK_IMPORTED_MODULE_3__["default"])(
  _menu_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_1__["default"],
  _menu_vue_vue_type_template_id_368aef34_scoped_true___WEBPACK_IMPORTED_MODULE_0__["render"],
  _menu_vue_vue_type_template_id_368aef34_scoped_true___WEBPACK_IMPORTED_MODULE_0__["staticRenderFns"],
  false,
  null,
  "368aef34",
  null,
  false,
  _menu_vue_vue_type_template_id_368aef34_scoped_true___WEBPACK_IMPORTED_MODULE_0__["components"],
  renderjs
)

component.options.__file = "pages/menu/menu.vue"
/* harmony default export */ __webpack_exports__["default"] = (component.exports);

/***/ }),

/***/ 84:
/*!***************************************************************************************************!*\
  !*** D:/code/HBworkspace/点餐小程序用户端/pages/menu/menu.vue?vue&type=template&id=368aef34&scoped=true& ***!
  \***************************************************************************************************/
/*! exports provided: render, staticRenderFns, recyclableRender, components */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _soft_HBuilderX_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_soft_HBuilderX_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_17_0_soft_HBuilderX_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_template_js_soft_HBuilderX_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_uni_app_loader_page_meta_js_soft_HBuilderX_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_soft_HBuilderX_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_menu_vue_vue_type_template_id_368aef34_scoped_true___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! -!../../../../../soft/HBuilderX/HBuilderX/plugins/uniapp-cli/node_modules/@dcloudio/vue-cli-plugin-uni/packages/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!../../../../../soft/HBuilderX/HBuilderX/plugins/uniapp-cli/node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader??ref--17-0!../../../../../soft/HBuilderX/HBuilderX/plugins/uniapp-cli/node_modules/@dcloudio/webpack-uni-mp-loader/lib/template.js!../../../../../soft/HBuilderX/HBuilderX/plugins/uniapp-cli/node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-uni-app-loader/page-meta.js!../../../../../soft/HBuilderX/HBuilderX/plugins/uniapp-cli/node_modules/@dcloudio/vue-cli-plugin-uni/packages/vue-loader/lib??vue-loader-options!../../../../../soft/HBuilderX/HBuilderX/plugins/uniapp-cli/node_modules/@dcloudio/webpack-uni-mp-loader/lib/style.js!./menu.vue?vue&type=template&id=368aef34&scoped=true& */ 85);
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "render", function() { return _soft_HBuilderX_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_soft_HBuilderX_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_17_0_soft_HBuilderX_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_template_js_soft_HBuilderX_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_uni_app_loader_page_meta_js_soft_HBuilderX_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_soft_HBuilderX_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_menu_vue_vue_type_template_id_368aef34_scoped_true___WEBPACK_IMPORTED_MODULE_0__["render"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "staticRenderFns", function() { return _soft_HBuilderX_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_soft_HBuilderX_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_17_0_soft_HBuilderX_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_template_js_soft_HBuilderX_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_uni_app_loader_page_meta_js_soft_HBuilderX_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_soft_HBuilderX_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_menu_vue_vue_type_template_id_368aef34_scoped_true___WEBPACK_IMPORTED_MODULE_0__["staticRenderFns"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "recyclableRender", function() { return _soft_HBuilderX_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_soft_HBuilderX_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_17_0_soft_HBuilderX_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_template_js_soft_HBuilderX_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_uni_app_loader_page_meta_js_soft_HBuilderX_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_soft_HBuilderX_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_menu_vue_vue_type_template_id_368aef34_scoped_true___WEBPACK_IMPORTED_MODULE_0__["recyclableRender"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "components", function() { return _soft_HBuilderX_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_soft_HBuilderX_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_17_0_soft_HBuilderX_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_template_js_soft_HBuilderX_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_uni_app_loader_page_meta_js_soft_HBuilderX_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_soft_HBuilderX_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_menu_vue_vue_type_template_id_368aef34_scoped_true___WEBPACK_IMPORTED_MODULE_0__["components"]; });



/***/ }),

/***/ 85:
/*!***************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/@dcloudio/vue-cli-plugin-uni/packages/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader??ref--17-0!./node_modules/@dcloudio/webpack-uni-mp-loader/lib/template.js!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-uni-app-loader/page-meta.js!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/vue-loader/lib??vue-loader-options!./node_modules/@dcloudio/webpack-uni-mp-loader/lib/style.js!D:/code/HBworkspace/点餐小程序用户端/pages/menu/menu.vue?vue&type=template&id=368aef34&scoped=true& ***!
  \***************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/*! exports provided: render, staticRenderFns, recyclableRender, components */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "render", function() { return render; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "staticRenderFns", function() { return staticRenderFns; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "recyclableRender", function() { return recyclableRender; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "components", function() { return components; });
var components
try {
  components = {
    uSubsection: function () {
      return __webpack_require__.e(/*! import() | node-modules/uview-ui/components/u-subsection/u-subsection */ "node-modules/uview-ui/components/u-subsection/u-subsection").then(__webpack_require__.bind(null, /*! uview-ui/components/u-subsection/u-subsection.vue */ 187))
    },
    uIcon: function () {
      return __webpack_require__.e(/*! import() | node-modules/uview-ui/components/u-icon/u-icon */ "node-modules/uview-ui/components/u-icon/u-icon").then(__webpack_require__.bind(null, /*! uview-ui/components/u-icon/u-icon.vue */ 138))
    },
    uImage: function () {
      return __webpack_require__.e(/*! import() | node-modules/uview-ui/components/u-image/u-image */ "node-modules/uview-ui/components/u-image/u-image").then(__webpack_require__.bind(null, /*! uview-ui/components/u-image/u-image.vue */ 159))
    },
    uGap: function () {
      return __webpack_require__.e(/*! import() | node-modules/uview-ui/components/u-gap/u-gap */ "node-modules/uview-ui/components/u-gap/u-gap").then(__webpack_require__.bind(null, /*! uview-ui/components/u-gap/u-gap.vue */ 166))
    },
    uButton: function () {
      return __webpack_require__.e(/*! import() | node-modules/uview-ui/components/u-button/u-button */ "node-modules/uview-ui/components/u-button/u-button").then(__webpack_require__.bind(null, /*! uview-ui/components/u-button/u-button.vue */ 180))
    },
    uTag: function () {
      return __webpack_require__.e(/*! import() | node-modules/uview-ui/components/u-tag/u-tag */ "node-modules/uview-ui/components/u-tag/u-tag").then(__webpack_require__.bind(null, /*! uview-ui/components/u-tag/u-tag.vue */ 194))
    },
    uNumberBox: function () {
      return __webpack_require__.e(/*! import() | node-modules/uview-ui/components/u-number-box/u-number-box */ "node-modules/uview-ui/components/u-number-box/u-number-box").then(__webpack_require__.bind(null, /*! uview-ui/components/u-number-box/u-number-box.vue */ 201))
    },
    uBadge: function () {
      return __webpack_require__.e(/*! import() | node-modules/uview-ui/components/u-badge/u-badge */ "node-modules/uview-ui/components/u-badge/u-badge").then(__webpack_require__.bind(null, /*! uview-ui/components/u-badge/u-badge.vue */ 208))
    },
    uPopup: function () {
      return __webpack_require__.e(/*! import() | node-modules/uview-ui/components/u-popup/u-popup */ "node-modules/uview-ui/components/u-popup/u-popup").then(__webpack_require__.bind(null, /*! uview-ui/components/u-popup/u-popup.vue */ 173))
    },
  }
} catch (e) {
  if (
    e.message.indexOf("Cannot find module") !== -1 &&
    e.message.indexOf(".vue") !== -1
  ) {
    console.error(e.message)
    console.error("1. 排查组件名称拼写是否正确")
    console.error(
      "2. 排查组件是否符合 easycom 规范，文档：https://uniapp.dcloud.net.cn/collocation/pages?id=easycom"
    )
    console.error(
      "3. 若组件不符合 easycom 规范，需手动引入，并在 components 中注册该组件"
    )
  } else {
    throw e
  }
}
var render = function () {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  var g0 = _vm.recommendList.length
  var l0 = g0
    ? _vm.__map(_vm.recommendList, function (item, __i1__) {
        var $orig = _vm.__get_orig(item)
        var m0 = _vm.formatPrice(_vm.getFirstSkuPrice(item))
        return {
          $orig: $orig,
          m0: m0,
        }
      })
    : null
  var g1 = _vm.loading && !_vm.currentDishList.length
  var g2 = !g1 && !_vm.errorMsg ? _vm.currentDishList.length : null
  var l1 =
    !g1 && !_vm.errorMsg && !!g2
      ? _vm.__map(_vm.currentDishList, function (dish, __i2__) {
          var $orig = _vm.__get_orig(dish)
          var m1 = _vm.formatPrice(_vm.getFirstSkuPrice(dish))
          var m2 = _vm.canUseQuickNumber(dish)
          var m3 = m2 ? _vm.getDishQuickQuantity(dish) : null
          return {
            $orig: $orig,
            m1: m1,
            m2: m2,
            m3: m3,
          }
        })
      : null
  var g3 = Math.abs(_vm.menuPrice)
  var g4 = !(g3 === 0) ? _vm.menuPrice.toFixed(2) : null
  var m4 = _vm.formatPrice(_vm.specSelectedSkuPrice)
  var l2 = _vm.__map(_vm.specPopupSkus, function (sku, skuIndex) {
    var $orig = _vm.__get_orig(sku)
    var m5 = _vm.formatPrice(sku.price)
    return {
      $orig: $orig,
      m5: m5,
    }
  })
  var l4 = _vm.__map(_vm.specPopupOptionGroups, function (group, groupIndex) {
    var $orig = _vm.__get_orig(group)
    var l3 = _vm.__map(group.options, function (option, optionIndex) {
      var $orig = _vm.__get_orig(option)
      var m6 = _vm.isOptionSelected(group, option.option_id)
      var m7 = option.price ? _vm.formatPrice(option.price) : null
      return {
        $orig: $orig,
        m6: m6,
        m7: m7,
      }
    })
    return {
      $orig: $orig,
      l3: l3,
    }
  })
  var g5 = !_vm.searchLoading ? _vm.searchResults.length : null
  var l5 =
    !_vm.searchLoading && !!g5
      ? _vm.__map(_vm.searchResults, function (item, index) {
          var $orig = _vm.__get_orig(item)
          var m8 = _vm.formatPrice(_vm.getFirstSkuPrice(item))
          return {
            $orig: $orig,
            m8: m8,
          }
        })
      : null
  _vm.$mp.data = Object.assign(
    {},
    {
      $root: {
        g0: g0,
        l0: l0,
        g1: g1,
        g2: g2,
        l1: l1,
        g3: g3,
        g4: g4,
        m4: m4,
        l2: l2,
        l4: l4,
        g5: g5,
        l5: l5,
      },
    }
  )
}
var recyclableRender = false
var staticRenderFns = []
render._withStripped = true



/***/ }),

/***/ 86:
/*!*********************************************************************************!*\
  !*** D:/code/HBworkspace/点餐小程序用户端/pages/menu/menu.vue?vue&type=script&lang=js& ***!
  \*********************************************************************************/
/*! no static exports found */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _soft_HBuilderX_HBuilderX_plugins_uniapp_cli_node_modules_babel_loader_lib_index_js_soft_HBuilderX_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_13_1_soft_HBuilderX_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_script_js_soft_HBuilderX_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_soft_HBuilderX_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_menu_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! -!../../../../../soft/HBuilderX/HBuilderX/plugins/uniapp-cli/node_modules/babel-loader/lib!../../../../../soft/HBuilderX/HBuilderX/plugins/uniapp-cli/node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader??ref--13-1!../../../../../soft/HBuilderX/HBuilderX/plugins/uniapp-cli/node_modules/@dcloudio/webpack-uni-mp-loader/lib/script.js!../../../../../soft/HBuilderX/HBuilderX/plugins/uniapp-cli/node_modules/@dcloudio/vue-cli-plugin-uni/packages/vue-loader/lib??vue-loader-options!../../../../../soft/HBuilderX/HBuilderX/plugins/uniapp-cli/node_modules/@dcloudio/webpack-uni-mp-loader/lib/style.js!./menu.vue?vue&type=script&lang=js& */ 87);
/* harmony import */ var _soft_HBuilderX_HBuilderX_plugins_uniapp_cli_node_modules_babel_loader_lib_index_js_soft_HBuilderX_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_13_1_soft_HBuilderX_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_script_js_soft_HBuilderX_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_soft_HBuilderX_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_menu_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_soft_HBuilderX_HBuilderX_plugins_uniapp_cli_node_modules_babel_loader_lib_index_js_soft_HBuilderX_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_13_1_soft_HBuilderX_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_script_js_soft_HBuilderX_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_soft_HBuilderX_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_menu_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_0__);
/* harmony reexport (unknown) */ for(var __WEBPACK_IMPORT_KEY__ in _soft_HBuilderX_HBuilderX_plugins_uniapp_cli_node_modules_babel_loader_lib_index_js_soft_HBuilderX_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_13_1_soft_HBuilderX_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_script_js_soft_HBuilderX_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_soft_HBuilderX_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_menu_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_0__) if(["default"].indexOf(__WEBPACK_IMPORT_KEY__) < 0) (function(key) { __webpack_require__.d(__webpack_exports__, key, function() { return _soft_HBuilderX_HBuilderX_plugins_uniapp_cli_node_modules_babel_loader_lib_index_js_soft_HBuilderX_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_13_1_soft_HBuilderX_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_script_js_soft_HBuilderX_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_soft_HBuilderX_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_menu_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_0__[key]; }) }(__WEBPACK_IMPORT_KEY__));
 /* harmony default export */ __webpack_exports__["default"] = (_soft_HBuilderX_HBuilderX_plugins_uniapp_cli_node_modules_babel_loader_lib_index_js_soft_HBuilderX_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_13_1_soft_HBuilderX_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_script_js_soft_HBuilderX_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_soft_HBuilderX_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_menu_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_0___default.a); 

/***/ }),

/***/ 87:
/*!****************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/babel-loader/lib!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader??ref--13-1!./node_modules/@dcloudio/webpack-uni-mp-loader/lib/script.js!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/vue-loader/lib??vue-loader-options!./node_modules/@dcloudio/webpack-uni-mp-loader/lib/style.js!D:/code/HBworkspace/点餐小程序用户端/pages/menu/menu.vue?vue&type=script&lang=js& ***!
  \****************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(uni) {

var _interopRequireDefault = __webpack_require__(/*! @babel/runtime/helpers/interopRequireDefault */ 4);
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _regenerator = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/regenerator */ 28));
var _typeof2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/typeof */ 13));
var _toConsumableArray2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/toConsumableArray */ 18));
var _defineProperty2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/defineProperty */ 11));
var _asyncToGenerator2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/asyncToGenerator */ 31));
var _dish = _interopRequireDefault(__webpack_require__(/*! @/common/services/dish.js */ 78));
var _cart = _interopRequireDefault(__webpack_require__(/*! @/common/services/cart.js */ 88));
function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }
function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { (0, _defineProperty2.default)(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }
var _default = {
  data: function data() {
    return {
      PopupShow: false,
      categories: [],
      dishesByCategory: {},
      restaurantId: 'default',
      restaurantName: '私房菜（万达广场店）',
      tableInfo: null,
      scrollTop: 0,
      current: 0,
      menuHeight: 0,
      menuItemHeight: 0,
      cartMap: {},
      cartSessionId: '',
      cartSyncTimer: null,
      cartSyncing: false,
      cartSyncFailed: false,
      cartLocalSnapshot: null,
      recommendList: [],
      loading: false,
      errorMsg: '',
      searchKeyword: '',
      searchResults: [],
      searchPopup: false,
      searchLoading: false,
      categoryLoading: '',
      highlightedDishId: '',
      sortFilters: [{
        key: 'hot',
        label: '热销',
        active: false
      }, {
        key: 'new',
        label: '新品',
        active: false
      }, {
        key: 'recommend',
        label: '推荐',
        active: false
      }],
      specPopup: {
        show: false,
        dish: null,
        selectedSkuId: '',
        selectedOptions: {},
        quantity: 1
      },
      subList: [{
        name: '堂食'
      }, {
        name: '外卖'
      }],
      subCurrent: 0,
      bannerList: ['https://mp-a83aee34-7c6d-40e3-a241-85ab45b7ff6e.cdn.bspapp.com/cloudstorage/static/menu/banner-1.jpg', 'https://mp-a83aee34-7c6d-40e3-a241-85ab45b7ff6e.cdn.bspapp.com/cloudstorage/static/menu/banner-2.jpg', 'https://mp-a83aee34-7c6d-40e3-a241-85ab45b7ff6e.cdn.bspapp.com/cloudstorage/static/menu/banner-3.jpg']
    };
  },
  computed: {
    tabbar: function tabbar() {
      return this.categories;
    },
    currentCategoryId: function currentCategoryId() {
      var currentCategory = this.categories[this.current] || null;
      return currentCategory && currentCategory._id ? currentCategory._id : '';
    },
    currentCategoryName: function currentCategoryName() {
      var currentCategory = this.categories[this.current] || null;
      return currentCategory && currentCategory.name ? currentCategory.name : '全部菜品';
    },
    currentDishList: function currentDishList() {
      return this.dishesByCategory[this.currentCategoryId] || [];
    },
    cartItems: function cartItems() {
      return Object.values(this.cartMap).filter(function (item) {
        return Number(item.quantity) > 0;
      });
    },
    menuNum: function menuNum() {
      return this.cartItems.reduce(function (sum, item) {
        return sum + Number(item.quantity || 0);
      }, 0);
    },
    menuPrice: function menuPrice() {
      return this.cartItems.reduce(function (sum, item) {
        var qty = Number(item.quantity || 0);
        var unit = Number(item.price || 0);
        return sum + unit * qty;
      }, 0);
    },
    specPopupSkus: function specPopupSkus() {
      var dish = this.specPopup.dish;
      return dish && Array.isArray(dish.skus) ? dish.skus : [];
    },
    specPopupOptionGroups: function specPopupOptionGroups() {
      var dish = this.specPopup.dish;
      return dish && Array.isArray(dish.option_groups) ? dish.option_groups : [];
    },
    specSelectedSku: function specSelectedSku() {
      var _this = this;
      var dish = this.specPopup.dish;
      if (!dish || !Array.isArray(dish.skus) || !dish.skus.length) {
        return null;
      }
      if (this.specPopup.selectedSkuId) {
        var match = dish.skus.find(function (sku) {
          return sku.sku_id === _this.specPopup.selectedSkuId;
        });
        if (match) {
          return match;
        }
      }
      return dish.skus[0];
    },
    specSelectedSkuPrice: function specSelectedSkuPrice() {
      return this.specSelectedSku ? Number(this.specSelectedSku.price || 0) : 0;
    }
  },
  onLoad: function onLoad() {
    var _this2 = this;
    return (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee() {
      return _regenerator.default.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              _context.next = 2;
              return _this2.initCartSession();
            case 2:
              _context.next = 4;
              return _this2.initMenuData();
            case 4:
            case "end":
              return _context.stop();
          }
        }
      }, _callee);
    }))();
  },
  onUnload: function onUnload() {
    if (this.cartSyncTimer) {
      clearTimeout(this.cartSyncTimer);
      this.cartSyncTimer = null;
    }
  },
  onShow: function onShow() {
    this.subCurrent = uni.getStorageSync('subCurrent') || 0;
    var keyword = uni.getStorageSync('menuSearchKeyword');
    if (keyword) {
      uni.removeStorageSync('menuSearchKeyword');
      this.searchKeyword = keyword;
      this.handleSearch(true);
    }
    var targetDish = uni.getStorageSync('menuTargetDish');
    if (targetDish) {
      uni.removeStorageSync('menuTargetDish');
      this.highlightDish(targetDish);
    }
  },
  methods: {
    initCartSession: function initCartSession() {
      var _this3 = this;
      return (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee2() {
        var storedSession, remote, localSnapshot, snapshot;
        return _regenerator.default.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                storedSession = uni.getStorageSync('cartSessionId');
                if (!storedSession) {
                  storedSession = "session_".concat(Date.now(), "_").concat(Math.random().toString(16).slice(2, 8));
                  uni.setStorage({
                    key: 'cartSessionId',
                    data: storedSession
                  });
                }
                _this3.cartSessionId = storedSession;
                _this3.tableInfo = uni.getStorageSync('tableInfo') || {
                  tableNo: 'A01',
                  restaurantName: _this3.restaurantName,
                  distance: '0.2km'
                };
                _this3.restoreCartFromStorage();
                _context2.prev = 5;
                _context2.next = 8;
                return _cart.default.get({
                  sessionId: storedSession
                });
              case 8:
                remote = _context2.sent;
                if (remote && Array.isArray(remote.items) && remote.items.length) {
                  localSnapshot = _this3.cartLocalSnapshot || {
                    updated_at: 0
                  };
                  if (!localSnapshot.updated_at || remote.updated_at > localSnapshot.updated_at) {
                    _this3.applyCartItems(remote.items);
                    snapshot = {
                      sessionId: storedSession,
                      items: remote.items,
                      restaurantId: remote.restaurant_id || _this3.restaurantId,
                      channel: remote.channel || _this3.getCartChannel(),
                      tableNo: remote.table_no || (_this3.tableInfo ? _this3.tableInfo.tableNo : ''),
                      meta: remote.meta || {},
                      updated_at: remote.updated_at || Date.now()
                    };
                    _this3.cartLocalSnapshot = snapshot;
                    uni.setStorage({
                      key: 'menuCartData',
                      data: snapshot
                    });
                  }
                }
                _context2.next = 15;
                break;
              case 12:
                _context2.prev = 12;
                _context2.t0 = _context2["catch"](5);
                console.warn('load remote cart failed', _context2.t0);
              case 15:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, null, [[5, 12]]);
      }))();
    },
    restoreCartFromStorage: function restoreCartFromStorage() {
      var saved = uni.getStorageSync('menuCartData');
      if (!saved || !Array.isArray(saved.items) || !saved.items.length) {
        this.cartLocalSnapshot = {
          items: [],
          updated_at: 0
        };
        return;
      }
      if (saved.sessionId && saved.sessionId !== 'local' && this.cartSessionId && saved.sessionId !== this.cartSessionId) {
        this.cartLocalSnapshot = saved;
        return;
      }
      this.applyCartItems(saved.items);
      this.cartLocalSnapshot = saved;
    },
    applyCartItems: function applyCartItems() {
      var _this4 = this;
      var items = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
      var nextMap = {};
      items.forEach(function (item) {
        if (!item) return;
        var qty = Number(item.quantity);
        if (!qty || qty <= 0) return;
        var optionKey = _this4.buildOptionsKey(item.options || []);
        var key = item.key || _this4.buildCartKey(item.dishId, item.skuId, optionKey);
        nextMap[key] = _objectSpread(_objectSpread({}, item), {}, {
          key: key,
          quantity: qty,
          price: Number(item.price || 0)
        });
      });
      this.cartMap = nextMap;
    },
    getCartChannel: function getCartChannel() {
      return this.subCurrent === 1 ? 'takeout' : 'dine_in';
    },
    buildCartPayload: function buildCartPayload() {
      var items = this.cartItems.filter(function (item) {
        return Number(item.quantity) > 0;
      });
      return {
        sessionId: this.cartSessionId || 'local',
        items: items,
        restaurantId: this.restaurantId,
        channel: this.getCartChannel(),
        tableNo: this.tableInfo && this.tableInfo.tableNo ? this.tableInfo.tableNo : '',
        meta: {
          restaurantName: this.restaurantName
        },
        updated_at: Date.now()
      };
    },
    persistCartLocal: function persistCartLocal() {
      var payload = this.buildCartPayload();
      this.cartLocalSnapshot = payload;
      if (!payload.items.length) {
        uni.removeStorageSync('menuCartData');
      } else {
        uni.setStorage({
          key: 'menuCartData',
          data: payload
        });
      }
    },
    scheduleCartSync: function scheduleCartSync() {
      var _this5 = this;
      if (!this.cartSessionId) return;
      if (this.cartSyncTimer) {
        clearTimeout(this.cartSyncTimer);
      }
      this.cartSyncTimer = setTimeout(function () {
        _this5.syncCartRemote();
      }, 400);
    },
    syncCartRemote: function syncCartRemote() {
      var _this6 = this;
      return (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee3() {
        return _regenerator.default.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                if (_this6.cartSessionId) {
                  _context3.next = 2;
                  break;
                }
                return _context3.abrupt("return");
              case 2:
                _context3.prev = 2;
                _this6.cartSyncing = true;
                _context3.next = 6;
                return _cart.default.sync(_this6.buildCartPayload());
              case 6:
                _this6.cartSyncFailed = false;
                _context3.next = 13;
                break;
              case 9:
                _context3.prev = 9;
                _context3.t0 = _context3["catch"](2);
                _this6.cartSyncFailed = true;
                console.warn('cart sync failed', _context3.t0);
              case 13:
                _context3.prev = 13;
                _this6.cartSyncing = false;
                return _context3.finish(13);
              case 16:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3, null, [[2, 9, 13, 16]]);
      }))();
    },
    handleCartChanged: function handleCartChanged() {
      this.persistCartLocal();
      this.scheduleCartSync();
    },
    initMenuData: function initMenuData() {
      var _this7 = this;
      return (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee4() {
        var categories;
        return _regenerator.default.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                _this7.loading = true;
                _this7.errorMsg = '';
                _context4.prev = 2;
                _context4.next = 5;
                return _dish.default.listCategories({
                  restaurantId: _this7.restaurantId
                });
              case 5:
                categories = _context4.sent;
                _this7.categories = categories;
                if (!categories.length) {
                  _context4.next = 10;
                  break;
                }
                _context4.next = 10;
                return _this7.fetchDishes(categories[0]._id, {
                  force: true
                });
              case 10:
                _this7.fetchRecommend();
                _context4.next = 17;
                break;
              case 13:
                _context4.prev = 13;
                _context4.t0 = _context4["catch"](2);
                console.error('load menu failed', _context4.t0);
                _this7.errorMsg = _context4.t0.message || '菜单加载失败';
              case 17:
                _context4.prev = 17;
                _this7.loading = false;
                return _context4.finish(17);
              case 20:
              case "end":
                return _context4.stop();
            }
          }
        }, _callee4, null, [[2, 13, 17, 20]]);
      }))();
    },
    fetchRecommend: function fetchRecommend() {
      var _this8 = this;
      return (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee5() {
        var res;
        return _regenerator.default.wrap(function _callee5$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
                _context5.prev = 0;
                _context5.next = 3;
                return _dish.default.listRecommend({
                  restaurantId: _this8.restaurantId,
                  limit: 6
                });
              case 3:
                res = _context5.sent;
                _this8.recommendList = res || [];
                _context5.next = 10;
                break;
              case 7:
                _context5.prev = 7;
                _context5.t0 = _context5["catch"](0);
                console.warn('fetch recommend failed', _context5.t0);
              case 10:
              case "end":
                return _context5.stop();
            }
          }
        }, _callee5, null, [[0, 7]]);
      }))();
    },
    fetchDishes: function fetchDishes(categoryId) {
      var _arguments = arguments,
        _this9 = this;
      return (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee6() {
        var _ref, _ref$force, force, activeFilter, params, res;
        return _regenerator.default.wrap(function _callee6$(_context6) {
          while (1) {
            switch (_context6.prev = _context6.next) {
              case 0:
                _ref = _arguments.length > 1 && _arguments[1] !== undefined ? _arguments[1] : {}, _ref$force = _ref.force, force = _ref$force === void 0 ? false : _ref$force;
                if (categoryId) {
                  _context6.next = 3;
                  break;
                }
                return _context6.abrupt("return");
              case 3:
                if (!(!force && _this9.dishesByCategory[categoryId])) {
                  _context6.next = 5;
                  break;
                }
                return _context6.abrupt("return");
              case 5:
                _this9.categoryLoading = categoryId;
                _context6.prev = 6;
                activeFilter = _this9.sortFilters.find(function (item) {
                  return item.active;
                });
                params = {
                  restaurantId: _this9.restaurantId,
                  categoryId: categoryId
                };
                if (activeFilter) {
                  params.tag = activeFilter.key;
                }
                _context6.next = 12;
                return _dish.default.list(params);
              case 12:
                res = _context6.sent;
                _this9.$set(_this9.dishesByCategory, categoryId, res.list || []);
                _context6.next = 20;
                break;
              case 16:
                _context6.prev = 16;
                _context6.t0 = _context6["catch"](6);
                console.error('fetch dishes error', _context6.t0);
                _this9.errorMsg = _context6.t0.message || '菜单加载失败';
              case 20:
                _context6.prev = 20;
                _this9.categoryLoading = '';
                return _context6.finish(20);
              case 23:
              case "end":
                return _context6.stop();
            }
          }
        }, _callee6, null, [[6, 16, 20, 23]]);
      }))();
    },
    getDishQuickQuantity: function getDishQuickQuantity(dish) {
      var sku = this.getFirstSku(dish);
      if (!dish || !sku) return 0;
      var key = this.buildCartKey(dish._id, sku.sku_id, 'none');
      var cartItem = this.cartMap[key];
      return cartItem ? cartItem.quantity : 0;
    },
    canUseQuickNumber: function canUseQuickNumber(dish) {
      if (!dish || !Array.isArray(dish.skus)) return false;
      var hasSingleSku = dish.skus.length === 1;
      var hasOptions = Array.isArray(dish.option_groups) && dish.option_groups.length > 0;
      return hasSingleSku && !hasOptions;
    },
    plusDish: function plusDish(dish) {
      if (!this.canUseQuickNumber(dish)) {
        this.selectSpec(dish);
        return;
      }
      var sku = dish.skus[0];
      this.addToCart({
        dish: dish,
        sku: sku,
        options: [],
        quantity: 1
      });
    },
    minusDish: function minusDish(dish) {
      if (!this.canUseQuickNumber(dish)) {
        return;
      }
      var sku = dish.skus[0];
      var key = this.buildCartKey(dish._id, sku.sku_id, 'none');
      var exist = this.cartMap[key];
      if (exist && exist.quantity > 0) {
        this.updateCartQuantity(key, exist.quantity - 1);
      }
    },
    buildOptionsKey: function buildOptionsKey() {
      var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
      if (!options.length) return 'none';
      var sorted = (0, _toConsumableArray2.default)(options).sort(function (a, b) {
        return (a.optionId || '').localeCompare(b.optionId || '');
      });
      return sorted.map(function (item) {
        return item.optionId;
      }).join('_');
    },
    buildCartKey: function buildCartKey(dishId, skuId, optionsKey) {
      return "".concat(dishId, "__").concat(skuId, "__").concat(optionsKey);
    },
    addToCart: function addToCart(_ref2) {
      var dish = _ref2.dish,
        sku = _ref2.sku,
        _ref2$options = _ref2.options,
        options = _ref2$options === void 0 ? [] : _ref2$options,
        _ref2$quantity = _ref2.quantity,
        quantity = _ref2$quantity === void 0 ? 1 : _ref2$quantity;
      if (!dish || !sku) return;
      var optionKey = this.buildOptionsKey(options);
      var key = this.buildCartKey(dish._id, sku.sku_id, optionKey);
      var unitPrice = Number(sku.price || 0) + options.reduce(function (sum, opt) {
        return sum + Number(opt.price || 0);
      }, 0);
      var exist = this.cartMap[key];
      var prevQuantity = exist ? exist.quantity : 0;
      var nextQuantity = prevQuantity + quantity;
      if (nextQuantity <= 0) {
        this.$delete(this.cartMap, key);
        this.handleCartChanged();
        return;
      }
      var payload = {
        key: key,
        dishId: dish._id,
        dishName: dish.name,
        dishImg: dish.cover,
        skuId: sku.sku_id,
        skuName: sku.name,
        options: options,
        optionsText: options.map(function (opt) {
          return opt.optionName;
        }).join(' + '),
        price: Number(unitPrice.toFixed(2)),
        quantity: nextQuantity,
        desc: dish.description
      };
      this.$set(this.cartMap, key, payload);
      this.handleCartChanged();
    },
    updateCartQuantity: function updateCartQuantity(key, quantity) {
      if (!this.cartMap[key]) return;
      if (quantity <= 0) {
        this.$delete(this.cartMap, key);
        this.handleCartChanged();
        return;
      }
      this.$set(this.cartMap, key, _objectSpread(_objectSpread({}, this.cartMap[key]), {}, {
        quantity: quantity
      }));
      this.handleCartChanged();
    },
    MenuPopup: function MenuPopup() {
      if (this.menuNum > 0) {
        this.PopupShow = true;
      }
    },
    clickEmptyShop: function clickEmptyShop() {
      this.cartMap = {};
      this.PopupShow = false;
      this.handleCartChanged();
      if (this.cartSessionId) {
        _cart.default.clear({
          sessionId: this.cartSessionId
        }).catch(function (err) {
          console.warn('clear remote cart failed', err);
        });
      }
    },
    onConfirmCart: function onConfirmCart() {
      var _this10 = this;
      var nextMap = {};
      Object.keys(this.cartMap).forEach(function (key) {
        var item = _this10.cartMap[key];
        if (item && Number(item.quantity) > 0) {
          nextMap[key] = item;
        }
      });
      this.cartMap = nextMap;
      this.handleCartChanged();
      this.PopupShow = false;
    },
    handleCartNumberChange: function handleCartNumberChange(item, value) {
      var realVal = (0, _typeof2.default)(value) === 'object' && value !== null ? value.value : value;
      var next = Number(realVal);
      if (Number.isNaN(next)) return;
      var optionsKey = this.buildOptionsKey(item.options || []);
      var targetKey = item.key || this.buildCartKey(item.dishId, item.skuId, optionsKey);
      var currentItem = targetKey ? this.cartMap[targetKey] : null;
      if (next <= 0) {
        if (targetKey) {
          this.$delete(this.cartMap, targetKey);
          this.handleCartChanged();
        }
        return;
      }
      if (currentItem && Number(currentItem.quantity) === next) {
        return;
      }
      if (!targetKey || !currentItem) {
        // fallback：若异常缺少 key，重新构造条目
        var payload = {
          key: targetKey,
          dishId: item.dishId,
          dishName: item.dishName,
          dishImg: item.dishImg,
          skuId: item.skuId,
          skuName: item.skuName,
          options: item.options || [],
          optionsText: item.optionsText || '',
          price: Number(item.price || 0),
          quantity: next,
          desc: item.desc || ''
        };
        this.$set(this.cartMap, targetKey || this.buildCartKey(item.dishId, item.skuId, optionsKey || 'none'), payload);
        this.handleCartChanged();
        return;
      }
      this.updateCartQuantity(targetKey, next);
    },
    handleCartStep: function handleCartStep(item, delta) {
      if (!item || !delta) return;
      var nextVal = Math.max(0, Number(item.quantity || 0) + Number(delta));
      this.handleCartNumberChange(item, nextVal);
    },
    settlement: function settlement() {
      var _this11 = this;
      if (!this.menuNum || !this.menuPrice) {
        return;
      }
      var orderItems = this.cartItems.map(function (item) {
        return {
          id: item.key,
          dishId: item.dishId,
          name: item.dishName,
          desc: item.desc,
          icon: item.dishImg,
          skuName: item.skuName,
          optionsText: item.optionsText,
          price: item.price,
          value: item.quantity
        };
      });
      var payload = {
        order: orderItems,
        menuPrice: this.menuPrice,
        menuNum: this.menuNum,
        channel: this.getCartChannel(),
        tableInfo: this.tableInfo,
        sessionId: this.cartSessionId,
        restaurantName: this.restaurantName
      };
      uni.setStorage({
        key: 'dishData',
        data: payload,
        success: function success() {
          uni.navigateTo({
            url: "/subPack/index/indexSettlement?subCurrent=".concat(_this11.subCurrent)
          });
        }
      });
    },
    subChange: function subChange(param) {
      this.subCurrent = param;
      uni.setStorageSync('subCurrent', param);
    },
    swichMenu: function swichMenu(index) {
      var _this12 = this;
      return (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee7() {
        var category;
        return _regenerator.default.wrap(function _callee7$(_context7) {
          while (1) {
            switch (_context7.prev = _context7.next) {
              case 0:
                if (!(index === _this12.current)) {
                  _context7.next = 2;
                  break;
                }
                return _context7.abrupt("return");
              case 2:
                _this12.current = index;
                if (!(_this12.menuHeight === 0 || _this12.menuItemHeight === 0)) {
                  _context7.next = 8;
                  break;
                }
                _context7.next = 6;
                return _this12.getElRect('menu-scroll-view', 'menuHeight');
              case 6:
                _context7.next = 8;
                return _this12.getElRect('u-tab-item', 'menuItemHeight');
              case 8:
                _this12.scrollTop = index * _this12.menuItemHeight + _this12.menuItemHeight / 2 - _this12.menuHeight / 2;
                category = _this12.categories[index];
                if (category) {
                  _this12.fetchDishes(category._id);
                }
              case 11:
              case "end":
                return _context7.stop();
            }
          }
        }, _callee7);
      }))();
    },
    getElRect: function getElRect(elClass, dataVal) {
      var _this13 = this;
      return new Promise(function (resolve) {
        var query = uni.createSelectorQuery().in(_this13);
        query.select('.' + elClass).fields({
          size: true
        }, function (res) {
          if (!res) {
            setTimeout(function () {
              _this13.getElRect(elClass, dataVal);
            }, 10);
            return;
          }
          _this13[dataVal] = res.height;
          resolve();
        }).exec();
      });
    },
    handleFilterSelect: function handleFilterSelect(key) {
      this.sortFilters = this.sortFilters.map(function (item) {
        return _objectSpread(_objectSpread({}, item), {}, {
          active: item.key === key ? !item.active : false
        });
      });
      if (this.currentCategoryId) {
        this.fetchDishes(this.currentCategoryId, {
          force: true
        });
      }
    },
    handleSearch: function handleSearch() {
      var _arguments2 = arguments,
        _this14 = this;
      return (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee8() {
        var fromStorage, keyword, res;
        return _regenerator.default.wrap(function _callee8$(_context8) {
          while (1) {
            switch (_context8.prev = _context8.next) {
              case 0:
                fromStorage = _arguments2.length > 0 && _arguments2[0] !== undefined ? _arguments2[0] : false;
                keyword = (_this14.searchKeyword || '').trim();
                if (keyword) {
                  _context8.next = 6;
                  break;
                }
                _this14.searchPopup = false;
                _this14.searchResults = [];
                return _context8.abrupt("return");
              case 6:
                _this14.searchPopup = true;
                _this14.searchLoading = true;
                _context8.prev = 8;
                _context8.next = 11;
                return _dish.default.search({
                  keyword: keyword,
                  restaurantId: _this14.restaurantId
                });
              case 11:
                res = _context8.sent;
                _this14.searchResults = res.list || [];
                if (!fromStorage && !_this14.searchResults.length) {
                  _this14.$u.toast('没有搜索到相关菜品');
                }
                _context8.next = 20;
                break;
              case 16:
                _context8.prev = 16;
                _context8.t0 = _context8["catch"](8);
                console.error('search error', _context8.t0);
                _this14.$u.toast('搜索失败，请稍后再试');
              case 20:
                _context8.prev = 20;
                _this14.searchLoading = false;
                return _context8.finish(20);
              case 23:
              case "end":
                return _context8.stop();
            }
          }
        }, _callee8, null, [[8, 16, 20, 23]]);
      }))();
    },
    handleSearchInput: function handleSearchInput(e) {
      var value = e && e.detail ? e.detail.value : '';
      this.searchKeyword = value;
    },
    handleSearchResultTap: function handleSearchResultTap(target) {
      var dish = target;
      if (typeof target === 'number') {
        dish = this.searchResults[target];
      }
      this.searchPopup = false;
      if (!dish) return;
      this.selectSpec(dish);
    },
    selectSpec: function selectSpec(dish) {
      if (!dish) return;
      var defaultSkuId = this.getDefaultSkuId(dish);
      this.specPopup = {
        show: true,
        dish: dish,
        selectedSkuId: defaultSkuId,
        selectedOptions: this.initOptionSelections(dish),
        quantity: 1
      };
    },
    initOptionSelections: function initOptionSelections(dish) {
      var result = {};
      (dish.option_groups || []).forEach(function (group) {
        if (group.type === 'multi') {
          result[group.group_id] = [];
        } else {
          result[group.group_id] = group.required && group.options.length ? group.options[0].option_id : '';
        }
      });
      return result;
    },
    handleSkuSelect: function handleSkuSelect(payload) {
      if (typeof payload === 'number') {
        var sku = this.specPopupSkus[payload];
        if (!sku) return;
        this.specPopup.selectedSkuId = sku.sku_id || '';
        return;
      }
      this.specPopup.selectedSkuId = payload;
    },
    isOptionSelected: function isOptionSelected(group, optionId) {
      if (group.type === 'multi') {
        return (this.specPopup.selectedOptions[group.group_id] || []).includes(optionId);
      }
      return this.specPopup.selectedOptions[group.group_id] === optionId;
    },
    handleOptionSelect: function handleOptionSelect(groupRef, optionRef) {
      var group = groupRef;
      var option = optionRef;
      if (typeof groupRef === 'number') {
        group = this.specPopupOptionGroups[groupRef];
      }
      if (typeof optionRef === 'number') {
        var options = group && group.options || [];
        option = options[optionRef];
      }
      if (!group || !option) return;
      var current = this.specPopup.selectedOptions[group.group_id];
      if (group.type === 'multi') {
        var list = Array.isArray(current) ? (0, _toConsumableArray2.default)(current) : [];
        var index = list.indexOf(option.option_id);
        if (index >= 0) {
          list.splice(index, 1);
        } else {
          list.push(option.option_id);
        }
        this.$set(this.specPopup.selectedOptions, group.group_id, list);
      } else {
        this.$set(this.specPopup.selectedOptions, group.group_id, option.option_id);
      }
    },
    getSelectedOptionsList: function getSelectedOptionsList() {
      var _this15 = this;
      var dish = this.specPopup.dish;
      if (!dish) return [];
      var result = [];
      (dish.option_groups || []).forEach(function (group) {
        var selected = _this15.specPopup.selectedOptions[group.group_id];
        if (group.type === 'multi') {
          (selected || []).forEach(function (optionId) {
            var opt = group.options.find(function (o) {
              return o.option_id === optionId;
            });
            if (opt) {
              result.push({
                groupId: group.group_id,
                groupName: group.name,
                optionId: opt.option_id,
                optionName: opt.name,
                price: Number(opt.price || 0)
              });
            }
          });
        } else if (selected) {
          var opt = group.options.find(function (o) {
            return o.option_id === selected;
          });
          if (opt) {
            result.push({
              groupId: group.group_id,
              groupName: group.name,
              optionId: opt.option_id,
              optionName: opt.name,
              price: Number(opt.price || 0)
            });
          }
        }
      });
      return result;
    },
    confirmSpecSelection: function confirmSpecSelection() {
      var dish = this.specPopup.dish;
      var sku = this.findSkuById(dish, this.specPopup.selectedSkuId);
      var options = this.getSelectedOptionsList();
      if (!dish || !sku) return;
      this.addToCart({
        dish: dish,
        sku: sku,
        options: options,
        quantity: this.specPopup.quantity
      });
      this.specPopup.show = false;
      this.$u.toast('已加入购物车');
    },
    openDishFromRecommend: function openDishFromRecommend(dish) {
      this.selectSpec(dish);
    },
    handleCloseSpecPopup: function handleCloseSpecPopup() {
      this.specPopup.show = false;
    },
    highlightDish: function highlightDish(_ref3) {
      var _this16 = this;
      return (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee9() {
        var dishId, categoryId, index;
        return _regenerator.default.wrap(function _callee9$(_context9) {
          while (1) {
            switch (_context9.prev = _context9.next) {
              case 0:
                dishId = _ref3.dishId, categoryId = _ref3.categoryId;
                if (!(!dishId || !categoryId)) {
                  _context9.next = 3;
                  break;
                }
                return _context9.abrupt("return");
              case 3:
                index = _this16.categories.findIndex(function (cat) {
                  return cat._id === categoryId;
                });
                if (!(index >= 0)) {
                  _context9.next = 9;
                  break;
                }
                _this16.current = index;
                _context9.next = 8;
                return _this16.fetchDishes(categoryId);
              case 8:
                _this16.$nextTick(function () {
                  _this16.highlightedDishId = dishId;
                  setTimeout(function () {
                    _this16.highlightedDishId = '';
                  }, 2000);
                });
              case 9:
              case "end":
                return _context9.stop();
            }
          }
        }, _callee9);
      }))();
    },
    formatPrice: function formatPrice(price) {
      var num = Number(price) || 0;
      return num.toFixed(2);
    },
    getFirstSku: function getFirstSku(dish) {
      if (!dish || !Array.isArray(dish.skus) || !dish.skus.length) {
        return null;
      }
      return dish.skus[0];
    },
    getFirstSkuPrice: function getFirstSkuPrice(dish) {
      var sku = this.getFirstSku(dish);
      return sku ? Number(sku.price || 0) : 0;
    },
    getDefaultSkuId: function getDefaultSkuId(dish) {
      var sku = this.getFirstSku(dish);
      return sku && sku.sku_id ? sku.sku_id : '';
    },
    findSkuById: function findSkuById(dish, skuId) {
      if (!dish || !Array.isArray(dish.skus) || !dish.skus.length) {
        return null;
      }
      if (!skuId) {
        return dish.skus[0];
      }
      var match = dish.skus.find(function (item) {
        return item.sku_id === skuId;
      });
      return match || dish.skus[0];
    }
  }
};
exports.default = _default;
/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! ./node_modules/@dcloudio/uni-mp-weixin/dist/index.js */ 2)["default"]))

/***/ }),

/***/ 89:
/*!******************************************************************************************************************!*\
  !*** D:/code/HBworkspace/点餐小程序用户端/pages/menu/menu.vue?vue&type=style&index=0&id=368aef34&lang=scss&scoped=true& ***!
  \******************************************************************************************************************/
/*! no static exports found */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _soft_HBuilderX_HBuilderX_plugins_uniapp_cli_node_modules_mini_css_extract_plugin_dist_loader_js_ref_8_oneOf_1_0_soft_HBuilderX_HBuilderX_plugins_uniapp_cli_node_modules_css_loader_dist_cjs_js_ref_8_oneOf_1_1_soft_HBuilderX_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_loaders_stylePostLoader_js_soft_HBuilderX_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_8_oneOf_1_2_soft_HBuilderX_HBuilderX_plugins_uniapp_cli_node_modules_postcss_loader_src_index_js_ref_8_oneOf_1_3_soft_HBuilderX_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_sass_loader_dist_cjs_js_ref_8_oneOf_1_4_soft_HBuilderX_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_8_oneOf_1_5_soft_HBuilderX_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_soft_HBuilderX_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_menu_vue_vue_type_style_index_0_id_368aef34_lang_scss_scoped_true___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! -!../../../../../soft/HBuilderX/HBuilderX/plugins/uniapp-cli/node_modules/mini-css-extract-plugin/dist/loader.js??ref--8-oneOf-1-0!../../../../../soft/HBuilderX/HBuilderX/plugins/uniapp-cli/node_modules/css-loader/dist/cjs.js??ref--8-oneOf-1-1!../../../../../soft/HBuilderX/HBuilderX/plugins/uniapp-cli/node_modules/@dcloudio/vue-cli-plugin-uni/packages/vue-loader/lib/loaders/stylePostLoader.js!../../../../../soft/HBuilderX/HBuilderX/plugins/uniapp-cli/node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader??ref--8-oneOf-1-2!../../../../../soft/HBuilderX/HBuilderX/plugins/uniapp-cli/node_modules/postcss-loader/src??ref--8-oneOf-1-3!../../../../../soft/HBuilderX/HBuilderX/plugins/uniapp-cli/node_modules/@dcloudio/vue-cli-plugin-uni/packages/sass-loader/dist/cjs.js??ref--8-oneOf-1-4!../../../../../soft/HBuilderX/HBuilderX/plugins/uniapp-cli/node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader??ref--8-oneOf-1-5!../../../../../soft/HBuilderX/HBuilderX/plugins/uniapp-cli/node_modules/@dcloudio/vue-cli-plugin-uni/packages/vue-loader/lib??vue-loader-options!../../../../../soft/HBuilderX/HBuilderX/plugins/uniapp-cli/node_modules/@dcloudio/webpack-uni-mp-loader/lib/style.js!./menu.vue?vue&type=style&index=0&id=368aef34&lang=scss&scoped=true& */ 90);
/* harmony import */ var _soft_HBuilderX_HBuilderX_plugins_uniapp_cli_node_modules_mini_css_extract_plugin_dist_loader_js_ref_8_oneOf_1_0_soft_HBuilderX_HBuilderX_plugins_uniapp_cli_node_modules_css_loader_dist_cjs_js_ref_8_oneOf_1_1_soft_HBuilderX_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_loaders_stylePostLoader_js_soft_HBuilderX_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_8_oneOf_1_2_soft_HBuilderX_HBuilderX_plugins_uniapp_cli_node_modules_postcss_loader_src_index_js_ref_8_oneOf_1_3_soft_HBuilderX_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_sass_loader_dist_cjs_js_ref_8_oneOf_1_4_soft_HBuilderX_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_8_oneOf_1_5_soft_HBuilderX_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_soft_HBuilderX_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_menu_vue_vue_type_style_index_0_id_368aef34_lang_scss_scoped_true___WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_soft_HBuilderX_HBuilderX_plugins_uniapp_cli_node_modules_mini_css_extract_plugin_dist_loader_js_ref_8_oneOf_1_0_soft_HBuilderX_HBuilderX_plugins_uniapp_cli_node_modules_css_loader_dist_cjs_js_ref_8_oneOf_1_1_soft_HBuilderX_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_loaders_stylePostLoader_js_soft_HBuilderX_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_8_oneOf_1_2_soft_HBuilderX_HBuilderX_plugins_uniapp_cli_node_modules_postcss_loader_src_index_js_ref_8_oneOf_1_3_soft_HBuilderX_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_sass_loader_dist_cjs_js_ref_8_oneOf_1_4_soft_HBuilderX_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_8_oneOf_1_5_soft_HBuilderX_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_soft_HBuilderX_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_menu_vue_vue_type_style_index_0_id_368aef34_lang_scss_scoped_true___WEBPACK_IMPORTED_MODULE_0__);
/* harmony reexport (unknown) */ for(var __WEBPACK_IMPORT_KEY__ in _soft_HBuilderX_HBuilderX_plugins_uniapp_cli_node_modules_mini_css_extract_plugin_dist_loader_js_ref_8_oneOf_1_0_soft_HBuilderX_HBuilderX_plugins_uniapp_cli_node_modules_css_loader_dist_cjs_js_ref_8_oneOf_1_1_soft_HBuilderX_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_loaders_stylePostLoader_js_soft_HBuilderX_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_8_oneOf_1_2_soft_HBuilderX_HBuilderX_plugins_uniapp_cli_node_modules_postcss_loader_src_index_js_ref_8_oneOf_1_3_soft_HBuilderX_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_sass_loader_dist_cjs_js_ref_8_oneOf_1_4_soft_HBuilderX_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_8_oneOf_1_5_soft_HBuilderX_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_soft_HBuilderX_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_menu_vue_vue_type_style_index_0_id_368aef34_lang_scss_scoped_true___WEBPACK_IMPORTED_MODULE_0__) if(["default"].indexOf(__WEBPACK_IMPORT_KEY__) < 0) (function(key) { __webpack_require__.d(__webpack_exports__, key, function() { return _soft_HBuilderX_HBuilderX_plugins_uniapp_cli_node_modules_mini_css_extract_plugin_dist_loader_js_ref_8_oneOf_1_0_soft_HBuilderX_HBuilderX_plugins_uniapp_cli_node_modules_css_loader_dist_cjs_js_ref_8_oneOf_1_1_soft_HBuilderX_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_loaders_stylePostLoader_js_soft_HBuilderX_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_8_oneOf_1_2_soft_HBuilderX_HBuilderX_plugins_uniapp_cli_node_modules_postcss_loader_src_index_js_ref_8_oneOf_1_3_soft_HBuilderX_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_sass_loader_dist_cjs_js_ref_8_oneOf_1_4_soft_HBuilderX_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_8_oneOf_1_5_soft_HBuilderX_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_soft_HBuilderX_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_menu_vue_vue_type_style_index_0_id_368aef34_lang_scss_scoped_true___WEBPACK_IMPORTED_MODULE_0__[key]; }) }(__WEBPACK_IMPORT_KEY__));
 /* harmony default export */ __webpack_exports__["default"] = (_soft_HBuilderX_HBuilderX_plugins_uniapp_cli_node_modules_mini_css_extract_plugin_dist_loader_js_ref_8_oneOf_1_0_soft_HBuilderX_HBuilderX_plugins_uniapp_cli_node_modules_css_loader_dist_cjs_js_ref_8_oneOf_1_1_soft_HBuilderX_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_loaders_stylePostLoader_js_soft_HBuilderX_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_8_oneOf_1_2_soft_HBuilderX_HBuilderX_plugins_uniapp_cli_node_modules_postcss_loader_src_index_js_ref_8_oneOf_1_3_soft_HBuilderX_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_sass_loader_dist_cjs_js_ref_8_oneOf_1_4_soft_HBuilderX_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_8_oneOf_1_5_soft_HBuilderX_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_soft_HBuilderX_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_menu_vue_vue_type_style_index_0_id_368aef34_lang_scss_scoped_true___WEBPACK_IMPORTED_MODULE_0___default.a); 

/***/ }),

/***/ 90:
/*!**********************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/mini-css-extract-plugin/dist/loader.js??ref--8-oneOf-1-0!./node_modules/css-loader/dist/cjs.js??ref--8-oneOf-1-1!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/vue-loader/lib/loaders/stylePostLoader.js!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader??ref--8-oneOf-1-2!./node_modules/postcss-loader/src??ref--8-oneOf-1-3!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/sass-loader/dist/cjs.js??ref--8-oneOf-1-4!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader??ref--8-oneOf-1-5!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/vue-loader/lib??vue-loader-options!./node_modules/@dcloudio/webpack-uni-mp-loader/lib/style.js!D:/code/HBworkspace/点餐小程序用户端/pages/menu/menu.vue?vue&type=style&index=0&id=368aef34&lang=scss&scoped=true& ***!
  \**********************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

// extracted by mini-css-extract-plugin
    if(false) { var cssReload; }
  

/***/ })

},[[82,"common/runtime","common/vendor"]]]);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/menu/menu.js.map