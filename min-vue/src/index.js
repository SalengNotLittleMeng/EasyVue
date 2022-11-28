import { initMixin } from "./init";
import { initLifeCycle } from "./lifecycle";
import { initStateMixin } from "./state";
import { complieToFunction } from "./compiler/index";
import { createElm, patch } from "./vdom/patch";
import { initGlobalAPI } from "./gloablAPI";
function Vue(options) {
  this._init(options);
}
// 扩展了init方法

initMixin(Vue);
// 提供了_update()和_render两个方法
initLifeCycle(Vue);
// 实现了$nextTick和$watch
initStateMixin(Vue);
// 实现全局API
initGlobalAPI(Vue);
// diff算法是一个平级比较的过程，父亲不能跟儿子进行比对
export default Vue;
