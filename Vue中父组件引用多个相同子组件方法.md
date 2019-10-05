# Vue中父组件引用多个相同子组件方法

## 通过子组件引用调用

```javascript
// 在父组件中
<child-component ref="child"></child-component>
<child-component ref="child"></child-component>
<child-component ref="child"></child-component>
```

父组件通过以下方法调用子组件方法

```javascript
// 获取的是子组件引用数组
childs = this.$ref.child
```

## 通过子组件prop属性监听触发

之前不知道可以返回子组件数组，所以使用了监听prop值的方式，父组件只需要变更trigger值便可触发子组件监听事件。

```javascript
// 子组件中
props: {
    trigger: Number
},
watch: {
    trigger (val) {
        // do sth
    }
}
```

采用这种方式并不是异步触发，如

```javascript
// 子组件中
props: {
    trigger: Boolean
},
watch: {
    trigger (val) {
        if !val return
        else {
            this.$emit('update:trigger', false) // 父组件允许该方法
            console.log(true)
        }
    }
}
```

此情况下只会触发第一个子组件（暂时搞不懂原理）。这不是一个可以利用的特性，推荐使用第一种方法。
