export default {
  name: "router-view",
  // router-view 不会被计入父子关系，应该被标识为抽象（函数式）组件,避免创建父子关系（$parents，$children等）
  functional: true,
  render(h, { parent, data }) {
    data.routerView = true;
    let route = parent.$route;
    let depth = 0;
    // 找到当前渲染的是第几层
    while (parent) {
      if (parent.$vnode && parent.$vnode.data.routerView) {
        depth++;
      }
      parent = parent.$parent;
    }
    let record = route.matched[depth];
    if (!record) {
      return h();
    }
    return h(record.component, data);
    // _vnode:渲染函数的虚拟节点；$vnode:代表组件本身，$vnode是_vnode的父亲
  },
};
