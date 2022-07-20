// 给Vue增加初始化方法
export function initMixin(Vue) {
  Vue.prototype._init = function (options) {
    const vm = this;
    vm.$options = options;
    initState(vm);
  };
}
function initState(vm) {
  const opts = vm.$options;
  if (opts.data) {
    initData(vm);
  }
}

function initData(vm) {
  let { data } = vm.$options;
  data = typeof data == "function" ? data.call(vm) : data;
  console.log(data);
}
