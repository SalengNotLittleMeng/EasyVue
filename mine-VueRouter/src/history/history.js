import Base from "./base";
class History extends Base {
  constructor(router) {
    super(router);
  }
  setupListener() {
    window.addEventListener("popstate", function () {
      this.transitionTo(getCurrentLocation());
    });
  }
  getCurrentLocation() {
    return window.location.pathname;
  }
  push(location) {
    this.transitionTo(location, () => {
      window.history.pushState({}, "", location);
    });
  }
}

export default History;
