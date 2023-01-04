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

虚拟 dom 的优势：跨平台，底层不受限制,无需考虑兼容性问题，同时可以跟 diff 算法配合减小更新幅度

inject/provide:在孙子组件中注入属性（非响应式）

- provide:在当前组件上提供了一个 provide 属性（增加了一个对象）
- inject 会将设置的 inject 在上层的 provide 中进行递归查找，找到后将其用 defineReactive 定义在当前组件实例上（递归向上层的$parent 中进行查找，找到一个就停止）

$attrs:所有组件上的属性，不包括 props。配置上有属性 inheritAttrs 来标识组件的属性是否都要放在组件的根元素上

$listeners:组件上所有绑定的事件

这两个属性都是用 defineReactive 进行定义的，因此都是响应式的

组件的渲染流程：

    * 利用vue.extend生成组件构造函数((Ctor)解析到非内置标签，去options中寻找注册的组件，尝试走缓存，extend生成子类，子类继承Vue的原型并合并配置)，
    * 根据组件产生虚拟节点，（添加生命周期钩子，添加事件，vnode上会挂载componentInstance和componentOptions，组件实例上有$el真实节点,$el会在vm._update的时候获取patch创建的真实节点）
    * 组件初始化，将虚拟节点转化为真实节点，new Sub().$mount()（调用挂载方法，生成render函数并调用，创建watcher）（createCompent->组件的init方法（$mount）,所有组件（children）循环创建真实节点并替换组件节点）
    * 当组件的渲染流程走完（真实节点替换了组件标签），组件的父组件会执行插入流程

组件更新的几种情况：

    *  data数据更新，依赖收集
    *  属性更新，可以给组件传入属性，属性变化后更新
    *  插槽变化更新

组件更新时会复用实例，并调用 updateChildComponent 方法，传入 props,插槽，事件进行比较（prepatch 方法）

之后，组件会：
_ 执行 toggleObserving(false),如果不是根组件，那么将可观测性暂时切换为 false，不再对其进行观测（props 已经被观测且是响应式了，防止重复响应式处理）
_ 更新属性，拿到新的 props 后用 validate 进行验证（类型和合法性，是否有对应的属性）
_ 更新 listners 和 attrs
_ 组件更新后会重新给 props 赋值，赋值完成后触发 watcher 更新（由于直接是父组件的响应式数据，因此父组件数据更新后子组件会同步更新）

vue 中的异步组件，主要用作比较大的组件进行异步加载。原理是先渲染一个注释标签，等组件加载完毕后重新渲染（forceUpdate 方法），类似于图片懒加载
使用异步组件会配合 webpack

组件渲染会确认 Ctor 实例是对象才会渲染，而异步组件的返回值是函数，因此第一次不会渲染

另外，由于异步组件的 Ctor 是函数,默认不会执行 Vue.extend 方法，，因此 Ctor 上没有 cid 属性，没有 cid 属性的就是异步组件，此时就会将 Ctor 赋值给 asyncFactory

解析异步组件时，会调用 resolveAsyncComonpent 方法并传入 asyncFactory 和 Vue,如果解析完返回值是 undefined，那么会创建一个异步组件的占位符（vnode）进行渲染，同时，组件的内部会组装出 Promise 的 resolve 和 reject 方法并向参数中的 Promise 中传入执行，如果返回值是 promise,就会调用 promsie.then，默认渲染 loading,如果状态为 resolve（更改 sync 状态）就渲染重新执行解析方法并生成虚拟节点

组件重新渲染后，factory 上的 resolved/error 已经被挂载实例，就会直接渲染，否则如果返回的依旧是 promise 的话，会递归执行，继续渲染 loading

函数式组件的好处：没有 watcher，性能更好。直接调用 render 创建 vnode,没有事件，data，生命周期等。更适合来做纯渲染的组件

由 prop 定义的属性才叫 prop，其余的属性会被收集在$attrs,生成组件实例时，会在组件的虚拟节点上增加componentOptions.propsData属性，最终这个属性会在实例化（虚拟dom转真实dom）时被挂载到vm.$options.propsData，最后在初始化（initProps）时挂载到 vm.\_props 上

初始化 prop 的过程中会将\_props 用 defineReactive 定义成响应式的，且会将 vm.\_props 的值代理到 vm 上(这里定义成响应式是保证修改 props 会更新视图，与 prop 传入时不会被重新观测不冲突)

组件更新会调用子组件的 prepatch,子组件就会对收到的 props 进行更新（修改 vm.\_props 触发响应式，data 更新同理）

总而言之，父组件中绑定的值是根据父组件的 data 进行响应式的，而在子组件中，prop 是重新定义的子组件内部的响应式，这两者是通过重新赋值（组件的 DataProp 和 vm.\_props 之间的转化）进行关联的，第一次渲染时\_props 会被定义响应式，之后每次父组件的属性变更，子组件的\_props 会被重新赋值而触发响应式

data 和 props 或 methods 重名时，会在初始化 data 时进行校验并抛出警告，但 props 的优先级更高

ref:可以获取真实节点或组件实例，虚拟 dom 无法拿到实例和组件，因此不会对 ref 做处理

ref 是在创建真实节点（patch 方法）时进行处理的

虚拟 dom 与平台无关，在创建真实 dom 前会走 createPatchFunction 的方法，将平台的节点操作和属性（包括 ref，指令，事件，样式的实现）操作方法传入来创建 patch 方法（相当于提供适配各个平台的接口），在创建节点时会执行创建节点的所有方法

ref 会通过判断当前节点是否为组件来返回组件实例或 dom（Elm）,之后会获取 vm 上的$ref 对象，通过判断 ref 是否在 v-for 循环中来决定是否将结果包装成数组
