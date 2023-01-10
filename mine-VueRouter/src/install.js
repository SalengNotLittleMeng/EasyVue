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
      } else {
        // 所有组件上都增加一个routerRoot的指针指向根实例
        this._routerRoot = this.$parent?._router;
      }
    },
  });
  // 劫持$router属性，取$router其实是取了根实例上的router
  Object.defineProperty(Vue.prototype, "$router", {
    get() {
      return this._routerRoot._router;
    },
  });
  Vue.component("router-link", {
    render(h) {
      return h("a", { class: "foo" }, [this.$slots.default]);
    },
  });
  Vue.component("router-view", {
    render(h) {
      return h("a", { class: "foo" }, ["hello"]);
    },
  });
}
