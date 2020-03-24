# ES6

## 尾部调用优化（支持Safari）

在斐波那契数列这种情况中

```javascript
function fib(n, ac1 = 1, ac2 = 1) {
  if (n <= 1) return ac2
  return fib(n -1, ac2, ac1 + ac2)
}
```

将不会发生栈溢出问题，因为检测到函数调用尾部会调用另一个**没有引用当前函数体的变量作为外部变量**的函数，将会删除当前函数调用帧。

## pipline

```javascript
const pipeline = (...funcs) =>
  val => funcs.reduce((a, b) => b(a), val)
```

### lambda演算

Y组合子

```javascript
const Y = ()