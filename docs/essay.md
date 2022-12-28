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

普通的插槽在父组件当中渲染数据，并注入到子组件，编译时组件的孩子变成插槽，放到 compentOptions 上；元素的孩子编译成子元素

获取到插槽后会进行转化成具名对象（映射表）（默认为 default），对象值是插槽的虚拟节点（数组）。这个对象会被挂载在在 vm.$slot上，之后会合并到$scopeSlots

当模板编译解析到 slot 时，会编译成\_t 函数，这个函数的参数是需要插槽的名称，\_t 执行时会返回名称对应插槽虚拟节点

作用域插槽不会作为 children，而是会转化成 scopedSlots

作用域插槽会编译\_u 函数,利用映射表将 slot 和父元素进行对应,稍后渲染组件模板的时候，会通过 name 找到对应的函数，将数据传入对应的函数后，才用虚拟节点替换真实节点，实现使用子作用域的数据

keep-alive 是一个虚拟组件，通过获取插槽（$slot）来获取渲染的内容，其会寻找第一个组件，在判断是否有缓存后缓存其实例，内部维护的缓存表是通过组件的 cid+tag 生成 key 来进行判断的，内部维护缓存的算法是 lru 算法

缓存直接通过组件实例对应挂载的 el，因此切换组件时不会走挂载的生命周期，相当于走了更新的流程

vue 修饰符会修改模板编译时，自动生成一些代码，比如 prevent 编译为 vent.preventDefault()，也有一部分会编译为特殊的事件（增加前缀），比如 once，capture，来在运行时生效

Vue.$set 方法：vm.age.**ob**.dep.notify(),如果通过索引给数组对象添加则调用 splice 方法，如果给对象添加最后要调用 defineReactive 方法

diff 算法是评级比较，双方一方有儿子，一方没有则增删，如果都有儿子则进行双端对比（头头，尾尾，交叉对比），如果双端对比失败则开始维护映射表，
用新的去映射表中查找该元素是否存在，如果存在则移动，不存在则插入，最后删除多余的节点

vue3 增加了最长子序列算法，来降低无效的节点移动（保留相对位置）
