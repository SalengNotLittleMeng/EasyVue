export function createElementVNode(vm, tag, data, ...children) {
  if (data == null) {
    data = {};
  }
  let key = data.key;
  if (key) {
    delete data.key;
  }
  return vnode(vm, tag, key, data, children);
}

export function createTextVNode(vm, text) {
  return vnode(vm, undefined, undefined, undefined, undefined, text);
}
// ast是描述JS，css,等语言本身的情况的
// 虚拟dom是描述dom节点的
function vnode(vm, tag, key, data, children, text) {
  return {
    vm,
    tag,
    key,
    data,
    children,
    text,
  };
}
