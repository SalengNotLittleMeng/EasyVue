// 我们希望保留原数组特性并重写部分数组方法
let oldArrayProto = Array.prototype;
export let newArrayProto = Object.create(oldArrayProto);
// 所有变异方法
const methods = [
  "push",
  "shift",
  "unshift",
  "splice",
  "pop",
  "reverse",
  "sort",
];
methods.forEach((method) => {
  newArrayProto[method] = function (...args) {
    // 内部调用原来的方法
    const result = oldArrayProto[method].call(this, ...args);
    let ob = this.__ob__;
    // 将数组中新增的方法进行响应式劫持
    let inserted;
    switch (method) {
      case "push":
      case "unshift":
        inserted = args;
        break;
      case "splice":
        inserted = args.slice(2);
      default:
        break;
    }
    if (inserted) {
      ob.observeArray(inserted);
    }
    return result;
  };
});
