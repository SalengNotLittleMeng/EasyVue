import Base from "./base";
function ensureSlash() {
  if (window.location.hash) {
    return;
  }
  window.location.hash = "/";
}
class Hash extends Base {
  constructor(router) {
    super(router);
    console.log("hello");
    // 初始化哈希路由的时候要给定默认的哈希路径
    ensureSlash();
  }
  // 之后需要调用此方法，监控hash值的变化
  setupListener() {}
}
export default Hash;
