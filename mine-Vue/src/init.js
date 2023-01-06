// 给Vue增加初始化方法
import { initState } from "./state";
import { complieToFunction } from "./compiler/index";
import { mountComponent } from "./lifecycle";
import { mergeOptions } from "./utils";
import { callHook } from "./lifecycle";
export function initMixin(Vue) {
  Vue.prototype._init = function (options) {
    const vm = this;
    // 将用户传入的选项和全局选项进行合并
    vm.$options = mergeOptions(this.constructor.options, options);
    console.log(vm.$options);
    callHook(vm, "beforeCreated");
    initState(vm);
    callHook(vm, "created");
    if (options.el) {
      vm.$mount(options.el);
    }
  };
  Vue.prototype.$mount = function (el) {
    const vm = this;
    el = document.querySelector(el);
    let opts = vm.$options;
    // 当没有render函数时
    if (!opts?.render) {
      let template = null;
      // 没有模板但写了el
      if (!opts.template && opts.el) {
        template = el.outerHTML;
        // 存在模板或不存在模板和el
      } else {
        // 存在模板
        if (opts.template) {
          template = opts.template;
        } else {
          // 既没有模板也没有el
          template = "<div></div>";
        }
      }
      //拿到模板
      // 获取优先级：render=>temple=>el
      if (template) {
        const render = complieToFunction(template);
        opts.render = render;
      }
    }
    mountComponent(vm, el);
  };
}
// script标签引入的vue，编译过程在浏览器
// runtime是不包含编译的，编译时通过loader进行转译.vue文件，用runtime不能使用template(在mian.js中，.vue文件有loader转译，因此不影响)
// 包含main.js中模板编译的版本是runtime-with-compiler
