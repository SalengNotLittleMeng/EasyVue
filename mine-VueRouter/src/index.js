import { install, Vue } from "./install";
import createMatcher from "./create-matcher";
import History from "./history/history";
import Hash from "./history/hash";
class VueRouter {
  constructor(options) {
    this.install = install;
    this.beforeEachHooks = [];
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
  beforeEach(cb) {
    this.beforeEachHooks.push(cb);
  }
  match(path) {
    return this.matcher.match(path);
  }
  push(location) {
    return this.history.push(location);
  }
  init(app) {
    let history = this.history;
    // 根据路径变化，匹配不同的组件进行渲染，路径变化，更新视图，路径需要是响应式的
    history.transitionTo(history.getCurrentLocation(), () => {
      history.setupListener(); //监听路由变化
    });
    // 每次路由需要调用listen中的方法实现更新_route的值，使他能够发生变化，重新渲染视图
    history.listen((newRoute) => {
      app._route = newRoute;
    });
  }
}
export default VueRouter;
