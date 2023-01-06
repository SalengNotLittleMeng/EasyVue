import Dep from "./observe/dep";
import { observe } from "./observe/index";
import Watcher from "./observe/watcher";
import { nextTick } from "./observe/watcher";
export function initState(vm) {
  const opts = vm.$options;
  if (opts.data) {
    initData(vm);
  }
  if (opts.computed) {
    initComputed(vm);
  }
  if (opts.watch) {
    initWatch(vm);
  }
}
function initWatch(vm) {
  let { watch } = vm.$options;
  for (let key in watch) {
    const handler = watch[key];
    if (Array.isArray(handler)) {
      for (let i = 0; i < handler.length; i++) {
        createWatcher(vm, key, handler[i]);
      }
    } else {
      createWatcher(vm, key, handler);
    }
  }
}

function createWatcher(vm, key, handler) {
  if (typeof handler === "string") {
    handler = vm[handler];
  }
  return vm.$watch(key, handler);
}
function proxy(vm, target, key) {
  Object.defineProperty(vm, key, {
    get() {
      return vm[target][key];
    },
    set(newValue) {
      vm[target][key] = newValue;
    },
  });
}
function initData(vm) {
  let { data } = vm.$options;
  data = typeof data == "function" ? data.call(vm) : data;
  vm._data = data;
  observe(data);
  for (let key in data) {
    proxy(vm, "_data", key);
  }
}

function initComputed(vm) {
  const computed = vm.$options.computed;
  const watchers = (vm._computedWatchers = {});
  for (let key in computed) {
    let userDef = computed[key];
    // 我们需要监控计算属性中get的变化
    let fn = typeof userDef === "function" ? userDef : userDef.get;
    // 如果直接new watcher，默认立即执行fn
    watchers[key] = new Watcher(vm, fn, { lazy: true });
    defineComputed(vm, key, userDef);
  }
}

function defineComputed(target, key, userDef) {
  const getter = typeof userDef === "function" ? userDef : userDef.get;
  const setter = userDef.set || (() => {});
  Object.defineProperty(target, key, {
    get: createComputedGatter(key),
    set: setter,
  });
}
// 计算属性不会手收集依赖，只会让自己的依赖属性去收集依赖
function createComputedGatter(key) {
  // 检测是否执行gatter
  return function () {
    // 获取到对应属性的watcher
    const watcher = this._computedWatchers[key];
    if (watcher.dirty) {
      // 如果是脏的，就去执行用户传入的函数
      watcher.evalute();
      // 求值后dirty变为false，下次就不求值了
    }
    if (Dep.target) {
      // 计算属性出栈后还有渲染watcher,应该让计算属性watcher里的属性也去收集渲染watcher
      watcher.depend();
    }
    // 最后返回的是watch上的值
    return watcher.value;
  };
}

export function initStateMixin(Vue) {
  Vue.prototype.$nextTick = nextTick;
  // 所有watch方法的底层都是在调用$watch
  Vue.prototype.$watch = function (exprOrFn, cb, options = {}) {
    // expOrFn可能是一个变量，也可能是函数
    new Watcher(this, exprOrFn, { user: true }, cb);
  };
}
