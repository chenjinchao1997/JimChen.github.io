# 从 vue-rx 源码分析 vue 自定义插件

`vue-rx` 源码只有不到 350 行，但是实现了自定义的指令、hook、options。
本文旨在研究 vue-rx 源码总结如何自定义指令、hook 及 options。

## vue-rx 概览

hook \ options:

1. subscriptions: 接受函数或对象，提供多个 Observable
2. domStreams: 数组，自动创建对应 Subject，配合 v-stream
3. observableMethods: 数组或对象，自动创建对应方法的 Subject，配合 v-on

directives:

1. v-stream: 将事件输入进对应 Subject 或者 `{ subject: Subject, data: any, options: { once: boolean, passive: boolean, capture: boolean } }`

```html
<button v-stream:click="plus$">+</button>
```

```javascript
new Vue({
  domStreams: ["plus$"],
  subscriptions() {
    return {
      count: this.plus$.pipe(
        map(() => 1),
        startWith(0),
        scan((total, change) => total + change)
      ),
    };
  },
});
```

API Methods:

1.`$watchAsObservable(expOrFn, [options])`: 一个类似于 `$watch` 的函数，返回值为 Observable

```javascript
vm.$watchAsObservable("a").subscribe(
  ({ newValue, oldValue }) => console.log("stream value", newValue, oldValue),
  (err) => console.error(err),
  () => console.log("complete")
);
```

2.`$eventToObservable(event)`: 类似 `.$on`

```javascript
const vm = new Vue({
  created() {
    this.$eventToObservable("customEvent").subscribe((event) =>
      console.log(event.name, event.msg)
    );

    // vm.$once vue-rx version
    this.$eventToObservable("customEvent").pipe(take(1));

    // Another way to auto unsub:
    let beforeDestroy$ = this.$eventToObservable("hook:beforeDestroy").pipe(
      take(1)
    );

    interval(500).pipe(takeUntil(beforeDestroy$));
  },
});
```

3.`$subscribeTo(observable, next, error, complete)`: 实际上就是 subscribe，使用这个 vue-rx 帮你自动停止订阅

```javascript
mounted () {
  this.$subscribeTo(interval(1000), function (count) {
    console.log(count)
  })
}
```

4.`$fromDOMEvent(selector, event)`: Rx.Observable.fromEvent，由于 subscriptions 是在页面 DOM 实际渲染之前，所以 Rx.Observable.fromEvent 是不能使用的，通过`$fromDOMEvent`就能使用

```javascript
subscriptions () {
  return {
    inputValue: this.$fromDOMEvent('input', 'keyup').pipe(
      pluck('target', 'value')
    )
  }
}
```

5.`$createObservableMethod(methodName)`: 创建名为 methodName 的热 Observable

## hook \ options

hook 使用 mixin，在 created、beforeDestroyed 中进行处理，通过 vm.\$options 获取到 hook 或者 options 内容

```javascript
var rxMixin = {
  created: function created() {
    var vm = this;
    var domStreams = vm.$options.domStreams;
    ...

    var observableMethods = vm.$options.observableMethods;
    ...

    var obs = vm.$options.subscriptions;
    if (typeof obs === 'function') {
      obs = obs.call(vm);
    }
    ...
  },

  beforeDestroy: function beforeDestroy() {
    if (this._subscription) {
      this._subscription.unsubscribe();
    }
  },
};
```

由于是通过 mixin 的方式来获取 hook 或者处理 options，所以这时是无法使用 `watch` option 去监听 subscriptions。但是可以使用 `$watch`。

在我们自己定义插件，涉及到 hook 的时候也要注意，可以再做一个 `your-watch-options` 来注册监听的选项，然后再在你的数据初始化之后使用 vm.\$watch 进行处理。

## directives

