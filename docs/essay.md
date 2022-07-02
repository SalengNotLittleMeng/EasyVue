## 入口文件

构建出来的入口文件路径：src/platforms/web/entry-runtime-with-compiler.js：

其中Vue的路径：src/platforms/web/runtime/index.js

初始化Vue的路径：src/core/index.js

Vue是一个构造函数，它可以传入到其他函数中扩展Vue的功能，相比于class更具可扩展性

Vue在初始化的过程中会在它的原型链和Vue本身上挂载方法和属性

被挂载在Vue上的静态方法：

```js
config
Vue.util = {
    warn,
    extend,
    mergeOptions,
    defineReactive
  }
 Vue.set = set
  Vue.delete = del
  Vue.nextTick = nextTick
// ASSET_TYPES是component,directive,filter
  Vue.options = Object.create(null)
  ASSET_TYPES.forEach(type => {
    Vue.options[type + 's'] = Object.create(null)
  })
```
属于内置自定义指令的只有v-show 和v-model

## 数据驱动

### Vue初始化

在new Vue时会调用_init方法，而这个方法是在initMixin这个方法中被挂载到Vue的原型链上的

vue初始化做的几件事：

合并配置，初始化生命周期，初始化事件中心，初始化渲染，初始化 data、props、computed、watcher 等等。

```js
    initLifecycle(vm)
    initEvents(vm)
    initRender(vm)
    callHook(vm, 'beforeCreate')
    initInjections(vm) // resolve injections before data/props
    initState(vm)
    initProvide(vm) // resolve provide after data/props
    callHook(vm, 'created')
```
### mount

mount是通过原型链上$mount这个方法实现的，Vue会先缓存原先的方法，再重新实现这个方法，这样做的目的是原先的方法可以被runtime only直接复用，而新实现的方法可以支持模板语法和挂载点的语法
原先原型上的 $mount 方法在 src/platform/web/runtime/index.js

这个方法做了限制，Vue 不能挂载在 body、html 这样的根节点上；Vue始终会调用render方法去渲染视图，如果没有这个方法，Vue会调用compileToFunctions 方法将el或模板转化为render方法，最终这个方法会去调用mountComponent（src/core/instance/lifecycle.js）这个方法，这个方法会生成虚拟DOM并更新节点，同时执行生命周期

