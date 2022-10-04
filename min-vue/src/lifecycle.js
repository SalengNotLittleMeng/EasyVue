import { createElementVNode, createTextVNode } from "./vdom/index";
import Watcher from "./observe/watcher";
function createElm(vnode) {
  let { tag, data, children, text } = vnode;
  if (typeof tag == "string") {
    // 将真实节点和虚拟节点进行对应，为后续diff算法做准备
    vnode.el = document.createElement(tag);
    patchProps(vnode.el, data);
    children.forEach((child) => {
      vnode.el.appendChild(createElm(child));
    });
  } else {
    vnode.el = document.createTextNode(text);
  }
  return vnode.el;
}
function patchProps(el, props) {
  for (let key in props) {
    if (key == "style") {
      for (let styleName in props.style) {
        el.style[styleName] = props.style[styleName];
      }
    } else {
      el.setAttribute(key, props[key]);
    }
  }
}
function patch(oldVNode, vnode) {
  const isRealElement = oldVNode.nodeType;
  if (isRealElement) {
    // 获取真实元素
    const elm = oldVNode;
    // 拿到父元素
    const parentElm = elm.parentNode;
    let newElm = createElm(vnode);
    parentElm.insertBefore(newElm, elm.nextSibiling);
    parentElm.removeChild(elm);
    return newElm;
  } else {
    // diff算法
  }
}
export function initLifeCycle(Vue) {
  Vue.prototype._update = function (vnode) {
    // patch既有初始化功能，又有更新的功能
    const vm = this;
    const el = vm.$el;
    vm.$el = patch(el, vnode);
  };
  Vue.prototype._render = function () {
    // 渲染时会去实例上取值
    const vm = this;
    return vm.$options.render.call(this); //转移后生产的 render方法
  };
  // 创造虚拟节点
  Vue.prototype._c = function () {
    return createElementVNode(this, ...arguments);
  };
  // 创建文本虚拟节点
  Vue.prototype._v = function () {
    return createTextVNode(this, ...arguments);
  };
  // 创建普通文字节点
  Vue.prototype._s = function (value) {
    if (typeof value !== "object") return value;
    return JSON.stringify(value);
  };
}
export function mountComponent(vm, el) {
  vm.$el = el;
  const updateComponent = () => {
    vm._update(vm._render()); //vm.$options.render,返回虚拟节点
  };
  // 1.调用render方法，产生虚拟dom
  const watcher = new Watcher(vm, updateComponent, true);
  // 2.根据虚拟dom产生真实dom

  // 3.插入到el元素中
}

// 将模板转化为ast模板语法树，ast转化为render函数，后续每次数据更新只执行render函数（无需再转化ast）
// render函数会产生虚拟节点，根据创造的虚拟节点创造真实Dom
