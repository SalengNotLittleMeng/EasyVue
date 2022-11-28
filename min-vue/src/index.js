import { initMixin } from "./init";
import { initLifeCycle } from "./lifecycle";
import { initStateMixin } from "./state";
import { complieToFunction } from "./compiler/index";
import { createElm, patch } from "./vdom/patch";
function Vue(options) {
  this._init(options);
}
// 扩展了init方法

initMixin(Vue);
// 提供了_update()和_render两个方法
initLifeCycle(Vue);
// 实现了$nextTick和$watch
initStateMixin(Vue);

// diff算法是一个平级比较的过程，父亲不能跟儿子进行比对

let render = complieToFunction(`<div style="color: red">
    <li key="a">a</li>
    <li key="b">b</li>
    <li key="c">c</li>
    <li key="d">d</li>
</div>`);
let vm1 = new Vue({ data: { name: "zf" } });
let preNode = render.call(vm1);
let el = createElm(preNode);

let render2 = complieToFunction(`<div style="color: red ;background: blue;">
    <li key="b">b</li>
    <li key="c">c</li>
    <li key="d">d</li>
    <li key="a">a</li>
</div>`);
let vm2 = new Vue({ data: { name: "zf" } });
let nextVode = render2.call(vm1);
patch(preNode, nextVode);
// console.log(preNode)
// console.log(nextVode)
document.body.appendChild(el);
export default Vue;
