# Vue 隐藏工具 Vue.util

今天突然发现 Vue 居然有个 Vue.util，在 2.0 文档上都看不到，翻 router 源码的时候才发现的。。。

使用日志打印出来分别是这么几个方法：

```console
defineReactive: ƒ defineReactive\$\$1( obj, key, val, customSetter, shallow )
extend: ƒ extend(to, _from)
mergeOptions: ƒ mergeOptions( parent, child, vm )
warn: ƒ (msg, vm)
```

源码中带了警告，不是那你的 router 还用？

```javascript
// exposed util methods.
// NOTE: these are not considered part of the public API - avoid relying on
// them unless you are aware of the risk.
Vue.util = {
  warn: warn, // 啥都不干貌似 指向了noop函数
  extend: extend, // 直接复制_from属性到to
  mergeOptions: mergeOptions, // 合并options
  defineReactive: defineReactive$$1,
};
```

里面比较有用的就是 defineReactive，由于 Vue.observable 是 2.6.0 开始新增的，我们需要考虑兼容。（尽量更新到 2.6.x，这版本已经稳定很久很久了，而且包含一些比较常用的更新）

了解过 Vue 源码的人都知道，defineReactive 是一个比较重要的函数。

```javascript
/**
 * Walk through all properties and convert them into
 * getter/setters. This method should only be called when
 * value type is Object.
 */
Observer.prototype.walk = function walk(obj) {
  var keys = Object.keys(obj);
  for (var i = 0; i < keys.length; i++) {
    defineReactive$$1(obj, keys[i]);
  }
};
```

可以考虑用 defineReactive 来代替 Vue.observable，代码如下，不支持 Array（要支持也可以，挪相关代码过来，稍微有点麻烦）：

```javascript
function def(obj, key, val, enumerable) {
  Object.defineProperty(obj, key, {
    value: val,
    enumerable: !!enumerable,
    writable: true,
    configurable: true,
  });
}

var Observer = function Observer(value) {
  this.value = value;
  def(value, "__ob__", this);
  this.walk(value);
};

Observer.prototype.walk = function walk(obj) {
  var keys = Object.keys(obj);
  for (var i = 0; i < keys.length; i++) {
    Vue.util.defineReactive(obj, keys[i]);
  }
};

function observe(value) {
  return new Observer(value);
}
```
