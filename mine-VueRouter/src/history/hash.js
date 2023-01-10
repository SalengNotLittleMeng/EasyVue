import Base from "./base";
function ensureSlash() {
  if (window.location.hash) {
    return;
  }
  window.location.hash = "/";
}
function getHash() {
  // 截取，获取真正的hash值
  return window.location.hash.slice(1);
}
class Hash extends Base {
  constructor(router) {
    super(router);
    // 初始化哈希路由的时候要给定默认的哈希路径
    ensureSlash();
  }
  // 之后需要调用此方法，监控hash值的变化
  setupListener() {
    window.addEventListener("hashchange", function () {
      console.log(getHash());
    });
  }
  getCurrentLocation() {
    return getHash();
  }
}
export default Hash;
