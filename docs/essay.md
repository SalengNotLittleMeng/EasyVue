## 入口文件

构建出来的入口文件路径：src/platforms/web/entry-runtime-with-compiler.js：

其中 Vue 的路径：src/platforms/web/runtime/index.js

初始化 Vue 的路径：src/core/index.js

Vue 是一个构造函数，它可以传入到其他函数中扩展 Vue 的功能，相比于 class 更具可扩展性

Vue 在初始化的过程中会在它的原型链和 Vue 本身上挂载方法和属性

被挂载在 Vue 上的静态方法：

```js
config;
Vue.util = {
  warn,
  extend,
  mergeOptions,
  defineReactive,
};
Vue.set = set;
Vue.delete = del;
Vue.nextTick = nextTick;
// ASSET_TYPES是component,directive,filter
Vue.options = Object.create(null);
ASSET_TYPES.forEach((type) => {
  Vue.options[type + "s"] = Object.create(null);
});
```

属于内置自定义指令的只有 v-show 和 v-model

## 数据驱动

### Vue 初始化

在 new Vue 时会调用\_init 方法，而这个方法是在 initMixin 这个方法中被挂载到 Vue 的原型链上的

vue 初始化做的几件事：

合并配置，初始化生命周期，初始化事件中心，初始化渲染，初始化 data、props、computed、watcher 等等。

```js
initLifecycle(vm);
initEvents(vm);
initRender(vm);
callHook(vm, "beforeCreate");
initInjections(vm); // resolve injections before data/props
initState(vm);
initProvide(vm); // resolve provide after data/props
callHook(vm, "created");
```

### mount

mount 是通过原型链上$mount 这个方法实现的，Vue 会先缓存原先的方法，再重新实现这个方法，这样做的目的是原先的方法可以被 runtime only 直接复用，而新实现的方法可以支持模板语法和挂载点的语法
原先原型上的 $mount 方法在 src/platform/web/runtime/index.js

这个方法做了限制，Vue 不能挂载在 body、html 这样的根节点上；Vue 始终会调用 render 方法去渲染视图，如果没有这个方法，Vue 会调用 compileToFunctions 方法将 el 或模板转化为 render 方法，最终这个方法会去调用 mountComponent（src/core/instance/lifecycle.js）这个方法，这个方法会生成虚拟 DOM 并更新节点，同时执行生命周期

v-if 编译时会变成三元表达式（编译时进行）

v-for 编译时会变成\_l 函数

v-show 编译时会变成自定义指令（运行时进行）

v-show 会根据原先的 display 属性作为原始 display（不会出现块元素转变的问题）

v-model 会在内部用 compsing 去优化输入（不会在打字时监听），他包括模板语法和自定义指令两个部分组成，会根据 input 的值去更改绑定方法

v-model 可以绑定组件，该组件传入一个 model 对象，自定义 props 和 emit，可以手动触发绑定，如果没有传入则为 value 和 input 事件

vue .sync 修饰符的作用：跟 v-model 一样，实现状态同步(解决重名问题)，在绑定的组件内部可以用 update：xx 触发事件调用，（跟 v-model 类似）

Vue.ues:会进行缓存，如果已经注册过直接返回 this

组件中写 name 的作用：在 Vue 中，有 name 属性的组件可以被递归调用（递归调用需要用 v-if=false 来显示终止），在声明组件的时候如果有 name，则有 Sub.options.components[name]=Sub,将自己的构造函数放在了选项上
