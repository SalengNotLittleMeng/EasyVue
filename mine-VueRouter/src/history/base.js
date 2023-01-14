function createRoute(record, location) {
  let matched = [];
  if (record) {
    while (record) {
      matched.unshift(record);
      record = record.parent;
    }
  }
  return {
    ...location,
    matched,
  };
}
function runQueue(queue, from, to, cb) {
  function next(index) {
    if (index >= queue.length) {
      return cb();
    }
    let hook = queue[index];
    hook(from, to, () => next(index + 1));
  }
  next(0);
}
export default class Base {
  constructor(router) {
    this.router = router;
    // 每次更新的是current，每次current变化，我们就可以切换页面
    this.current = createRoute(null, {
      path: "/",
    });
  }
  // 所有跳转的逻辑都要放在transitionTo中来实现
  transitionTo(location, listener) {
    // 用之前的匹配方法
    let record = this.router.match(location);
    let route = createRoute(record, { path: location });
    // 这里需要取消点击进入和路由变化中的两次重复变化，注意path='/'时可能会匹配组件
    if (
      location == this.current.path &&
      route.matched.length == this.current.matched.length
    ) {
      return;
    }
    let queue = [].concat(this.router.beforeEachHooks);
    // 钩子执行完后再做跳转
    runQueue(queue, this.current, route, () => {
      this.current = route;
      // path:'/',matched:[]
      // 当路由切换的时候，也应该调用transitionTo拿到新的记录
      listener && listener();
      this.cb && this.cb(route);
    });
  }
  listen(cb) {
    // 用户自定义的钩子 this._route=route
    this.cb = cb;
  }
}
