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
}
export default Hash;
