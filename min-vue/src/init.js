// 给Vue增加初始化方法
export function initMixin(Vue) {
  Vue.prototype._init = function () {
    console.log("hello");
  };
}
