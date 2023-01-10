import Base from "./base";
class History extends Base {
  constructor(router) {
    super(router);
  }
  setupListener() {
    window.addEventListener("popstate", function () {
      console.log(this.window.location.pathname);
    });
  }
  getCurrentLocation() {
    return window.location.pathname;
  }
}

export default History;
