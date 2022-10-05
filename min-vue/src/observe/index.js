import { newArrayProto } from "./array";
import Dep from "./dep";
class Observe {
  // 给每个对象都增加收集功能
  // 要给数组和对象本身也增加dep,如果用户增添了属性或数组新增了一项，都会触发dep
  constructor(data) {
    // 给数据添加一个表示__ob__,被标识的数据标识已经被观测过了
    //data.__ob__=this 直接将this添加到__ob__后，会导致遍历可观测对象时遍历到this，形成死循环
    // 添加属性__ob__并将这个属性设置为不可枚举，使其在遍历时无法被遍历
    this.dep = new Dep();
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
    // Object.defineProperty只能劫持已经存在的属性
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
function dependArray(value) {
  // 对数组的每一个元素进行观察
  for (let i = 0; i < value.length; i++) {
    // 如果数组中有对象（有__ob__表示是对象且被标记过），那么需要将数组中的所有对象进行观测
    value[i].__ob__ && value[i].__ob__.dep.depend();
    // 如果数组中的子元素还是数组，则继续递归
    if (Array.isArray(value[i])) {
      dependArray(value[i]);
    }
  }
}
export function defineReactive(target, key, value) {
  // 闭包，从外部拿到value
  // 如果劫持到的属性依然是一个对象，就应该递归劫持所有属性，深度属性劫持
  let childOb = observe(value);
  // 每一个属性都有一个dep，这里是闭包，因此变量不会销毁
  let dep = new Dep();
  Object.defineProperty(target, key, {
    get() {
      // 如果Dep.target不为null,证明这个属性被某个watch依赖
      if (Dep.target) {
        dep.depend();
        if (childOb) {
          // 让数组和对象也实现依赖收集
          // 如果出现对象套对象的情况，就将这个属性继续放入dep队列观察，深度遍历
          childOb.dep.depend();
          // 当出现数组套数组的情况时，进行深度遍历
          if (Array.isArray(value)) {
            dependArray(value);
          }
        }
      }
      return value;
    },
    set(newValue) {
      if (newValue == value) return;
      value = newValue;
      // 通知所有依赖这个属性的watch更新视图
      dep.notify();
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
