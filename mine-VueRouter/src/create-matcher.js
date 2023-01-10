import createRouteMap from "./create-routesMap";
export default function createMatcher(routes) {
  let { pathMap } = createRouteMap(routes);
  function addRoutes(routes) {
    // 动态添加路由
    createRouteMap(routes, pathMap);
  }
  function addRoute(route) {
    createRouteMap([route], pathMap);
  }
  function match(location) {
    return pathMap[location];
  }
  return {
    addRoutes, //添加多个路由
    addRoute, //添加一个路由
    match, //给一个路径来返回路由
  };
}
