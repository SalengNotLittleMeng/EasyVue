import routerLink from "./components/router-link";
import routerView from "./components/router-view";
export let Vue;
export function install(_Vue) {
  Vue = _Vue;
  Vue.mixin({
    beforeCreate() {
      // 这里不用原型继承的原因是因为会导致所有的Vue类共享路由
      if (this.$options.router) {
        // 根实例上传递了router
        this._routerRoot = this;
        this._router = this.$options.router || {};
        this._router.init(this); //this就是我们整个的应用(new Vue)
        // 给根实例添加一个属性_router,就是当前的current对象
        Vue.util.defineReactive(this, "_route", this._router.history.current);
      } else {
        // 所有组件上都增加一个routerRoot的指针指向根实例
        this._routerRoot = this.$parent?._router || this.$parent._routerRoot;
      }
    },
  });
  // 劫持$router属性，取$router其实是取了根实例上的router
  Object.defineProperty(Vue.prototype, "$router", {
    get() {
      return this._routerRoot;
    },
  });
  Object.defineProperty(Vue.prototype, "$route", {
    get() {
      return this._routerRoot._route || this._routerRoot.history.current;
    },
  });
  // 内部修改的是current
  Vue.component("router-link", routerLink);
  Vue.component("router-view", routerView);
}
