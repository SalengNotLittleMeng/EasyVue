class Vue {
  constructor(options) {
    this.$options = options;
    this.$el = document.querySelector(options.el);
    this.$template = this.$el.innerHTML;
    this.initMethods();
    // 初始化数据前调用'beforeCreated'生命周期
    this.dispatchLifeCiryle("beforeCreated");
    this.initData();
    // 初始化数据后调用'created'生命周期
    this.dispatchLifeCiryle("created");
    this.patch();
    //挂载dom后调用mounted的生命周期
    this.dispatchLifeCiryle("mounted");
  }
  // 初始化data，进行响应式处理和数据劫持
  initData() {
    const vm = this;
    if (typeof vm.$options.data == "function") {
      this.$data = this.$options.data();
    } else {
      this.$data = this.$options.data;
    }
    Object.keys(this.$data).forEach((data) => {
      // 这里仅考虑了一般对象的情况，实际上vue会考虑数组（重写原型方法）和深度递归（遍历进行响应式处理）的情况
      Object.defineProperty(vm, data, {
        get() {
          return vm["$data"][data];
        },
        set(newValue) {
          vm["$data"][data] = newValue;
          vm.patch();
        },
      });
    });
  }
  // 调用生命周期方法
  dispatchLifeCiryle(name) {
    const fun = this.$options[name];
    if (fun) {
      fun.call(this);
    }
  }
  // 对methods进行初始化
  initMethods() {
    const methods = this.$options.methods || {};
    const vm = this;
    Object.keys(methods).forEach((method) => {
      if (typeof methods[method] === "function") {
        methods[method].bind(vm);
        Object.defineProperty(vm, method, {
          get() {
            return methods[method];
          },
        });
      }
    });
  }
  patch() {
    // 这里的patch方法仅为了便于理解更新的操作，实际完全不是这样渲染的
    // 真实的vue会将模板转化为虚拟dom,走diff算法对比并最终编译为render函数进行渲染
    const getAllBracketConetent = /\{\{([0-1a-zA-Z]+)\}\}/g;
    const resultList = this.$template.replaceAll(
      getAllBracketConetent,
      (current) => {
        const key = current.slice(2, -2);
        return this.$data[key];
      }
    );
    this.dispatchLifeCiryle("beforeUpdated");
    this.$el.innerHTML = resultList;
    this.dispatchLifeCiryle("updated");
  }
}
