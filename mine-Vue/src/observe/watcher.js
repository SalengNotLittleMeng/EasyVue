import Dep from "./dep";
import { pushTarget, popTarget } from "./dep";
let id = 0;
// 解析一般data时只会创建一个渲染watcher，当解析计算属性时，会按栈结构去创建计算属性watcher
// watcher的作用时：当依赖的dep发生更新时，对应地触发某些操作（比如重新渲染）
class Watcher {
  constructor(vm, exprOrFn, options, cb) {
    this.id = id++;
    this.renderWatcher = vm.options;
    // getter意味着调用这个函数会发生取值
    if (typeof exprOrFn === "string") {
      this.getter = function () {
        return vm[exprOrFn];
      };
    } else {
      this.getter = exprOrFn;
    }
    // 让watcher去记住所有dep，后续实现计算属性和清理工作需要使用
    this.deps = [];
    this.depsId = new Set();
    this.lazy = options.lazy;
    this.dirty = this.lazy;
    this.vm = vm;
    // 标识是否是用户自己的watcher
    this.user = options.user;
    this.cb = cb;
    // 计算属性第一次并不执行
    this.value = this.lazy ? undefined : this.get();
  }
  evalute() {
    // 获取到用户函数的返回值，并标识为脏
    this.value = this.get();
    this.dirty = false;
  }
  get() {
    // 将自己添加到Dep的静态属性上，让之后每个dep都可以添加到这个watch
    pushTarget(this);
    // 这个getter就是更新函数
    let value = this.getter.call(this.vm);
    // 将这个静态属性置为空
    popTarget();
    return value;
  }
  update() {
    // 当dep是计算属性
    // 当依赖的值发生变化时dirty是脏值
    if (this.lazy) {
      this.dirty = true;
    }
    // 重新渲染，这里为了防止多次更新视图，采用了事件环的方式合并多次操作
    queueWatcher(this);
  }
  depend() {
    let i = this.deps.length;
    while (i--) {
      this.deps[i].depend(); //让计算属性watcher也收集渲染watcher
    }
  }
  addDep(dep) {
    // 一个组件对应着多个属性，重复的属性也不用记录
    let id = dep.id;
    if (!this.depsId.has(id)) {
      this.deps.push(dep);
      this.depsId.add(id);
      dep.addSub(this);
    }
  }
  run() {
    let oldValue = this.value;
    let newValue = this.get();
    // user标识用户自定义的watcher
    if (this.user) {
      // 监控的值（dep）会收集watcher，如果监控的值(dep)发生了改变，就会执行对应的回调
      this.cb.call(this.vm, newValue, oldValue);
    }
  }
}
let queue = [];
let has = {};
let pending = false;
function flushSchedulerQueue() {
  let flushQueue = queue.slice(0);
  flushQueue.forEach((q) => {
    q.run();
  });
  queue = [];
  has = {};
  pending = false;
}
function queueWatcher(watcher) {
  const id = watcher.id;
  if (!has[id]) {
    queue.push(watcher);
    has[id] = true;
    //    不论update执行多少次，只执行一轮刷新操作
    // 多次操作只走第一次，后面的操作都会被放到队列里，等第一次执行完后下一个事件环执行
    if (!pending) {
      timerFunc(flushSchedulerQueue);
      pending = true;
    }
  }
}
let callbacks = [];
let waiting = false;
function flushCallbacks() {
  let cbs = callbacks.slice(0);
  cbs.forEach((cb) => cb());
  waiting = false;
  callbacks = [];
}
// nextTick不是创建了一个异步任务，而是将这个任务维护到了队列中
// nextTick内部采用优雅降级：promise->MutationObserver->setImmediate->setTimeout
let timerFunc;
if (Promise) {
  timerFunc = (fn) => {
    Promise.resolve().then(fn);
  };
} else if (MutationObserver) {
  // 这里传入的回调是异步任务
  timerFunc = (fn) => {
    let observe = new MutationObserver(fn);
    let textNode = document.createElement(1);
    observe.observe(textNode, {
      characterData: true,
    });
    textNode.textContent = 2;
  };
} else if (setImmediate) {
  timerFunc = (fn) => {
    setImmediate(fn);
  };
} else {
  timerFunc = (fn) => {
    setTimeout(fn, 0);
  };
}
export const nextTick = function (cb) {
  callbacks.push(cb);
  if (!waiting) {
    timerFunc(flushCallbacks);
    waiting = true;
  }
};
// 需要给每个属性增加dep,
// n个属性对应一个视图，n个dep对应一个watcher
// 一个属性对应多个视图 1个dep对应多个watcher
// 多对多关系
export default Watcher;
