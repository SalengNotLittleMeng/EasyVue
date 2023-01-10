export default class Base {
  constructor(router) {
    this.router = router;
  }
  // 所有跳转的逻辑都要放在transitionTo中来实现
  transitionTo(location, listener) {
    // 用之前的匹配方法
    let record = this.router.match(location);
    console.log(record);
    // 当路由切换的时候，也应该调用transitionTo拿到新的记录
    listener && listener();
  }
}
