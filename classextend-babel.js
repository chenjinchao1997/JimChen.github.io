"use strict";

function _typeof(obj) {
  "@babel/helpers - typeof";
  if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
    _typeof = function _typeof(obj) {
      return typeof obj;
    };
  } else {
    _typeof = function _typeof(obj) {
      return obj &&
        typeof Symbol === "function" &&
        obj.constructor === Symbol &&
        obj !== Symbol.prototype
        ? "symbol"
        : typeof obj;
    };
  }
  return _typeof(obj);
}

function _get(target, property, receiver) {
  if (typeof Reflect !== "undefined" && Reflect.get) {
    _get = Reflect.get;
  } else {
    _get = function _get(target, property, receiver) {
      var base = _superPropBase(target, property);
      if (!base) return;
      var desc = Object.getOwnPropertyDescriptor(base, property);
      if (desc.get) {
        return desc.get.call(receiver);
      }
      return desc.value;
    };
  }
  return _get(target, property, receiver || target);
}

function _superPropBase(object, property) {
  while (!Object.prototype.hasOwnProperty.call(object, property)) {
    object = _getPrototypeOf(object);
    if (object === null) break;
  }
  return object;
}

function _inherits(subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function");
  }
  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: { value: subClass, writable: true, configurable: true },
  });
  if (superClass) _setPrototypeOf(subClass, superClass);
}

function _setPrototypeOf(o, p) {
  _setPrototypeOf =
    Object.setPrototypeOf ||
    function _setPrototypeOf(o, p) {
      o.__proto__ = p;
      return o;
    };
  return _setPrototypeOf(o, p);
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

function _possibleConstructorReturn(self, call) {
  if (call && (_typeof(call) === "object" || typeof call === "function")) {
    return call;
  }
  return _assertThisInitialized(self);
}

function _assertThisInitialized(self) {
  if (self === void 0) {
    throw new ReferenceError(
      "this hasn't been initialised - super() hasn't been called"
    );
  }
  return self;
}

function _isNativeReflectConstruct() {
  if (typeof Reflect === "undefined" || !Reflect.construct) return false;
  if (Reflect.construct.sham) return false;
  if (typeof Proxy === "function") return true;
  try {
    Date.prototype.toString.call(Reflect.construct(Date, [], function () {}));
    return true;
  } catch (e) {
    return false;
  }
}

function _getPrototypeOf(o) {
  _getPrototypeOf = Object.setPrototypeOf
    ? Object.getPrototypeOf
    : function _getPrototypeOf(o) {
        return o.__proto__ || Object.getPrototypeOf(o);
      };
  return _getPrototypeOf(o);
}

function _classStaticPrivateMethodGet(receiver, classConstructor, method) {
  if (receiver !== classConstructor) {
    throw new TypeError("Private static access of wrong provenance");
  }
  return method;
}

function _classStaticPrivateFieldSpecGet(
  receiver,
  classConstructor,
  descriptor
) {
  if (receiver !== classConstructor) {
    throw new TypeError("Private static access of wrong provenance");
  }
  if (descriptor.get) {
    return descriptor.get.call(receiver);
  }
  return descriptor.value;
}

function _instanceof(left, right) {
  if (
    right != null &&
    typeof Symbol !== "undefined" &&
    right[Symbol.hasInstance]
  ) {
    return !!right[Symbol.hasInstance](left);
  } else {
    return left instanceof right;
  }
}

function _classCallCheck(instance, Constructor) {
  if (!_instanceof(instance, Constructor)) {
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
  return Constructor;
}

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true,
    });
  } else {
    obj[key] = value;
  }
  return obj;
}

function _classPrivateMethodGet(receiver, privateSet, fn) {
  if (!privateSet.has(receiver)) {
    throw new TypeError("attempted to get private field on non-instance");
  }
  return fn;
}

function _classPrivateFieldGet(receiver, privateMap) {
  var descriptor = privateMap.get(receiver);
  if (!descriptor) {
    throw new TypeError("attempted to get private field on non-instance");
  }
  if (descriptor.get) {
    return descriptor.get.call(receiver);
  }
  return descriptor.value;
}

var A = /*#__PURE__*/ (function () {
  function A(name) {
    _classCallCheck(this, A);

    _prFunc.add(this);

    _propgetter.set(this, {
      get: _get_propgetter,
      set: void 0,
    });

    _prop.set(this, {
      writable: true,
      value: "A#prop",
    });

    this.name = name;
  }

  _createClass(
    A,
    [
      {
        key: "Afunction",
        value: function Afunction() {
          console.log(this, this.name);
          console.log(_classPrivateFieldGet(this, _prop));
          console.log(
            _classPrivateMethodGet(this, _prFunc, _prFunc2).call(this)
          );
        },
      },
    ],
    [
      {
        key: "stAfunc",
        value: function stAfunc() {
          console.log(this);
          return this;
        },
      },
    ]
  );

  return A;
})();

var _prop = new WeakMap();

var _propgetter = new WeakMap();

var _prFunc = new WeakSet();

var _get_propgetter = function _get_propgetter() {
  return "A#propgetter";
};

_defineProperty(A, "stprop", 0);

var _prFunc2 = function _prFunc2() {
  return "pr";
};

var B = /*#__PURE__*/ (function (_A) {
  _inherits(B, _A);

  var _super = _createSuper(B);

  function B(name, id) {
    var _this;

    _classCallCheck(this, B);

    _this = _super.call(this, name);

    _prop2.set(_assertThisInitialized(_this), {
      writable: true,
      value: "B#prop",
    });

    _this.id = id;
    return _this;
  }

  _createClass(
    B,
    [
      {
        key: "Bfunction",
        value: function Bfunction() {
          console.log(this, this.id);
          console.log(_classPrivateFieldGet(this, _prop2));
          console.log(_classStaticPrivateFieldSpecGet(this, B, _pstprop));
          console.log(
            _classStaticPrivateMethodGet(this, B, _stFunc).call(this)
          );

          _get(_getPrototypeOf(B.prototype), "Afunction", this).call(this);
        },
      },
    ],
    [
      {
        key: "stBfunc",
        value: function stBfunc() {
          console.log(this);
          return this;
        },
      },
    ]
  );

  return B;
})(A);

var _prop2 = new WeakMap();

var _stFunc = function _stFunc() {
  return _classStaticPrivateFieldSpecGet(this, B, _pstprop);
};

_defineProperty(B, "stprop", 1);

var _pstprop = {
  writable: true,
  value: 1,
};

var b = new B("asd");
