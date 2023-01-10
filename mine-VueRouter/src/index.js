import { install, Vue } from "./install";
import createMatcher from "./create-matcher";
import History from "./history/history";
import Hash from "./history/hash";
class VueRouter {
  constructor(options) {
    // 对用户传入的路由表进行映射
    const routes = options.routes;
    this.matcher = createMatcher(routes);
    // 根据不用的模式创建不同的路由系统
    let mode = options.mode || "hash";
    if (mode == "hash") {
      this.history = new Hash();
    } else if (mode == "history") {
      this.history = new History();
    }
  }
}
VueRouter.install = install;
export default VueRouter;
