class Observe {
  constructor(data) {
    // Object.defineProperty只能劫持已经存在的属性
    this.walk(data);
  }
  walk(data) {
    //循环对象，对属性依次劫持,重新定义属性
    Object.keys(data).forEach((key) => {
      defineReactive(data, key, data[key]);
    });
  }
}
export function defineReactive(target, key, value) {
  // 闭包，从外部拿到value
  // 如果劫持到的属性依然是一个对象，就应该递归劫持所有属性，深度属性劫持
  observe(value);
  Object.defineProperty(target, key, {
    get() {
      console.log("用户取值了", value);
      return value;
    },
    set(newValue) {
      if (newValue == value) return;
      value = newValue;
    },
  });
}
export function observe(data) {
  if (typeof data != "object" || data == null) {
    return; //只对对象进行劫持
  }
  //判断对象是否被劫持过，需要用一个实例来观测判断

  return new Observe(data);
}
