# babel 是如何实现继承以及各种类特性

## 转换前代码 转换后代码

首先我们写一个 ES6 语法下的继承：

```javascript
class A {
  #prop = "A#prop";
  get #propgetter() {
    return "A#propgetter";
  }
  static stprop = 0;
  constructor(name) {
    this.name = name;
  }

  #prFunc() {
    return "pr";
  }

  Afunction() {
    console.log(this, this.name);
    console.log(this.#prop);
    console.log(this.#prFunc());
  }

  static stAfunc() {
    console.log(this);
    return this;
  }
}

class B extends A {
  #prop = "B#prop";
  static stprop = 1;
  static #pstprop = 1;
  constructor(name, id) {
    super(name);
    this.id = id;
  }

  Bfunction() {
    console.log(this, this.id);
    console.log(this.#prop);
  }

  static stBfunc() {
    console.log(this);
    return this;
  }
}
```

在[babel 官网](https://babel.docschina.org/repl)上可以直接转换，本文使用了 `es2015` `stage-2`，使用了插件 `@babel/plugin-syntax-class-properties`。下面是转换后的代码。

```javascript
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

_defineProperty(B, "stprop", 1);

var _pstprop = {
  writable: true,
  value: 1,
};
```

## 属性、方法的定义

转换之后比较长，我们一步步分析。

首先，babel 定义了 class A：

```javascript
// 原代码定义
class A {
  #prop = "A#prop";
  // 注意这里即使是相当新的浏览器也不支持私有属性的getter Edge 83.0.478.44 chrome 83.0.4103.61
  get #propgetter() {
    return "A#propgetter";
  }
  static stprop = 0;
  constructor(name) {
    this.name = name;
  }

  // 同时不支持私有方法 Edge 83.0.478.44 chrome 83.0.4103.61
  #prFunc() {
    return "pr";
  }

  Afunction() {
    console.log(this, this.name);
    console.log(this.#prop);
    console.log(this.#prFunc());
  }

  static stAfunc() {
    console.log(this);
    return this;
  }
}

// 通过匿名函数进行定义
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
```

这里利用闭包在一个匿名函数内部创建了 A 函数，一共使用了三个辅助函数，`_classCallCheck` `_createClass` `_classPrivateFieldGet`。同时使用了[WeakMap](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/WeakMap)辅助实例化私有属性,[WeakSet](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/WeakSet)辅助实例化私有方法。

按照执行顺序先看 `_createClass`。

```javascript
function _createClass(Constructor, protoProps, staticProps) {
  // protoProps:
  // [
  //   {
  //     key: "Afunction",
  //     value: function Afunction() {
  //       console.log(this, this.name);
  //       console.log(this.#prop);
  //     },
  //   },
  // ]
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  // staticProps:
  // [
  //   {
  //     key: "stAfunc",
  //     value: function stAfunc() {
  //       console.log(this);
  //       return this;
  //     },
  //   },
  // ]
  if (staticProps) _defineProperties(Constructor, staticProps);
  return Constructor;
}

// Object.defineProperty 定义对象属性
function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}
```

这里利用了[Object.defineProperty](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty)来对对象属性和对象静态方法进行处理，并挂载到函数 A 的 prototype 和 A （静态方法）本身上。同时也使用 `_defineProperties` 函数在匿名函数之外对 A 的静态属性 `stprop` 初始化。

接下来是 A 的实例过程。

```javascript
// A的定义
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
```

首先是 `_classCallCheck` 。

```javascript
// 调用语句
_classCallCheck(this, A);

function _classCallCheck(instance, Constructor) {
  if (!_instanceof(instance, Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
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
```

`Symbol.hasInstance` 是一个确定一个构造器对象识别的对象是否为它的实例的方法。被 `instanceof` 使用。这里就是查看对应类有没有自定义的方法供 instanceof 调用，有则优先直接使用该方法。

接下来是私有属性和方法的赋值。

```javascript
_prFunc.add(this);

_propgetter.set(this, {
  get: _get_propgetter,
  set: void 0,
});

_prop.set(this, {
  writable: true,
  value: "A#prop",
});

// 这里 _prop 是全局变量 如果在原代码中也同时定义了 _prop 这里则会变成 _prop2
// WeakMap 可以简单理解为 Map
var _prop = new WeakMap();
var _propgetter = new WeakMap();
// WeakSet 简单理解为 Set
var _prFunc = new WeakSet();

var _get_propgetter = function _get_propgetter() {
  return "A#propgetter";
};

_defineProperty(A, "stprop", 0);

var _prFunc2 = function _prFunc2() {
  return "pr";
};
```

为什么要使用 `WeakMap` `WeakSet` 呢？这两个的共同特点就是只持有内部对象的弱引用，在没有其他引用的时候可以不干预垃圾回收。这样可以避免对象内的属性 或方法由于被外部的 map 或 set 一直引用导致无法触发垃圾回收。

接下来关注`_classPrivateFieldGet` `_classPrivateMethodGet`看私有属性和私有方法如何调用:

调用处

```javascript
// 转换前
console.log(this.#prop);
console.log(this.#prFunc());
// 转换后
console.log(_classPrivateFieldGet(this, _prop));
console.log(_classPrivateMethodGet(this, _prFunc, _prFunc2).call(this));
```

```javascript
// 获取私有属性
function _classPrivateFieldGet(receiver, privateMap) {
  // 通过实例本身作为key 获取定义
  var descriptor = privateMap.get(receiver);
  if (!descriptor) {
    throw new TypeError("attempted to get private field on non-instance");
  }
  // 如果是getter 使用getter函数取值
  if (descriptor.get) {
    return descriptor.get.call(receiver);
  }
  // 普通取值走这边
  return descriptor.value;
}

// 获取私有方法
function _classPrivateMethodGet(receiver, privateSet, fn) {
  // set收集了所有A实例的对应私有属性
  if (!privateSet.has(receiver)) {
    throw new TypeError("attempted to get private field on non-instance");
  }
  return fn;
}
```

## 继承

接下来是对继承的分析，直接从 B 的定义开始分析：

原定义

```javascript
class B extends A {
  #prop = "B#prop";
  static stprop = 1;
  static #pstprop = 1;
  constructor(name, id) {
    super(name);
    this.id = id;
  }

  Bfunction() {
    console.log(this, this.id);
    console.log(this.#prop);
  }

  static stBfunc() {
    console.log(this);
    return this;
  }
}
```

转换后

```javascript
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

_defineProperty(B, "stprop", 1);

var _pstprop = {
  writable: true,
  value: 1,
};
```

除了跟 A 定义过程中重复的步骤外，这里还多加了一个静态私有属性 `static #pstprop = 1;`，和私有静态方法 。
如果进行调用，则会转化为如下:

```javascript
this.#pstprop;
this.#stFunc();
// 对应
console.log(_classStaticPrivateFieldSpecGet(this, B, _pstprop));
console.log(_classStaticPrivateMethodGet(this, B, _stFunc).call(this));

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
  // 检查调用方是否B本身
  if (receiver !== classConstructor) {
    throw new TypeError("Private static access of wrong provenance");
  }
  // 同_classPrivateFieldGet
  if (descriptor.get) {
    return descriptor.get.call(receiver);
  }
  return descriptor.value;
}
```

静态私有方法比私有方法更简单，通过转换代码把私有方法定义到外部。

关注实例化过程，去掉刚刚分析的 `_createClass` 部分：

```javascript
var B = /*#__PURE__*/ (function (_A) {
  // 注意这里的B是下面的函数B
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

  // _createClass...

  return B;
})(A);
```

首先是 `_inherits` 函数:

```javascript
function _inherits(subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function");
  }

  // Object.create将父类prototype上的方法**链接**到子类prototype上

  // 首先superClass && superClass.prototype 的结果是 superClass.prototype
  // Object.create(superClass && superClass.prototype) 的结果是 {__proto__: [superClass.prototype]}

  // Object.create的第二个参数是propertiesObject 这些属性对应Object.defineProperties()的第二个参数
  // 这里的第二个参数目的是将constructor置为subClass
  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: { value: subClass, writable: true, configurable: true },
  });
  // 这里是设置 __proto__ 的地方
  // 简单理解 subClass.__proto__ = superClass
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
```

参考 [Object.create](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/create)。
这里还可以清晰的看到原型链

1. subClass.\_\_proto\_\_ = superClass
2. subClass.prototype.constructor = subClass
3. subClass.prototype.\_\_proto\_\_ = superClass.prototype

接下来是 `var _super = _createSuper(B);`， 将在 B 实例化中触发（`_this = _super.call(this, name);`）:

```javascript
function _createSuper(Derived) {
  // 首先检查是否有定义Reflect
  var hasNativeReflectConstruct = _isNativeReflectConstruct();
  // 返回函数
  return function _createSuperInternal() {
    var Super = _getPrototypeOf(Derived),
      result;
    if (hasNativeReflectConstruct) {
      var NewTarget = _getPrototypeOf(this).constructor;
      // result将会是NewTarget 即SubClass类型
      result = Reflect.construct(Super, arguments, NewTarget);
    } else {
      result = Super.apply(this, arguments);
    }
    return _possibleConstructorReturn(this, result);
  };
}

// 这个函数测试是否存在NativeReflectConstruct
function _isNativeReflectConstruct() {
  if (typeof Reflect === "undefined" || !Reflect.construct) return false;
  if (Reflect.construct.sham) return false;
  // 这里检查 Proxy 是因为 Reflect 是一个内置的对象，它提供拦截 JavaScript 操作的方法。这些方法与proxy handlers的方法相同。
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
```

[Reflect](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Reflect)的 [construct](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Reflect/construct) 方法类似 `new` 操作符：

```javascript
function OneClass() {
  this.name = "one";
}

function OtherClass() {
  this.name = "other";
}

// 创建一个对象:
var obj1 = Reflect.construct(OneClass, /* args */ [], OtherClass);
// obj1: OtherClass {name: "one"}

// 与上述方法等效:
var obj2 = Object.create(OtherClass.prototype);
OneClass.apply(obj2, /* args */ []);
// obj2: OtherClass {name: "one"}

obj1 instanceof OneClass; // false
obj2 instanceof OneClass; // false
```
