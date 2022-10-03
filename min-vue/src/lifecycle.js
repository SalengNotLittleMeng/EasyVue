import { createElementVNode, createTextVNode } from "./vdom/index";
export function initLifeCycle(Vue) {
  Vue.prototype._update = function () {};
  Vue.prototype._render = function () {
    const vm = this;
    return vm.$options.render.call(this); //转移后生产的 render方法
  };
  Vue.prototype._c = function () {
    return createElementVNode(this, ...arguments);
  };
  Vue.prototype._v = function () {
    return createTextVNode(this, ...arguments);
  };
  Vue.prototype._s = function (value) {
    return JSON.stringify(value);
  };
}
export function mountComponent(vm, el) {
  // 1.调用render方法，产生虚拟dom
  vm._update(vm._render()); //vm.$options.render,返回虚拟节点
  // 2.根据虚拟dom产生真实dom

  // 3.插入到el元素中
}

// 将模板转化为ast模板语法树，ast转化为render函数，后续每次数据更新只执行render函数（无需再转化ast）
// render函数会产生虚拟节点，根据创造的虚拟节点创造真实Dom
