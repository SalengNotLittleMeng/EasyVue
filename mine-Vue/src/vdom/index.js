const isReservedTag = (tag) => {
  return [
    "a",
    "div",
    "span",
    "ul",
    "li",
    "ol",
    "button",
    "input",
    "h1",
    "h2",
    "h3",
    "p",
    "br",
  ].includes(tag);
};
export function createElementVNode(vm, tag, data, ...children) {
  if (data == null) {
    data = {};
  }
  let key = data.key;
  if (key) {
    delete data.key;
  }
  // 判断是否是原生标签
  if (isReservedTag(tag)) {
    return vnode(vm, tag, key, data, children);
  } else {
    // 创造一个组件的虚拟节点，包含组件的构造函数
    let Ctor = vm.$options.components[tag]; //组件的构造函数
    // Ctor是组件的定义，可能是配置对象（模板选项）或者是Sub（Vue的子类）
    //全局组件是构造函数，否则是对象
    return createComponentVNode(vm, tag, key, data, children, Ctor);
    // 调用完这个方法之后，vnode.componentInstance上
  }
}
function createComponentVNode(vm, tag, key, data, children, Ctor) {
  if (typeof Ctor == "object") {
    // 确保Ctor一定是构造函数
    Ctor = vm.$options._base.extend(Ctor);
  }
  data.hook = {
    // 用于创建真实节点的时候，如果是组件则调用此方法
    init(vnode) {
      // 保存组件的实例到虚拟节点上
      let instance = (vnode.componentInstance =
        new vnode.componentOptions.Ctor());
      instance.$mount();
      // 执行后instance上增加了$el
    },
  };
  return vnode(vm, tag, key, data, children, null, { Ctor });
}
export function createTextVNode(vm, text) {
  return vnode(vm, undefined, undefined, undefined, undefined, text);
}
// ast是描述JS，css,等语言本身的情况的
// 虚拟dom是描述dom节点的
function vnode(vm, tag, key, data, children, text, componentOptions) {
  return {
    vm,
    tag,
    key,
    data,
    children,
    text,
    // 包含了组件的构造函数
    componentOptions,
  };
}
export function isSameVnode(vnode1, vnode2) {
  return vnode1.tag === vnode2.tag && vnode1.key === vnode2.key;
}
