(function (global, factory) {
  typeof exports === "object" && typeof module !== "undefined"
    ? (module.exports = factory())
    : typeof define === "function" && define.amd
    ? define(factory)
    : ((global =
        typeof globalThis !== "undefined" ? globalThis : global || self),
      (global.Vue = factory()));
})(this, function () {
  "use strict";

  function _typeof(obj) {
    "@babel/helpers - typeof";

    return (
      (_typeof =
        "function" == typeof Symbol && "symbol" == typeof Symbol.iterator
          ? function (obj) {
              return typeof obj;
            }
          : function (obj) {
              return obj &&
                "function" == typeof Symbol &&
                obj.constructor === Symbol &&
                obj !== Symbol.prototype
                ? "symbol"
                : typeof obj;
            }),
      _typeof(obj)
    );
  }

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    Object.defineProperty(Constructor, "prototype", {
      writable: false,
    });
    return Constructor;
  }

  function _slicedToArray(arr, i) {
    return (
      _arrayWithHoles(arr) ||
      _iterableToArrayLimit(arr, i) ||
      _unsupportedIterableToArray(arr, i) ||
      _nonIterableRest()
    );
  }

  function _arrayWithHoles(arr) {
    if (Array.isArray(arr)) return arr;
  }

  function _iterableToArrayLimit(arr, i) {
    var _i =
      arr == null
        ? null
        : (typeof Symbol !== "undefined" && arr[Symbol.iterator]) ||
          arr["@@iterator"];

    if (_i == null) return;
    var _arr = [];
    var _n = true;
    var _d = false;

    var _s, _e;

    try {
      for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) {
        _arr.push(_s.value);

        if (i && _arr.length === i) break;
      }
    } catch (err) {
      _d = true;
      _e = err;
    } finally {
      try {
        if (!_n && _i["return"] != null) _i["return"]();
      } finally {
        if (_d) throw _e;
      }
    }

    return _arr;
  }

  function _unsupportedIterableToArray(o, minLen) {
    if (!o) return;
    if (typeof o === "string") return _arrayLikeToArray(o, minLen);
    var n = Object.prototype.toString.call(o).slice(8, -1);
    if (n === "Object" && o.constructor) n = o.constructor.name;
    if (n === "Map" || n === "Set") return Array.from(o);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n))
      return _arrayLikeToArray(o, minLen);
  }

  function _arrayLikeToArray(arr, len) {
    if (len == null || len > arr.length) len = arr.length;

    for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];

    return arr2;
  }

  function _nonIterableRest() {
    throw new TypeError(
      "Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."
    );
  }

  var id$1 = 0; // 每一个dep都表示一个被依赖的数据，当这个数据变化，跟这些数据关联的视图会同步变化

  var Dep = /*#__PURE__*/ (function () {
    function Dep() {
      _classCallCheck(this, Dep);

      this.id = id$1++;
      this.subs = [];
    }

    _createClass(Dep, [
      {
        key: "depend",
        value: function depend() {
          // 不希望放置重复的watcher
          // 这里在添加一个watch时，这个watch也会将这个dep添加到自己的观察队列中
          Dep.target.addDep(this);
        }, // 这个方法是让watcher将自己添加到观察队列的
      },
      {
        key: "addSub",
        value: function addSub(watcher) {
          this.subs.push(watcher);
        }, // 通知所有观察了这个dep的watch更新视图
      },
      {
        key: "notify",
        value: function notify() {
          this.subs.forEach(function (watcher) {
            watcher.update();
          });
        },
      },
    ]);

    return Dep;
  })();

  var stack = [];
  function pushTarget(watcher) {
    stack.push(watcher);
    Dep.target = watcher;
  }
  function popTarget() {
    stack.pop();
    Dep.target = stack[stack.length - 1];
  }

  // 我们希望保留原数组特性并重写部分数组方法
  var oldArrayProto = Array.prototype;
  var newArrayProto = Object.create(oldArrayProto); // 所有变异方法

  var methods = [
    "push",
    "shift",
    "unshift",
    "splice",
    "pop",
    "reverse",
    "sort",
  ];
  methods.forEach(function (method) {
    newArrayProto[method] = function () {
      var _oldArrayProto$method;

      for (
        var _len = arguments.length, args = new Array(_len), _key = 0;
        _key < _len;
        _key++
      ) {
        args[_key] = arguments[_key];
      }

      // 内部调用原来的方法
      var result = (_oldArrayProto$method = oldArrayProto[method]).call.apply(
        _oldArrayProto$method,
        [this].concat(args)
      );

      var ob = this.__ob__; // 将数组中新增的方法进行响应式劫持

      var inserted;

      switch (method) {
        case "push":
        case "unshift":
          inserted = args;
          break;

        case "splice":
          inserted = args.slice(2);
      }

      if (inserted) {
        ob.observeArray(inserted);
      } // 数组变化后通知对应的 watcher实现更新

      ob.dep.notify();
      return result;
    };
  });

  var Observe = /*#__PURE__*/ (function () {
    // 给每个对象都增加收集功能
    // 要给数组和对象本身也增加dep,如果用户增添了属性或数组新增了一项，都会触发dep
    function Observe(data) {
      _classCallCheck(this, Observe);

      // 给数据添加一个表示__ob__,被标识的数据标识已经被观测过了
      //data.__ob__=this 直接将this添加到__ob__后，会导致遍历可观测对象时遍历到this，形成死循环
      // 添加属性__ob__并将这个属性设置为不可枚举，使其在遍历时无法被遍历
      this.dep = new Dep();
      Object.defineProperty(data, "__ob__", {
        value: this,
        enumerable: false,
      });

      if (Array.isArray(data)) {
        // 用户一般不会通过索引调用数组的值，直接遍历又会导致性能问题
        //因此我们可以通过重写数组7个变异方法的方式来监控数据变化
        //同时应该考虑数组中对象的劫持
        data.__proto__ = newArrayProto;
        this.observeArray(data); //监控数组中的对象,只将数组中的对象进行挂载
      } else {
        this.walk(data);
      } // Object.defineProperty只能劫持已经存在的属性
    }

    _createClass(Observe, [
      {
        key: "walk",
        value: function walk(data) {
          //循环对象，对属性依次劫持,重新定义属性
          Object.keys(data).forEach(function (key) {
            defineReactive(data, key, data[key]);
          });
        },
      },
      {
        key: "observeArray",
        value: function observeArray(data) {
          data.forEach(function (item) {
            observe(item);
          });
        },
      },
    ]);

    return Observe;
  })();

  function dependArray(value) {
    // 对数组的每一个元素进行观察
    for (var i = 0; i < value.length; i++) {
      // 如果数组中有对象（有__ob__表示是对象且被标记过），那么需要将数组中的所有对象进行观测
      value[i].__ob__ && value[i].__ob__.dep.depend(); // 如果数组中的子元素还是数组，则继续递归

      if (Array.isArray(value[i])) {
        dependArray(value[i]);
      }
    }
  }

  function defineReactive(target, key, value) {
    // 闭包，从外部拿到value
    // 如果劫持到的属性依然是一个对象，就应该递归劫持所有属性，深度属性劫持
    var childOb = observe(value); // 每一个属性都有一个dep，这里是闭包，因此变量不会销毁

    var dep = new Dep();
    Object.defineProperty(target, key, {
      get: function get() {
        // 如果Dep.target不为null,证明这个属性被某个watch依赖
        if (Dep.target) {
          dep.depend();

          if (childOb) {
            // 让数组和对象也实现依赖收集
            // 如果出现对象套对象的情况，就将这个属性继续放入dep队列观察，深度遍历
            childOb.dep.depend(); // 当出现数组套数组的情况时，进行深度遍历

            if (Array.isArray(value)) {
              dependArray(value);
            }
          }
        }

        return value;
      },
      set: function set(newValue) {
        if (newValue == value) return;
        value = newValue; // 通知所有依赖这个属性的watch更新视图

        dep.notify();
      },
    });
  }
  function observe(data) {
    if (_typeof(data) != "object" || data == null) {
      return; //只对对象进行劫持
    } //判断对象是否被劫持过，需要用一个实例来观测判断

    return new Observe(data);
  }

  var id = 0; // 解析一般data时只会创建一个渲染watcher，当解析计算属性时，会按栈结构去创建计算属性watcher
  // watcher的作用时：当依赖的dep发生更新时，对应地触发某些操作（比如重新渲染）

  var Watcher = /*#__PURE__*/ (function () {
    function Watcher(vm, fn, options) {
      _classCallCheck(this, Watcher);

      this.id = id++;
      this.renderWatcher = vm.options; // getter意味着调用这个函数会发生取值

      this.getter = fn; // 让watcher去记住所有dep，后续实现计算属性和清理工作需要使用

      this.deps = [];
      this.depsId = new Set();
      this.lazy = options.lazy;
      this.dirty = this.lazy;
      this.vm = vm; // 计算属性第一次并不执行

      this.lazy ? undefined : this.get();
    }

    _createClass(Watcher, [
      {
        key: "evalute",
        value: function evalute() {
          // 获取到用户函数的返回值，并标识为脏
          this.value = this.get();
          this.dirty = false;
        },
      },
      {
        key: "get",
        value: function get() {
          // 将自己添加到Dep的静态属性上，让之后每个dep都可以添加到这个watch
          pushTarget(this); // 这个getter就是更新函数

          var value = this.getter.call(this.vm); // 将这个静态属性置为空

          popTarget();
          return value;
        },
      },
      {
        key: "update",
        value: function update() {
          // 当dep是计算属性
          // 当依赖的值发生变化时dirty是脏值
          if (this.lazy) {
            this.dirty = true;
          } // 重新渲染，这里为了防止多次更新视图，采用了事件环的方式合并多次操作

          queueWatcher(this);
        },
      },
      {
        key: "depend",
        value: function depend() {
          var i = this.deps.length;

          while (i--) {
            this.deps[i].depend(); //让计算属性watcher也收集渲染watcher
          }
        },
      },
      {
        key: "addDep",
        value: function addDep(dep) {
          // 一个组件对应着多个属性，重复的属性也不用记录
          var id = dep.id;

          if (!this.depsId.has(id)) {
            this.deps.push(dep);
            this.depsId.add(id);
            dep.addSub(this);
          }
        },
      },
      {
        key: "run",
        value: function run() {
          this.get();
        },
      },
    ]);

    return Watcher;
  })();

  var queue = [];
  var has = {};
  var pending = false;

  function flushSchedulerQueue() {
    var flushQueue = queue.slice(0);
    flushQueue.forEach(function (q) {
      q.run();
    });
    queue = [];
    has = {};
    pending = false;
  }

  function queueWatcher(watcher) {
    var id = watcher.id;

    if (!has[id]) {
      queue.push(watcher);
      has[id] = true; //    不论update执行多少次，只执行一轮刷新操作
      // 多次操作只走第一次，后面的操作都会被放到队列里，等第一次执行完后下一个事件环执行

      if (!pending) {
        timerFunc(flushSchedulerQueue);
        pending = true;
      }
    }
  }

  var callbacks = [];
  var waiting = false;

  function flushCallbacks() {
    var cbs = callbacks.slice(0);
    cbs.forEach(function (cb) {
      return cb();
    });
    waiting = false;
    callbacks = [];
  } // nextTick不是创建了一个异步任务，而是将这个任务维护到了队列中
  // nextTick内部采用优雅降级：promise->MutationObserver->setImmediate->setTimeout

  var timerFunc;

  if (Promise) {
    timerFunc = function timerFunc(fn) {
      Promise.resolve().then(fn);
    };
  } else if (MutationObserver) {
    // 这里传入的回调是异步任务
    timerFunc = function timerFunc(fn) {
      var observe = new MutationObserver(fn);
      var textNode = document.createElement(1);
      observe.observe(textNode, {
        characterData: true,
      });
      textNode.textContent = 2;
    };
  } else if (setImmediate) {
    timerFunc = function timerFunc(fn) {
      setImmediate(fn);
    };
  } else {
    timerFunc = function timerFunc(fn) {
      setTimeout(fn, 0);
    };
  }

  var nextTick = function nextTick(cb) {
    callbacks.push(cb);

    if (!waiting) {
      timerFunc(flushCallbacks);
      waiting = true;
    }
  }; // 需要给每个属性增加dep,

  function initState(vm) {
    var opts = vm.$options;

    if (opts.data) {
      initData(vm);
    }

    if (opts.computed) {
      initComputed(vm);
    }
  }

  function proxy(vm, target, key) {
    Object.defineProperty(vm, key, {
      get: function get() {
        return vm[target][key];
      },
      set: function set(newValue) {
        vm[target][key] = newValue;
      },
    });
  }

  function initData(vm) {
    var data = vm.$options.data;
    data = typeof data == "function" ? data.call(vm) : data;
    vm._data = data;
    observe(data);

    for (var key in data) {
      proxy(vm, "_data", key);
    }
  }

  function initComputed(vm) {
    var computed = vm.$options.computed;
    var watchers = (vm._computedWatchers = {});

    for (var key in computed) {
      var userDef = computed[key]; // 我们需要监控计算属性中get的变化

      var fn = typeof userDef === "function" ? userDef : userDef.get; // 如果直接new watcher，默认立即执行fn

      watchers[key] = new Watcher(vm, fn, {
        lazy: true,
      });
      defineComputed(vm, key, userDef);
    }
  }

  function defineComputed(target, key, userDef) {
    typeof userDef === "function" ? userDef : userDef.get;

    var setter = userDef.set || function () {};

    Object.defineProperty(target, key, {
      get: createComputedGatter(key),
      set: setter,
    });
  } // 计算属性不会手收集依赖，只会让自己的依赖属性去收集依赖

  function createComputedGatter(key) {
    // 检测是否执行gatter
    return function () {
      // 获取到对应属性的watcher
      var watcher = this._computedWatchers[key];

      if (watcher.dirty) {
        // 如果是脏的，就去执行用户传入的函数
        watcher.evalute(); // 求值后dirty变为false，下次就不求值了
      }

      if (Dep.target) {
        // 计算属性出栈后还有渲染watcher,应该让计算属性watcher里的属性也去收集渲染watcher
        watcher.depend();
      } // 最后返回的是watch上的值

      return watcher.value;
    };
  }

  var ncname = "[a-zA-Z_][\\-\\.0-9_a-zA-Z]*"; // 下面的这个正则中的：表示匹配命名空间：<div:XXX>

  var qnameCapture = "((?:".concat(ncname, "\\:)?").concat(ncname, ")"); // 匹配前标签开始 <div

  var startTagOpen = new RegExp("^<".concat(qnameCapture)); // 匹配结束的标签

  var endTag = new RegExp("^<\\/".concat(qnameCapture, "[^>]>*>")); // 匹配属性,第一个分组是属性的key，属性的值是分组3/4/5

  var attribute =
    /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>']+)))?/; //匹配前标签结束

  var startTagClose = /^\s*(\/?)>/; // 匹配{{}}

  function parseHTML(html) {
    var ELEMENT_TYPE = 1;
    var TEXT_TYPE = 3;
    var stack = [];
    var currentParent;
    var root; // 创建节点

    function createASTElement(tag, attrs) {
      return {
        tag: tag,
        type: ELEMENT_TYPE,
        children: [],
        attrs: attrs,
        parent: null,
      };
    }

    function advance(n) {
      html = html.substring(n);
    } // 在解析的各个阶段建立一颗ast语法树

    function start(tag, attrs) {
      var node = createASTElement(tag, attrs);

      if (!root) {
        root = node;
      } // 如果有栈中有值，就将栈中最后一个元素作为parent

      if (currentParent) {
        // 这里要同时建立节点的父子关系
        node.parent = currentParent;
        currentParent.children.push(node);
      } // 将当前的节点推入栈中，并更新当前的父节点

      stack.push(node);
      currentParent = node;
    }

    function end(tag) {
      // 出栈并更新当前父节点
      stack.pop();
      currentParent = stack[stack.length - 1];
    }

    function _char(text) {
      // 处理文本节点
      text = text.replace(/\s/g, "");
      text &&
        currentParent.children.push({
          type: TEXT_TYPE,
          text: text,
          parent: currentParent,
        });
    } // 解析开始标签，收集属性

    function parseStartTag() {
      var start = html.match(startTagOpen);

      if (start) {
        var match = {
          tagName: [start[1]],
          //标签名
          attrs: [],
        };
        advance(start[0].length); // 如果不是开始标签的结束，就一直匹配下去

        var attr, _end;

        while (
          !(_end = html.match(startTagClose)) &&
          (attr = html.match(attribute))
        ) {
          advance(attr[0].length);
          match.attrs.push({
            name: attr[1],
            value: attr[3] || attr[4] || attr[5] || true,
          });
        }

        if (_end) {
          advance(_end[0].length);
        }

        return match;
      }

      return false;
    }

    while (html) {
      // textEnd如果为0，就是一个开始标签或结束标签
      //textEnd>0,说明是一个文本
      var textEnd = html.indexOf("<"); //如果indexOf中的索引是0，就是一个标签

      if (textEnd == 0) {
        var startTagMatch = parseStartTag();

        if (startTagMatch) {
          // 解析到开始标签
          start(startTagMatch.tagName, startTagMatch.attrs);
          continue;
        }

        var endTagMatch = html.match(endTag);

        if (endTagMatch) {
          advance(endTagMatch[0].length);
          end(endTagMatch[1]);
          continue;
        }
      }

      if (textEnd > 0) {
        var text = html.substring(0, textEnd); //文本内容

        if (text) {
          _char(text);

          advance(text.length);
        }

        continue;
      }
    }

    return root;
  }

  var defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g;

  function genProps(attrs) {
    var str = "";

    for (var i = 0; i < attrs.length; i++) {
      var attr = attrs[i]; // style要做特殊处理

      if (attr.name == "style") {
        (function () {
          var obj = {};
          attr.value.split(";").forEach(function (item) {
            var _item$split = item.split(":"),
              _item$split2 = _slicedToArray(_item$split, 2),
              key = _item$split2[0],
              value = _item$split2[1];

            obj[key] = value;
          });
          attr.value = obj;
        })();
      }

      str += "".concat(attr.name, ":").concat(JSON.stringify(attr.value), ",");
    }

    return "{".concat(str.slice(0, -1), "}");
  } // 将children生成代码

  function genChildren(children) {
    if (children) {
      return children
        .map(function (child) {
          return gen(child);
        })
        .join(",");
    }
  }

  function gen(node) {
    // 如果有子节点就递归生成
    if (node.type === 1) {
      return codegen(node);
    } else {
      var text = node.text;

      if (!defaultTagRE.test(text)) {
        // 文本节点直接格式化处理
        return "_v(".concat(JSON.stringify(text), ")");
      } else {
        // 操作模板语法，将模板语法替换为变量
        var tokens = [];
        var match; // 注意这里将正则的lastIndex重置为0，每次的行为一致

        defaultTagRE.lastIndex = 0;
        var lastIndex = 0;

        while ((match = defaultTagRE.exec(text))) {
          var index = match.index;

          if (index > lastIndex) {
            // 添加模板引擎之前/之后的内容
            tokens.push(JSON.stringify(text.slice(lastIndex, index)));
          } // 将模板中的变量添加进去

          tokens.push("_s(".concat(match[1].trim(), ")"));
          lastIndex = index + match[0].length;
        }

        if (lastIndex < text.length) {
          // 添加一般的文本
          tokens.push(JSON.stringify(text.slice(lastIndex)));
        }

        return "_v(".concat(tokens.join("+"), ")");
      }
    }
  } // 将ast语法树生成render函数

  function codegen(ast) {
    var children = genChildren(ast.children);
    var code = "_c('"
      .concat(ast.tag, "',")
      .concat(ast.attrs.length > 0 ? genProps(ast.attrs) : "null")
      .concat(ast.children.length ? ",".concat(children) : "", ")");
    return code;
  }

  function complieToFunction(template) {
    var ast = parseHTML(template);
    var code = codegen(ast); // 绑定this并利用Function生成函数

    code = "with(this){return ".concat(code, "}");
    var render = new Function(code);
    return render;
  }

  function createElementVNode(vm, tag, data) {
    if (data == null) {
      data = {};
    }

    var key = data.key;

    if (key) {
      delete data.key;
    }

    for (
      var _len = arguments.length,
        children = new Array(_len > 3 ? _len - 3 : 0),
        _key = 3;
      _key < _len;
      _key++
    ) {
      children[_key - 3] = arguments[_key];
    }

    return vnode(vm, tag, key, data, children);
  }
  function createTextVNode(vm, text) {
    return vnode(vm, undefined, undefined, undefined, undefined, text);
  } // ast是描述JS，css,等语言本身的情况的
  // 虚拟dom是描述dom节点的

  function vnode(vm, tag, key, data, children, text) {
    return {
      vm: vm,
      tag: tag,
      key: key,
      data: data,
      children: children,
      text: text,
    };
  }

  function createElm(vnode) {
    var tag = vnode.tag,
      data = vnode.data,
      children = vnode.children,
      text = vnode.text;

    if (typeof tag == "string") {
      // 将真实节点和虚拟节点进行对应，为后续diff算法做准备
      vnode.el = document.createElement(tag);
      patchProps(vnode.el, data);
      children.forEach(function (child) {
        vnode.el.appendChild(createElm(child));
      });
    } else {
      vnode.el = document.createTextNode(text);
    }

    return vnode.el;
  }

  function patchProps(el, props) {
    for (var key in props) {
      if (key == "style") {
        for (var styleName in props.style) {
          el.style[styleName] = props.style[styleName];
        }
      } else {
        el.setAttribute(key, props[key]);
      }
    }
  }

  function patch(oldVNode, vnode) {
    var isRealElement = oldVNode.nodeType;

    if (isRealElement) {
      // 获取真实元素
      var elm = oldVNode; // 拿到父元素

      var parentElm = elm.parentNode;
      var newElm = createElm(vnode);
      parentElm.insertBefore(newElm, elm.nextSibiling);
      parentElm.removeChild(elm);
      return newElm;
    }
  }

  function initLifeCycle(Vue) {
    Vue.prototype._update = function (vnode) {
      // patch既有初始化功能，又有更新的功能
      var vm = this;
      var el = vm.$el;
      vm.$el = patch(el, vnode);
    };

    Vue.prototype._render = function () {
      // 渲染时会去实例上取值
      var vm = this;
      return vm.$options.render.call(this); //转移后生产的 render方法
    }; // 创造虚拟节点

    Vue.prototype._c = function () {
      return createElementVNode.apply(
        void 0,
        [this].concat(Array.prototype.slice.call(arguments))
      );
    }; // 创建文本虚拟节点

    Vue.prototype._v = function () {
      return createTextVNode.apply(
        void 0,
        [this].concat(Array.prototype.slice.call(arguments))
      );
    }; // 创建普通文字节点

    Vue.prototype._s = function (value) {
      if (_typeof(value) !== "object") return value;
      return JSON.stringify(value);
    };
  }
  function mountComponent(vm, el) {
    vm.$el = el;

    var updateComponent = function updateComponent() {
      vm._update(vm._render()); //vm.$options.render,返回虚拟节点
    }; // 1.调用render方法，产生虚拟dom

    new Watcher(vm, updateComponent, true); // 2.根据虚拟dom产生真实dom
    // 3.插入到el元素中
  } // 将模板转化为ast模板语法树，ast转化为render函数，后续每次数据更新只执行render函数（无需再转化ast）
  // render函数会产生虚拟节点，根据创造的虚拟节点创造真实Dom

  // 给Vue增加初始化方法
  function initMixin(Vue) {
    Vue.prototype._init = function (options) {
      var vm = this;
      vm.$options = options;
      initState(vm);

      if (options.el) {
        vm.$mount(options.el);
      }
    };

    Vue.prototype.$mount = function (el) {
      var vm = this;
      el = document.querySelector(el);
      var opts = vm.$options;
      console.log(opts); // 当没有render函数时

      if (!(opts !== null && opts !== void 0 && opts.render)) {
        var template = null; // 没有模板但写了el

        if (!opts.template && opts.el) {
          template = el.outerHTML; // 存在模板或不存在模板和el
        } else {
          // 存在模板
          if (opts.template) {
            template = opts.template;
          } else {
            // 既没有模板也没有el
            template = "<div></div>";
          }
        } //拿到模板
        // 获取优先级：render=>temple=>el

        if (template) {
          var render = complieToFunction(template);
          opts.render = render;
        }
      }

      mountComponent(vm, el);
    };
  } // script标签引入的vue，编译过程在浏览器
  // runtime是不包含编译的，编译时通过loader进行转译.vue文件，用runtime不能使用template(在mian.js中，.vue文件有loader转译，因此不影响)
  // 包含main.js中模板编译的版本是runtime-with-compiler

  function Vue(options) {
    this._init(options);
  } // 扩展了init方法

  Vue.prototype.$nextTick = nextTick;
  initMixin(Vue);
  initLifeCycle(Vue);

  return Vue;
});
//# sourceMappingURL=vue.js.map
