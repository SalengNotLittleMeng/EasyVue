import { initMixin } from "./init";
import { initLifeCycle } from "./lifecycle";
function Vue(options) {
  this._init(options);
}
// 扩展了init方法
initMixin(Vue);
initLifeCycle(Vue);
export default Vue;
