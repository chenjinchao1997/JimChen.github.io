const RESOLVED = 'resolved'
const PENDING = 'pending'

// function MyPromise(fn) {
//     this.status = PENDING
//     this.value = null
//     this.error = null
//     this.resolveFns = []
//     this.rejectFns = []

//     const _resolve = (value) => {
//         this.status = RESOLVED
//         this.value = value
//         this.resolveFns.foEach(fn => {
//             this.value = fn(this.value)
//         })
//     }

//     const _reject = (error) => {
//         this.status = REJECTED
//         this.error = error
//         this.rejectFns.foEach(fn => {
//             fn(this.error)
//         })
//     }

//     fn(_resolve, _reject)
// }

// MyPromise.prototype.then = function(onfulfilled) {
//     this.resolveFns.push(onfulfilled)
//     return this
// }

// MyPromise.prototype.catch = function(onrejected) {
//     this.rejectFns.push(onrejected)
// }


function MyPromise(fn) {
    this.status = PENDING
    this.value = null
    this.error = null
    this.resolveCB = v => v

    const _resolve = (value) => {
        if(value instanceof MyPromise) {
            return value.then(_resolve);
        }
        this.status = RESOLVED
        this.value = value
        this.resolveCB(this.value)
    }

    fn(_resolve)
}

MyPromise.prototype.then = function(onfulfilled) {
    let that = this
    if (that.status === PENDING) {
        return new MyPromise(resolve => {
            that.resolveCB = (val) => {
                resolve(onfulfilled(val))
            }
        })
    } else if (that.status === RESOLVED) {
        let result = onfulfilled(that.value)
        if (result instanceof MyPromise) {
            return result
        } else {
            return new MyPromise(resolve => {
                resolve(that.value)
            })
        }
    }
}

let p = new MyPromise((resolve, reject) => {
	setTimeout(() => {
		console.log(100)
		resolve(100)
	}, 1000)
}).then(value => new MyPromise((resolve, reject) => {
        setTimeout(() => {
            console.log(value + 1)
            resolve(value + 1)
        }, 1000)
    })
).then(value => console.log(value + 1))
