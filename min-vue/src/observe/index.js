import { newArrayProto } from "./array";
class Observe {
  constructor(data) {
    // 给数据添加一个表示__ob__,被标识的数据标识已经被观测过了
    //data.__ob__=this 直接将this添加到__ob__后，会导致遍历可观测对象时遍历到this，形成死循环
    // 添加属性__ob__并将这个属性设置为不可枚举，使其在遍历时无法被遍历
    Object.defineProperty(data, "__ob__", {
      value: this,
      enumerable: false,
    });
    if (Array.isArray(data)) {
      // 用户一般不会通过索引调用数组的值，直接遍历又会导致性能问题
      //因此我们可以通过重写数组7个变异方法的方式来监控数据变化
      //同时应该考虑数组中对象的劫持
      data.__proto__ = newArrayProto;
      this.observeArray(data); //监控数组中的对象,只将数组中的对象进行挂载
    } else {
      this.walk(data);
    }
    // Object.defineProperty只能劫持已经存在的属性l
  }
  walk(data) {
    //循环对象，对属性依次劫持,重新定义属性
    Object.keys(data).forEach((key) => {
      defineReactive(data, key, data[key]);
    });
  }
  observeArray(data) {
    data.forEach((item) => {
      observe(item);
    });
  }
}
export function defineReactive(target, key, value) {
  // 闭包，从外部拿到value
  // 如果劫持到的属性依然是一个对象，就应该递归劫持所有属性，深度属性劫持
  observe(value);
  Object.defineProperty(target, key, {
    get() {
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
