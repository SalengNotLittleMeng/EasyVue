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
        this._routerRoot = this.$parent?._router;
      }
    },
  });
  // 劫持$router属性，取$router其实是取了根实例上的router
  Object.defineProperty(Vue.prototype, "$router", {
    get() {
      return this._routerRoot && this._routerRoot._router;
    },
  });
  Object.defineProperty(Vue.prototype, "$route", {
    get() {
      return this._routerRoot && this._routerRoot._route;
    },
  });
  // 内部修改的是current
  Vue.component("router-link", {
    props: {
      to: { type: String },
      tag: { type: String, default: "a" },
    },
    methods: {
      handler() {
        this.$router.push(this.to);
      },
    },
    render(h) {
      let tag = this.tag;
      return h(
        tag,
        {
          on: {
            click: () => {
              this.handler();
            },
          },
        },
        [this.$slots.default]
      );
    },
  });
  Vue.component("router-view", {
    render(h) {
      return h("a", { class: "foo" }, ["hello"]);
    },
  });
}
