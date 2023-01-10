import { install, Vue } from "./install";
import createMatcher from "./create-matcher";
class VueRouter {
  constructor(options) {
    // 对用户传入的路由表进行映射
    const routes = options.routes;
    this.matcher = createMatcher(routes);
    // 根据不用的模式创建不同的路由系统
    let mode = options.mode || "hash";
    if (mode == "hash") {
      this.history;
    } else if (mode == "history") {
    }
  }
}
VueRouter.install = install;
export default VueRouter;
