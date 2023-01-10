(function (global, factory) {
  typeof exports === "object" && typeof module !== "undefined"
    ? (module.exports = factory())
    : typeof define === "function" && define.amd
    ? define(factory)
    : ((global =
        typeof globalThis !== "undefined" ? globalThis : global || self),
      (global.VueRouter = factory()));
})(this, function () {
  "use strict";

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

  function _inherits(subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
      throw new TypeError("Super expression must either be null or a function");
    }

    subClass.prototype = Object.create(superClass && superClass.prototype, {
      constructor: {
        value: subClass,
        writable: true,
        configurable: true,
      },
    });
    Object.defineProperty(subClass, "prototype", {
      writable: false,
    });
    if (superClass) _setPrototypeOf(subClass, superClass);
  }

  function _getPrototypeOf(o) {
    _getPrototypeOf = Object.setPrototypeOf
      ? Object.getPrototypeOf.bind()
      : function _getPrototypeOf(o) {
          return o.__proto__ || Object.getPrototypeOf(o);
        };
    return _getPrototypeOf(o);
  }

  function _setPrototypeOf(o, p) {
    _setPrototypeOf = Object.setPrototypeOf
      ? Object.setPrototypeOf.bind()
      : function _setPrototypeOf(o, p) {
          o.__proto__ = p;
          return o;
        };
    return _setPrototypeOf(o, p);
  }

  function _isNativeReflectConstruct() {
    if (typeof Reflect === "undefined" || !Reflect.construct) return false;
    if (Reflect.construct.sham) return false;
    if (typeof Proxy === "function") return true;

    try {
      Boolean.prototype.valueOf.call(
        Reflect.construct(Boolean, [], function () {})
      );
      return true;
    } catch (e) {
      return false;
    }
  }

  function _assertThisInitialized(self) {
    if (self === void 0) {
      throw new ReferenceError(
        "this hasn't been initialised - super() hasn't been called"
      );
    }

    return self;
  }

  function _possibleConstructorReturn(self, call) {
    if (call && (typeof call === "object" || typeof call === "function")) {
      return call;
    } else if (call !== void 0) {
      throw new TypeError(
        "Derived constructors may only return object or undefined"
      );
    }

    return _assertThisInitialized(self);
  }

  function _createSuper(Derived) {
    var hasNativeReflectConstruct = _isNativeReflectConstruct();

    return function _createSuperInternal() {
      var Super = _getPrototypeOf(Derived),
        result;

      if (hasNativeReflectConstruct) {
        var NewTarget = _getPrototypeOf(this).constructor;

        result = Reflect.construct(Super, arguments, NewTarget);
      } else {
        result = Super.apply(this, arguments);
      }

      return _possibleConstructorReturn(this, result);
    };
  }

  var Vue;
  function install(_Vue) {
    Vue = _Vue;
    Vue.mixin({
      beforeCreate: function beforeCreate() {
        // 这里不用原型继承的原因是因为会导致所有的Vue类共享路由
        if (this.$options.router) {
          // 根实例上传递了router
          this._routerRoot = this;
          this._router = this.$options.router || {};
        } else {
          var _this$$parent;

          // 所有组件上都增加一个routerRoot的指针指向根实例
          this._routerRoot =
            (_this$$parent = this.$parent) === null || _this$$parent === void 0
              ? void 0
              : _this$$parent._router;
        }
      },
    }); // 劫持$router属性，取$router其实是取了根实例上的router

    Object.defineProperty(Vue.prototype, "$router", {
      get: function get() {
        return this._routerRoot._router;
      },
    });
    Vue.component("router-link", {
      render: function render(h) {
        return h(
          "a",
          {
            class: "foo",
          },
          [this.$slots["default"]]
        );
      },
    });
    Vue.component("router-view", {
      render: function render(h) {
        return h(
          "a",
          {
            class: "foo",
          },
          ["hello"]
        );
      },
    });
  }

  function createRouteMap(routes) {
    var pathMap =
      arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    // 根据用户选项扁平化信息,将深度子类转化为扁平层级
    routes.forEach(function (route) {
      addRouteRecord(route, pathMap);
    });
    return {
      pathMap: pathMap,
    };
  }

  function addRouteRecord(route, pathMap, parentRecord) {
    var path = parentRecord
      ? "".concat(parentRecord.path == "/" ? "" : "/").concat(route.path)
      : route.path;

    if (!pathMap[path]) {
      pathMap[path] = {
        path: path,
        component: route.component,
        props: route.props,
        meta: route.meta,
      };
    }

    route.children.forEach(function (children) {
      addRouteRecord(children, pathMap);
    });
  }

  function createMatcher(routes) {
    var _createRouteMap = createRouteMap(routes),
      pathMap = _createRouteMap.pathMap;

    function addRoutes(routes) {
      // 动态添加路由
      createRouteMap(routes, pathMap);
    }

    function addRoute(route) {
      createRouteMap([route], pathMap);
    }

    function match(location) {
      return pathMap[location];
    }

    return {
      addRoutes: addRoutes,
      //添加多个路由
      addRoute: addRoute,
      //添加一个路由
      match: match, //给一个路径来返回路由
    };
  }

  var Base = /*#__PURE__*/ _createClass(function Base(router) {
    _classCallCheck(this, Base);
  });

  var History = /*#__PURE__*/ (function (_Base) {
    _inherits(History, _Base);

    var _super = _createSuper(History);

    function History(router) {
      _classCallCheck(this, History);

      return _super.call(this, router);
    }

    return _createClass(History);
  })(Base);

  function ensureSlash() {
    if (window.location.hash) {
      return;
    }

    window.location.hash = "/";
  }

  var Hash = /*#__PURE__*/ (function (_Base) {
    _inherits(Hash, _Base);

    var _super = _createSuper(Hash);

    function Hash(router) {
      var _this;

      _classCallCheck(this, Hash);

      _this = _super.call(this, router);
      console.log("hello"); // 初始化哈希路由的时候要给定默认的哈希路径

      ensureSlash();
      return _this;
    }

    return _createClass(Hash);
  })(Base);

  var VueRouter = /*#__PURE__*/ _createClass(function VueRouter(options) {
    _classCallCheck(this, VueRouter);

    console.log("111");
    this.install = install; // 对用户传入的路由表进行映射

    var routes = options.routes;
    this.matcher = createMatcher(routes); // 根据不用的模式创建不同的路由系统

    var mode = options.mode || "hash";

    if (mode == "hash") {
      this.history = new Hash();
    } else if (mode == "history") {
      this.history = new History();
    }
  });

  return VueRouter;
});
//# sourceMappingURL=vue.js.map
