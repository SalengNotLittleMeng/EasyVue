import { initMixin } from "./init";
function Vue(options) {
  this._init(options);
}
// 扩展了init方法
initMixin(Vue);
export default Vue;
