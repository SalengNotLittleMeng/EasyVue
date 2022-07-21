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
        console.log("用户取值了", value);
        return value;
      },
      set: function set(newValue) {
        console.log("用户修改值了", newValue);
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

  function complieToFunction() {}

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
          var render = complieToFunction();
          opts.render = render;
        }
      }
    };
  } // script标签引入的vue，编译过程在浏览器
  // runtime是不包含编译的，编译时通过loader进行转译.vue文件，用runtime不能使用template(在mian.js中，.vue文件有loader转译，因此不影响)
  // 包含main.js中模板编译的版本是runtime-with-compiler

  function Vue(options) {
    this._init(options);
  } // 扩展了init方法

  initMixin(Vue);

  return Vue;
});
//# sourceMappingURL=vue.js.map
