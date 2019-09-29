# karma+Mocha+chai Vue Unit Test

When using Vue.nextTick(*f()*), karma may skip the assert in the *f()*.
To solve this problem you should add `async` `await` to the `it()` function.

```javascript
it('OpinionInput.vue', async () => {
    ...
    await  Vue.nextTick(() => {
        ...
    })
}
```
