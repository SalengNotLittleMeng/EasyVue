import { isSameVnode } from "./index";
function createComponent(vnode) {
  let i = vnode.data;
  if ((i = i.hook) && (i = i.init)) {
    i(vnode); //使用init方法初始化组件，调用$mount()
  }
  if (vnode.componentInstance) {
    return true; //说明是组件
  }
}
export function createElm(vnode) {
  let { tag, data, children, text } = vnode;
  if (typeof tag == "string") {
    // 创建真实节点需要知道是组件还是真实元素

    if (createComponent(vnode)) {
      // 这里的$el是在执行$mount后产生的虚拟节点对应的真实节点
      return vnode.createComponent.$el;
    }
    // 将真实节点和虚拟节点进行对应，为后续diff算法做准备
    vnode.el = document.createElement(tag);
    patchProps(vnode.el, {}, data);
    children.forEach((child) => {
      vnode.el.appendChild(createElm(child));
    });
  } else {
    vnode.el = document.createTextNode(text);
  }
  return vnode.el;
}
export function patchProps(el, oldProps = {}, props = {}) {
  // 老的属性中有，新的没有，要删除老的
  let oldStyles = oldProps.style || {};
  let newStyle = props.style;
  // 对于style
  for (let key in oldProps) {
    if (!newStyle[key]) {
      el.style[key] = "";
    }
  }
  // 对于一般属性
  for (let key in oldProps) {
    if (!props[key]) {
      el.removeAttribute(key);
    }
  }
  // 用新的覆盖掉老的
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
export function patch(oldVNode, vnode) {
  if (!oldVNode) {
    // 没有el，表示是组件的挂载
    //注意这里要修改init中的挂载方法，没有el也可以挂载
    //vm.$el就是渲染的结果
    return createElm(vnode);
  }
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
    return patchVnode(oldVNode, vnode);
  }
}
// 利用diff算法更新两个节点
function patchVnode(oldVNode, vnode) {
  // 两个节点不是同一个节点，直接删除老的，换上新的（没有对比）

  // 两个节点是同一个节点，判断节点的tag和key，tag和key一样是同一个节点，此时去比较两个节点的属性是否有差异（复用老的节点，将差异的属性更新）
  // 节点比较完成后，比较两个节点的子节点
  // 如果不是同一节点，用新节点替换老节点
  if (!isSameVnode(oldVNode, vnode)) {
    // 用老节点的父亲进行替换
    //这里的el属性就是虚拟节点对应的真实节点
    let el = createElm(vnode);
    oldVNode.el.parentNode.replaceChild(el, oldVNode);
    return el;
  }
  // 如果是文本节点，就比对一下文本的内容
  let el = (vnode.el = oldVNode.el); //复用老节点的元素
  if (!oldVNode.tag) {
    // 文本的情况
    if (oldVNode.text !== vnode.text) {
      el.textContent = vnode.text;
    }
  }
  //是标签，需要比对标签的属性
  patchProps(el, oldVNode.data, vnode.data);
  // 比较子节点：
  // 1.一方有儿子，一方没儿子
  // 2.两方都有儿子
  let oldChildren = oldVNode.children || [];
  let newChildren = vnode.children || [];
  if (oldChildren.length > 0 && newChildren.length > 0) {
    // 完整的diff算法
    updateChild(el, oldChildren, newChildren);
  } else if (newChildren > 0) {
    // 老的没有新的有
    mountChildren(el, newChildren);
  } else if (oldChildren > 0) {
    // 新的没有老的有
    unmountChild(el, oldChildren);
  }
  return el;
}

function mountChildren(el, children) {
  for (let i = 0; i < children.length; i++) {
    let child = newChildren[i];
    el.appendChild(createElm(child));
  }
}

function unmountChild(el, children) {
  el.innerHTML = "";
}

