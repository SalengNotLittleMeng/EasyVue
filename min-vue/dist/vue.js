(function (global, factory) {
  typeof exports === "object" && typeof module !== "undefined"
    ? (module.exports = factory())
    : typeof define === "function" && define.amd
    ? define(factory)
    : ((global =
        typeof globalThis !== "undefined" ? globalThis : global || self),
      (global.Vue = factory()));
})(this, function () {
  "use strict";

  // 给Vue增加初始化方法
  function initMixin(Vue) {
    Vue.prototype._init = function () {
      console.log("hello");
    };
  }

  function Vue(options) {
    this._init(options);
  } // 扩展了init方法

  initMixin(Vue);

  return Vue;
});
//# sourceMappingURL=vue.js.map
