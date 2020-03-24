// 对于普通Object
function defineReactiveObject (obj, key, val = null) {
    let dep = []
    Object.defineProperty(obj, key, {
        enumerable: true,
        configurable: true,
        get: function () {
            dep.push(global._vueWatcherFn)
            return val
        },
        set: function (newVal) {
            if (val === newVal) {
                return
            }
            dep.forEach(fn => {
                fn(newVal, val)
            })
            val = newVal
        }
    })
}


