# 简单的 promise 实现

```javascript
const RESOLVED = "resolved";
const PENDING = "pending";

function MyPromise(fn) {
  this.status = PENDING;
  this.value = null;
  this.resolveCBs = [];

  // promise创建的时候的resolve函数
  const _resolve = (value) => {
    const that = this;
    // 如果resolve传入的value是个promise，那么就把当前的resolve传给value.then
    // 等待value这个promise解决之后再执行当前resolve函数
    if (value instanceof MyPromise) {
      return value.then(_resolve);
    }
    this.status = RESOLVED;
    this.value = value;
    // 当前promise完成，把挂在上面的callback全部执行一遍
    this.resolveCBs.forEach((resolveCB) => {
      resolveCB(that.value);
    });
  };

  fn(_resolve);
}

// then函数要返回promise
MyPromise.prototype.then = function (onfulfilled) {
  const that = this;
  // 如果当前promise还没解决，创建一个新的promise，
  // 把新promise的resolve塞入resolveCBs数组
  // 同时把这个promise返回出去
  if (that.status === PENDING) {
    return new MyPromise((resolve) => {
      that.resolveCBs.push((val) => {
        resolve(onfulfilled(val));
      });
    });
  } else if (that.status === RESOLVED) {
    // 当前promise已经解决，直接将值传过去
    let result = onfulfilled(that.value);
    if (result instanceof MyPromise) {
      return result;
    } else {
      return new MyPromise((resolve) => {
        resolve(that.value);
      });
    }
  }
};

let p = new MyPromise((resolve) => {
  setTimeout(() => {
    console.log(100);
    resolve(100);
  }, 1000);
})
  .then(
    (value) =>
      new MyPromise((resolve) => {
        setTimeout(() => {
          console.log(value + 1);
          resolve(value + 1);
        }, 1000);
      })
  )
  .then((value) => console.log(value + 1));

// 预期结果
// 0ms:
// 1000ms: 100
// 2000ms: 101 102
```
