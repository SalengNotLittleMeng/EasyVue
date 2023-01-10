export default function createRouteMap(routes, pathMap = {}) {
  // 根据用户选项扁平化信息,将深度子类转化为扁平层级
  routes.forEach((route) => {
    addRouteRecord(route, pathMap);
  });
  return {
    pathMap,
  };
}
function addRouteRecord(route, pathMap, parentRecord) {
  let path = parentRecord
    ? `${parentRecord.path == "/" ? "" : "/"}${route.path}`
    : route.path;
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
