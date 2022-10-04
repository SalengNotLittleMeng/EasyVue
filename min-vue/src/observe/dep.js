let id = 0;
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
Dep.target = null;
export default Dep;
