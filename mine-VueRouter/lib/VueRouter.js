(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.VueRouter = factory());
})(this, (function () { 'use strict';

  function ownKeys(object, enumerableOnly) {
    var keys = Object.keys(object);

    if (Object.getOwnPropertySymbols) {
      var symbols = Object.getOwnPropertySymbols(object);
      enumerableOnly && (symbols = symbols.filter(function (sym) {
        return Object.getOwnPropertyDescriptor(object, sym).enumerable;
      })), keys.push.apply(keys, symbols);
    }

    return keys;
  }

  function _objectSpread2(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = null != arguments[i] ? arguments[i] : {};
      i % 2 ? ownKeys(Object(source), !0).forEach(function (key) {
        _defineProperty(target, key, source[key]);
      }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) {
        Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
      });
    }

    return target;
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
      writable: false
    });
    return Constructor;
  }

  function _defineProperty(obj, key, value) {
    if (key in obj) {
      Object.defineProperty(obj, key, {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true
      });
    } else {
      obj[key] = value;
    }

    return obj;
  }

  function _inherits(subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
      throw new TypeError("Super expression must either be null or a function");
    }

    subClass.prototype = Object.create(superClass && superClass.prototype, {
      constructor: {
        value: subClass,
        writable: true,
        configurable: true
      }
    });
    Object.defineProperty(subClass, "prototype", {
      writable: false
    });
    if (superClass) _setPrototypeOf(subClass, superClass);
  }

  function _getPrototypeOf(o) {
    _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function _getPrototypeOf(o) {
      return o.__proto__ || Object.getPrototypeOf(o);
    };
    return _getPrototypeOf(o);
  }

  function _setPrototypeOf(o, p) {
    _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) {
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
      Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {}));
      return true;
    } catch (e) {
      return false;
    }
  }

  function _assertThisInitialized(self) {
    if (self === void 0) {
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }

    return self;
  }

  function _possibleConstructorReturn(self, call) {
    if (call && (typeof call === "object" || typeof call === "function")) {
      return call;
    } else if (call !== void 0) {
      throw new TypeError("Derived constructors may only return object or undefined");
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

  var routerLink = {
    name: "router-link",
    props: {
      to: {
        type: String
      },
      tag: {
        type: String,
        "default": "a"
      }
    },
    methods: {
      handler: function handler() {
        this.$router.push(this.to);
      }
    },
    render: function render(h) {
      var _this = this;

      var tag = this.tag;
      return h(tag, {
        on: {
          click: function click() {
            _this.handler();
          }
        }
      }, [this.$slots["default"]]);
    }
  };

  var routerView = {
    name: "router-view",
    // router-view 不会被计入父子关系，应该被标识为抽象（函数式）组件
    functional: true,
    render: function render() {}
  };

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

          this._router.init(this); //this就是我们整个的应用(new Vue)
          // 给根实例添加一个属性_router,就是当前的current对象


          Vue.util.defineReactive(this, "_route", this._router.history.current);
        } else {
          var _this$$parent;

          // 所有组件上都增加一个routerRoot的指针指向根实例
          this._routerRoot = (_this$$parent = this.$parent) === null || _this$$parent === void 0 ? void 0 : _this$$parent._router;
        }
      }
    }); // 劫持$router属性，取$router其实是取了根实例上的router

    Object.defineProperty(Vue.prototype, "$router", {
      get: function get() {
        return this._routerRoot;
      }
    });
    Object.defineProperty(Vue.prototype, "$route", {
      get: function get() {
        return this._routerRoot && this._routerRoot._route;
      }
    }); // 内部修改的是current

    Vue.component("router-link", routerLink);
    Vue.component("router-view", routerView);
  }

  function createRouteMap(routes) {
    var pathMap = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    // 根据用户选项扁平化信息,将深度子类转化为扁平层级
    routes.forEach(function (route) {
      addRouteRecord(route, pathMap);
    });
    return {
      pathMap: pathMap
    };
  }

  function addRouteRecord(route, pathMap, parentRecord) {
    var path = parentRecord ? "".concat(parentRecord.path == "/" ? "" : "/").concat(route.path) : route.path;

    if (!pathMap[path]) {
      pathMap[path] = {
        path: path,
        component: route.component,
        props: route.props,
        meta: route.meta,
        parent: parentRecord
      };
    }

    route.children && route.children.forEach(function (children) {
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
      match: match //给一个路径来返回路由

    };
  }

  function createRoute(record, location) {
    var matched = [];

    if (record) {
      while (record) {
        matched.unshift(record);
        record = record.parent;
      }
    }

    return _objectSpread2(_objectSpread2({}, location), {}, {
      matched: matched
    });
  }

  var Base = /*#__PURE__*/function () {
    function Base(router) {
      _classCallCheck(this, Base);

      this.router = router; // 每次更新的是current，每次current变化，我们就可以切换页面

      this.current = createRoute(null, {
        path: "/"
      });
    } // 所有跳转的逻辑都要放在transitionTo中来实现


    _createClass(Base, [{
      key: "transitionTo",
      value: function transitionTo(location, listener) {
        // 用之前的匹配方法
        var record = this.router.match(location);
        var route = createRoute(record, {
          path: location
        }); // 这里需要取消点击进入和路由变化中的两次重复变化，注意path='/'时可能会匹配组件

        if (location == this.current.path && route.matched.length == this.current.matched.length) {
          return;
        }

        this.current = route; // path:'/',matched:[]
        // 当路由切换的时候，也应该调用transitionTo拿到新的记录

        listener && listener();
        this.cb && this.cb(route);
      }
    }, {
      key: "listen",
      value: function listen(cb) {
        // 用户自定义的钩子 this._route=route
        this.cb = cb;
      }
    }]);

    return Base;
  }();

  var History = /*#__PURE__*/function (_Base) {
    _inherits(History, _Base);

    var _super = _createSuper(History);

    function History(router) {
      _classCallCheck(this, History);

      return _super.call(this, router);
    }

    _createClass(History, [{
      key: "setupListener",
      value: function setupListener() {
        window.addEventListener("popstate", function () {
          console.log(this.window.location.pathname);
        });
      }
    }, {
      key: "getCurrentLocation",
      value: function getCurrentLocation() {
        return window.location.pathname;
      }
    }]);

    return History;
  }(Base);

  function ensureSlash() {
    if (window.location.hash) {
      return;
    }

    window.location.hash = "/";
  }

  function getHash() {
    // 截取，获取真正的hash值
    return window.location.hash.slice(1);
  }

  var Hash = /*#__PURE__*/function (_Base) {
    _inherits(Hash, _Base);

    var _super = _createSuper(Hash);

    function Hash(router) {
      var _this;

      _classCallCheck(this, Hash);

      _this = _super.call(this, router); // 初始化哈希路由的时候要给定默认的哈希路径

      ensureSlash();
      return _this;
    } // 之后需要调用此方法，监控hash值的变化


    _createClass(Hash, [{
      key: "setupListener",
      value: function setupListener() {
        var _this2 = this;

        // 这里会监听哈希的变化，通过修改url或回退也会触发
        window.addEventListener("hashchange", function () {
          _this2.transitionTo(getHash());
        });
      }
    }, {
      key: "getCurrentLocation",
      value: function getCurrentLocation() {
        return getHash();
      }
    }]);

    return Hash;
  }(Base);

  var VueRouter = /*#__PURE__*/function () {
    function VueRouter(options) {
      _classCallCheck(this, VueRouter);

      this.install = install; // 对用户传入的路由表进行映射

      var routes = options.routes;
      this.matcher = createMatcher(routes); // 根据不用的模式创建不同的路由系统

      var mode = options.mode || "hash";

      if (mode == "hash") {
        this.history = new Hash(this);
      } else if (mode == "history") {
        this.history = new History(this);
      }
    }

    _createClass(VueRouter, [{
      key: "match",
      value: function match(path) {
        return this.matcher.match(path);
      }
    }, {
      key: "push",
      value: function push(location) {
        this.history.transitionTo(location, function () {
          window.location.hash = location;
        });
      }
    }, {
      key: "init",
      value: function init(app) {
        var history = this.history; // 根据路径变化，匹配不同的组件进行渲染，路径变化，更新视图，路径需要是响应式的

        history.transitionTo(history.getCurrentLocation(), function () {
          history.setupListener(); //监听路由变化
        }); // 每次路由需要调用listen中的方法实现更新_route的值，使他能够发生变化，重新渲染视图

        history.listen(function (newRoute) {
          app._route = newRoute;
        });
      }
    }]);

    return VueRouter;
  }();

  return VueRouter;

}));
//# sourceMappingURL=VueRouter.js.map