function updateChild(el, oldChildren, newChildren) {
  // 为了增高性能，会有一些优化手段
  // vue2中采用双指针的方式比较两个节点
  let oldStartIndex = 0;
  let newStartIndex = 0;
  let oldEndIndex = oldChildren.length - 1;
  let newEndIndex = newChildren.length - 1;

  let oldStartVnode = oldChildren[0];
  let newStartVnode = newChildren[0];

  let oldEndVnode = oldChildren[oldEndIndex];
  let newEndVnode = newChildren[newEndIndex];
  function makeIndexByKey(children) {
    let map = {};
    children.forEach((child, index) => {
      map[child.key] = index;
    });
    return map;
  }
  let map = makeIndexByKey(oldChildren);
  while (oldStartIndex <= oldEndIndex && newStartIndex <= newEndIndex) {
    // 有一方的头指针大于尾部指针，则停止循环
    // 如果是相同节点，则递归比较子节点
    if (!oldStartVnode) {
      // 处理置空节点产生的undefind的问题
      oldStartVnode = oldChildren[++oldStartIndex];
    } else if (!oldEndVnode) {
      // 处理置空节点产生的undefind的问题
      oldEndVnode = oldChildren[--oldEndIndex];
    } else if (isSameVnode(oldStartVnode, newStartVnode)) {
      patchVnode(oldStartVnode, newStartVnode);
      // 指针移动
      oldStartVnode = oldChildren[++oldStartIndex];
      newStartVnode = newChildren[++newStartIndex];
    }
    // 当首个元素不同时反向比对
    else if (isSameVnode(oldEndVnode, newEndVnode)) {
      patchVnode(oldEndVnode, newEndVnode);
      oldEndVnode = oldChildren[--oldEndIndex];
      newEndVnode = newChildren[--newEndIndex];
    }
    // 交叉比对，优化reverse方法 abcd__>dabc,处理了倒叙和排序的情况
    else if (isSameVnode(oldEndVnode, newStartVnode)) {
      patchVnode(oldEndVnode, newStartVnode);
      // 将老的尾部移动到老的前面去（变为了新前对旧前）
      // insertBefore具有移动性，会将原来的元素移动走
      el.insertBefore(oldEndVnode.el, oldStartVnode.el);
      oldEndVnode = oldChildren[--oldEndIndex];
      newStartVnode = newChildren[++newStartIndex];
    } else if (isSameVnode(oldStartVnode, newEndVnode)) {
      patchVnode(oldStartVnode, newEndVnode);
      // 将老的尾部移动到老的前面去（变为了新前对旧前）
      // insertBefore具有移动性，会将原来的元素移动走
      el.insertBefore(oldStartVnode.el, oldEndVnode.el.nextSibiling);
      oldStartVnode = oldChildren[++oldStartIndex];
      newEndVnode = newChildren[--newEndIndex];
    } else {
      // 给动态列表添加key时，尽量避免使用索引，可能导致错误复用
      // 乱序比对:根据老的列表做一个映射关系，用新的逐个比对查找，找到移动，找不到添加，多出的删除
      // 如果拿到说明是要移动的索引
      let moveIndex = map[newStartVnode?.key];
      if (moveIndex !== undefined) {
        // 找到对应的虚拟节点进行复用
        let moveVnode = oldChildren[moveIndex];
        el.insertBefore(moveVnode.el, oldStartVnode.el);
        oldChildren[moveIndex] = undefined; //表示这个节点已经被移走了
        // 递归比较属性和子节点
        patchVnode(moveVnode, newStartVnode);
      } else {
        // 无法找到老节点
        el.insertBefore(createElm(newStartVnode), oldStartVnode.el);
      }
      newStartVnode = newChildren[++newStartIndex];
    }
  }

  // 多出元素删除，缺少元素添加
  // 相比于原有的数组有新增元素，尾部对新增元素进行添加
  if (newStartIndex <= newEndIndex) {
    for (let i = newStartIndex; i <= newEndIndex; i++) {
      let childEl = createElm(newChildren[i]);
      // 这里也有可能向前追加
      let anchor = newChildren[newEndIndex + 1]
        ? newChildren[newEndIndex + 1].el
        : null;
      el.insertBefore(childEl, anchor);
      //  anchor为null时，则等价于appendChild
    }
  }
  // 相比于原有数组尾部减少元素，对被减少的元素进行删除
  if (oldStartIndex <= oldEndIndex) {
    for (let i = oldStartIndex; i <= oldEndIndex; i++) {
      if (oldChildren[i]) {
        let childEl = oldChildren[i].el;
        el.removeChild(childEl);
      }
    }
  }
}
