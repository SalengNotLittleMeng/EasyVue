const strats = {};
const LIFECYCLE = [
  "beforeCreate",
  "created",
  "mounted",
  "beforeUpdate",
  "updated",
  "beforeDestroy",
  "destroy",
];
LIFECYCLE.forEach((hook) => {
  strats[hook] = function (p, c) {
    if (c) {
      if (p) {
        // 第一次之后，p必定为一个数组
        return p.concat(c);
      } else {
        // 第一次合并p为{}
        return [c];
      }
    } else {
      // 如果儿子没有，直接返回父亲
      // c没有的情况下，p可能有，也可能为undefined
      return p;
    }
  };
});
strats.components = function (parentVal, childVal) {
  const res = Object.create(parentVal);
  if (childVal) {
    for (let key in childVal) {
      // 返回的是构造的对象，可以返回父亲原型上的属性，并将儿子的属性拷贝到自己身上
      res[key] = childVal[key];
    }
  }
  return res;
};
export function mergeOptions(parent, child) {
  const options = {};
  for (let key in parent) {
    mergeField(key);
  }
  for (let key in child) {
    if (!parent.hasOwnProperty(key)) {
      mergeField(key);
    }
  }
  function mergeField(key) {
    // 策略模式减少if-else
    if (strats[key]) {
      options[key] = strats[key](parent[key], child[key]);
    } else {
      // 不在策略中则优先采用儿子的，再采用父亲
      options[key] = child[key] || parent[key];
    }
  }
  return options;
}
