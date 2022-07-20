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

  var Observe = /*#__PURE__*/ (function () {
    function Observe(data) {
      _classCallCheck(this, Observe);

      // Object.defineProperty只能劫持已经存在的属性
      this.walk(data);
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

  // 给Vue增加初始化方法
  function initMixin(Vue) {
    Vue.prototype._init = function (options) {
      var vm = this;
      vm.$options = options;
      initState(vm);
    };
  }

  function Vue(options) {
    this._init(options);
  } // 扩展了init方法

  initMixin(Vue);

  return Vue;
});
//# sourceMappingURL=vue.js.map
