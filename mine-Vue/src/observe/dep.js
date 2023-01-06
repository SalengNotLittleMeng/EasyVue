let id = 0;
// 每一个dep都表示一个被依赖的数据，当这个数据变化，跟这些数据关联的视图会同步变化
class Dep {
  constructor() {
    this.id = id++;
    this.subs = [];
  }
  depend() {
    // 不希望放置重复的watcher
    // 这里在添加一个watch时，这个watch也会将这个dep添加到自己的观察队列中
    Dep.target.addDep(this);
  }
  // 这个方法是让watcher将自己添加到观察队列的
  addSub(watcher) {
    this.subs.push(watcher);
  }
  // 通知所有观察了这个dep的watch更新视图
  notify() {
    this.subs.forEach((watcher) => {
      watcher.update();
    });
  }
}
let stack = [];
export function pushTarget(watcher) {
  stack.push(watcher);
  Dep.target = watcher;
}
export function popTarget() {
  stack.pop();
  Dep.target = stack[stack.length - 1];
}
export default Dep;
