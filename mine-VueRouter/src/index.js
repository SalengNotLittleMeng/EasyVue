import { install, Vue } from "./install";
import createMatcher from "./create-matcher";
import History from "./history/history";
import Hash from "./history/hash";
class VueRouter {
  constructor(options) {
    this.install = install;
    // 对用户传入的路由表进行映射
    const routes = options.routes;
    this.matcher = createMatcher(routes);
    // 根据不用的模式创建不同的路由系统
    let mode = options.mode || "hash";
    if (mode == "hash") {
      this.history = new Hash(this);
    } else if (mode == "history") {
      this.history = new History(this);
    }
  }
  match(path) {
    return this.matcher.match(path);
  }
  push(location) {
    this.history.transitionTo(location);
  }
  init(app) {
    let history = this.history;
    // 根据路径变化，匹配不同的组件进行渲染，路径变化，更新视图，路径需要是响应式的
    history.transitionTo(history.getCurrentLocation(), () => {
      history.setupListener(); //监听路由变化
    });
  }
}
export default VueRouter;
