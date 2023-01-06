import { install, Vue } from "./install";
function createRouteMap(routes) {
  let pathMap = {};
  routes.forEach((route) => {
    addRouteRecord(route, pathMap);
  });
}
function addRouteRecord(route, pathMap) {
  let path = route.path;
  if (!pathMap[path]) {
    pathMap[path] = {
      path,
      component: route.component,
      props: route.props,
      meta: route.meta,
    };
  }
  route.children.forEach((children) => {
    addRouteRecord(children, pathMap);
  });
}
function createMatcher(routes) {
  function addRoute() {}
  function addRoutes() {}
  function match() {}
  return {
    addRoutes, //添加多个路由
    addRoute, //添加一个路由
    match, //给一个路径来返回路由
  };
}
class VueRouter {
  constructor(options) {
    // 对用户传入的路由表进行映射
    const routes = options.routes;
    this.matcher = createMatcher(routes);
  }
}
VueRouter.install = install;
export default VueRouter;