[自定义指令](https://cn.vuejs.org/v2/guide/custom-directive.html)最常用的场景应该是注册子组件抛出的事件，这里主要关注自定义指令如何获取子组件抛出的事件。vue-rx 中通过\$eventToObservable 去将事件转为 Observable。

```javascript
handle.subscription = vnode.componentInstance
  .$eventToObservable(event)
  .subscribe(function (e) {
    modifiersExists.forEach(function (mod) {
      return modifiersFuncs[mod](e);
    });
    next({
      event: e,
      data: handle.data,
    });
  });

/**
 * @see {@link https://vuejs.org/v2/api/#vm-on}
 * @param {String||Array} evtName Event name
 * @return {Observable} Event stream
 */
function eventToObservable(evtName) {
  var vm = this;
  var evtNames = Array.isArray(evtName) ? evtName : [evtName];
  var obs$ = new Observable(function (observer) {
    var eventPairs = evtNames.map(function (name) {
      var callback = function (msg) {
        return observer.next({ name: name, msg: msg });
      };
      vm.$on(name, callback);
      return { name: name, callback: callback };
    });
    // 参考TeardownLogic 返回函数用于在Observable.unsubscribe的时候调用进行资源的清除
    return function () {
      // Only remove the specific callback
      eventPairs.forEach(function (pair) {
        return vm.$off(pair.name, pair.callback);
      });
    };
  });

  return obs$;
}
```

`vnode.componentInstance` 这个是指令挂载的组件，在 eventToObservable 中通过 `$on` 监听上面的事件。可以参考我实现的 `v-debounce` 和 `v-throttle` 指令（[github](https://github.com/chenjinchao1997/v-directives))。

下面是 v-debounce 的实现

```javascript
'debounce': {
  bind: function (el, { value, arg, modifiers }, vnode) {
    const delay = modifiers.long ? 1000 : modifiers.short ? 100 : 300
    const fn = debounce(value, delay)
    if (modifiers.native) {
      el.addEventListener(arg, fn.bind(vnode.context))
    } else {
      // $on 监听挂载组件上的对应事件
      vnode.componentInstance.$on(arg, fn.bind(vnode.context))
    }
  }
},
```

## API methods

vue-rx 最终是返回一个 VueRx 的函数。也可以返回一个对象，其中有 `install` 的函数，Vue.use 都会将自身传入并执行该函数。

```javascript
function VueRx(Vue) {
  install(Vue);
  Vue.mixin(rxMixin);
  Vue.directive("stream", streamDirective);
  Vue.prototype.$watchAsObservable = watchAsObservable;
  Vue.prototype.$fromDOMEvent = fromDOMEvent;
  Vue.prototype.$subscribeTo = subscribeTo;
  Vue.prototype.$eventToObservable = eventToObservable;
  Vue.prototype.$createObservableMethod = createObservableMethod;
  Vue.config.optionMergeStrategies.subscriptions =
    Vue.config.optionMergeStrategies.data;
}
```

API methods 通过挂在 Vue.prototype，使得所有 Vue 实例都可以调用这些 API methods。我们这篇文章主要分析如何进行自定义插件，所以不会全部详细讲解这些 API。

接下来分析 watchAsObservable。

```javascript
function watchAsObservable(expOrFn, options) {
  var vm = this;
  var obs$ = new Observable(function (observer) {
    var _unwatch;
    var watch = function () {
      _unwatch = vm.$watch(
        expOrFn,
        function (newValue, oldValue) {
          observer.next({ oldValue: oldValue, newValue: newValue });
        },
        options
      );
    };

    // if $watchAsObservable is called inside the subscriptions function,
    // because data hasn't been observed yet, the watcher will not work.
    // in that case, wait until created hook to watch.
    if (vm._data) {
      watch();
    } else {
      vm.$once("hook:created", watch);
    }

    // Returns function which disconnects the $watch expression
    // 这里返回一个Subscription，构造函数传入的方法会在unsubscribe的时候调用
    return new Subscription(function () {
      _unwatch && _unwatch();
    });
  });

  return obs$;
}
```

值得注意的是，由于提供了 subscriptions hook，而 subscriptions 是在 created 期间触发，在此时实际上 `vm._data` 已经存在，这里的判断似乎并没有意义。

Vue 初始化流程如下：

```javascript
Vue.prototype._init = function (options) {
  ...
  initLifecycle(vm);
  initEvents(vm);
  initRender(vm);
  callHook(vm, "beforeCreate");
  initInjections(vm); // resolve injections before data/props
  initState(vm); // vm._data 在这里初始化
  initProvide(vm); // resolve provide after data/props
  callHook(vm, "created");
  ...
};
```
