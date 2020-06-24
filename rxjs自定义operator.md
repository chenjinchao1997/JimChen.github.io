# rxjs 自定义 operator

查看 rxjs 源码，我们取一个比较简单的操作符 `every` 作为例子。从 every 的实现可以看到，every 函数调用 source 的 lift 函数，传入自定义的两个类 EveryOperator 和 EverySubscriber。接下来看代码注释。

```javascript
// Observable.js
import { canReportError } from "./util/canReportError";
import { toSubscriber } from "./util/toSubscriber";
import { observable as Symbol_observable } from "./symbol/observable";
import { pipeFromArray } from "./util/pipe";
import { config } from "./config";
export class Observable {
  constructor(subscribe) {
    this._isScalar = false;
    if (subscribe) {
      this._subscribe = subscribe;
    }
  }
  // 返回一个新的Observable，将source置为自身，operator置为输入的operator
  lift(operator) {
    const observable = new Observable();
    observable.source = this;
    observable.operator = operator;
    return observable;
  }
  subscribe(observerOrNext, error, complete) {
    const { operator } = this;
    const sink = toSubscriber(observerOrNext, error, complete);
    if (operator) {
      // 下面设置的EveryOperator call方法就是在这里使用
      // 这里传入Subscriber 并且把自身的上一个Observable传过去
      sink.add(operator.call(sink, this.source));
    } else {
      sink.add(
        this.source ||
          (config.useDeprecatedSynchronousErrorHandling &&
            !sink.syncErrorThrowable)
          ? this._subscribe(sink)
          : this._trySubscribe(sink)
      );
    }
    if (config.useDeprecatedSynchronousErrorHandling) {
      if (sink.syncErrorThrowable) {
        sink.syncErrorThrowable = false;
        if (sink.syncErrorThrown) {
          throw sink.syncErrorValue;
        }
      }
    }
    return sink;
  }
  ...
}

// every.js

import { Subscriber } from "../Subscriber";
export function every(predicate, thisArg) {
  // 返回一个生成新Observable（source为传入参数，operator为every）的函数
  return (source) => source.lift(new EveryOperator(predicate, thisArg, source));
}
class EveryOperator {
  constructor(predicate, thisArg, source) {
    this.predicate = predicate;
    this.thisArg = thisArg;
    this.source = source;
  }
  // 当拥有当前Operator的Observable被subscribe的时候 会调用call(subscriber, this.source)
  // observer subscribe函数传入参数构建的
  // 这里的source是当前Observable的上一个Observable
  call(observer, source) {
    // 这里订阅了上一个Observable
    return source.subscribe(
      // 这里实际上就会生成一个标准的Observer/Subscriber 有next error complete
      // 这里的this.source 跟source是同一个source（应该）
      new EverySubscriber(observer, this.predicate, this.thisArg, this.source)
    );
  }
}
// 继承Subscriber
class EverySubscriber extends Subscriber {
  // destination 就是给我们调用next 传入处理后的值
  // 从source进行订阅
  constructor(destination, predicate, thisArg, source) {
    super(destination);
    this.predicate = predicate;
    this.thisArg = thisArg;
    this.source = source;
    this.index = 0;
    this.thisArg = thisArg || this;
  }
  notifyComplete(everyValueMatch) {
    // every的性质导致他只会调用一次next 就马上到complete
    this.destination.next(everyValueMatch);
    this.destination.complete();
  }
  // 每次有值过来 就会调用到_next
  _next(value) {
    let result = false;
    try {
      result = this.predicate.call(
        this.thisArg,
        value,
        this.index++,
        this.source
      );
    } catch (err) {
      this.destination.error(err);
      return;
    }
    if (!result) {
      this.notifyComplete(false);
    }
  }
  // 上游complete 触发_complete
  _complete() {
    this.notifyComplete(true);
  }
}
//# sourceMappingURL=every.js.map
```

当然，我们自己去封装操作符的时候不一定要按照它的逻辑。我们通过上面代码的分析，我们可以一个操作符函数为

```javascript
const myoperator = (myargs) => (source) => new Observable();
```

其中，你要返回一个 Observable，在构造 Observable 时通过 subscribe 上一个 Observable 即 source，进行 next 向下游发出值。

这个 Observable 的构造方式可以是通过 Observable.prototype.lift （source.lift）构建，通过传入一个带有 call 方法的 Operator 类，而这个类的 call 方法返回一个 Subscription。

下面做一个简单的 square 函数示例。

```javascript
// 使用Observable.create
const square = () => (source) =>
  Observable.create((subscriber) => {
    const subscription = source.subscribe(
      (value) => {
        subscriber.next(value * value);
      },
      (err) => {
        subscriber.error(err);
      },
      () => {
        subscriber.complete();
      }
    );
    // 这里要返回subscription 参考TeardownLogic
    return subscription;
  });
// 使用lift
class SquareOperator {
  constructor(thisArg, source) {
    this.source = source;
  }
  call(subscriber, source) {
    return source.subscribe({
      next: (value) => {
        subscriber.next(value * value);
      },
      error: (error) => {
        subscriber.error(error);
      },
      complete: () => {
        subscriber.complete;
      },
    });
  }
}
const square = () => (source, thisArg) =>
  source.lift(new SquareOperator(thisArg, source));
```
