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
      }

      return result;
    };
  });

  var Observe = /*#__PURE__*/ (function () {
    function Observe(data) {
      _classCallCheck(this, Observe);

      // 给数据添加一个表示__ob__,被标识的数据标识已经被观测过了
      //data.__ob__=this 直接将this添加到__ob__后，会导致遍历可观测对象时遍历到this，形成死循环
      // 添加属性__ob__并将这个属性设置为不可枚举，使其在遍历时无法被遍历
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
      } // Object.defineProperty只能劫持已经存在的属性l
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

  function defineReactive(target, key, value) {
    // 闭包，从外部拿到value
    // 如果劫持到的属性依然是一个对象，就应该递归劫持所有属性，深度属性劫持
    observe(value);
    Object.defineProperty(target, key, {
      get: function get() {
        return value;
      },
      set: function set(newValue) {
        if (newValue == value) return;
        value = newValue;
      },
    });
  }
  function observe(data) {
    if (_typeof(data) != "object" || data == null) {
      return; //只对对象进行劫持
    } //判断对象是否被劫持过，需要用一个实例来观测判断

    return new Observe(data);
  }

  function initState(vm) {
    var opts = vm.$options;

    if (opts.data) {
      initData(vm);
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
      }

      if (currentParent) {
        node.parent = currentParent;
        currentParent.children.push(node);
      }

      stack.push(node);
      currentParent = node;
    }

    function end(tag) {
      stack.pop();
      currentParent = stack[stack.length - 1];
    }

    function _char(text) {
      text = text.replace(/\s/g, "");
      text &&
        currentParent.children.push({
          type: TEXT_TYPE,
          text: text,
          parent: currentParent,
        });
    }

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
      var attr = attrs[i];

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
  }

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
    if (node.type === 1) {
      return codegen(node);
    } else {
      var text = node.text;

      if (!defaultTagRE.test(text)) {
        return "_v(".concat(JSON.stringify(text), ")");
      } else {
        var tokens = [];
        var match;
        defaultTagRE.lastIndex = 0;
        var lastIndex = 0;

        while ((match = defaultTagRE.exec(text))) {
          var index = match.index;

          if (index > lastIndex) {
            tokens.push(JSON.stringify(text.slice(lastIndex, index)));
          }

          tokens.push("_s(".concat(match[1].trim(), ")"));
          lastIndex = index + match[0].length;
        }

        if (lastIndex < text.length) {
          tokens.push(JSON.stringify(text.slice(lastIndex)));
        }

        return "_v(".concat(tokens.join("+"), ")");
      }
    }
  }

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
    var code = codegen(ast);
    code = "with(this){return ".concat(code, "}");
    var render = new Function(code);
    return render;
  }

  function createElementVNode(vm, tag) {
    var data =
      arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
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
  }

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

  function initLifeCycle(Vue) {
    Vue.prototype._update = function () {};

    Vue.prototype._render = function () {
      var vm = this;
      return vm.$options.render.call(this); //转移后生产的 render方法
    };

    Vue.prototype._c = function () {
      return createElementVNode.apply(
        void 0,
        [this].concat(Array.prototype.slice.call(arguments))
      );
    };

    Vue.prototype._v = function () {
      return createTextVNode.apply(
        void 0,
        [this].concat(Array.prototype.slice.call(arguments))
      );
    };

    Vue.prototype._s = function (value) {
      return JSON.stringify(value);
    };
  }
  function mountComponent(vm, el) {
    // 1.调用render方法，产生虚拟dom
    vm._update(vm._render()); //vm.$options.render,返回虚拟节点
    // 2.根据虚拟dom产生真实dom
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

      mountComponent(vm);
    };
  } // script标签引入的vue，编译过程在浏览器
  // runtime是不包含编译的，编译时通过loader进行转译.vue文件，用runtime不能使用template(在mian.js中，.vue文件有loader转译，因此不影响)
  // 包含main.js中模板编译的版本是runtime-with-compiler

  function Vue(options) {
    this._init(options);
  } // 扩展了init方法

  initMixin(Vue);
  initLifeCycle(Vue);

  return Vue;
});
//# sourceMappingURL=vue.js.map
