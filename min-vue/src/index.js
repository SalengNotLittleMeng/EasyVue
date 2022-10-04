import { initMixin } from "./init";
import { initLifeCycle } from "./lifecycle";
import { nextTick } from "./observe/watcher";
function Vue(options) {
  this._init(options);
}
// 扩展了init方法

Vue.prototype.$nextTick = nextTick;
initMixin(Vue);
initLifeCycle(Vue);
export default Vue;
