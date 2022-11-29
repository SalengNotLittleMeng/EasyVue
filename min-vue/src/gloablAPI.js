import { mergeOptions } from "./utils";
export function initGlobalAPI(Vue) {
  Vue.options = {
    _base: Vue,
  };
  Vue.mixin = function (mixin) {
    // 期望将用户的选项和全局的options进行合并
    // Vue的混入本质是一个订阅发布者模式
    this.options = mergeOptions(Vue.options, mixin);
    return this;
  };
  // 可以手动改创造组件进行挂载
  Vue.extend = function (options) {
    // 根据用户的参数，返回一个构造函数
    // 最终使用一个组件，就是new一个实例
    function Sub(options = {}) {
      this._init(options); // 默认对子类进行初始化操作
    }
    Sub.prototype = Object.create(Vue.prototype);
    Sub.prototype.constructor = Sub;
    // 希望将用户传递的参数和全局的Vue.options合并，使形成类似原型链的查找方式，出现重名优先查找自己
    Sub.options = mergeOptions(Vue.options, options); //保存用户传递的选项
    return Sub;
    // 子组件挂载时也会产生一个watcher
  };
  Vue.options.components = {};
  Vue.component = function (id, definition) {
    // 如果definition已经是一个函数了，说明用户自己调用了vue.extend
    definition =
      typeof definition == "function" ? definition : Vue.extend(definition);
    Vue.options.components[id] = definition;
  };
}
