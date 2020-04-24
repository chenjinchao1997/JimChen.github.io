/**
 * 42.接雨水
 * tips: 单调栈
 * @param {number[]} height
 * @return {number}
 */
var trap = function(height: Array<number>) {
    const desStack = new Array<{index: number, height: number}>()
    let waterArea = 0
    function min (a: number, b: number) {
        return a < b ? a : b
    }

    function push (
        stack: Array<{index: number, height: number}>,
        val: {index: number, height: number}) {
        
        if (stack.length === 0) {
            stack.push(val)
            return
        }

        // debugger
        while (stack.length > 1) {
            const top = stack[stack.length - 1]
            if (top.height <= val.height) {
                const popout = stack.pop()
                const waterLine = popout.height;
                const currentTop = stack[stack.length - 1]
                const newWaterLine = min(val.height, currentTop.height)
                if (newWaterLine > waterLine)
                    waterArea += (newWaterLine - waterLine) * (val.index - currentTop.index - 1)
            } else {
                break
            }
        }

        stack.push(val)
    }
    height.forEach((h, i) => {
        push(desStack, {
            index: i,
            height: h
        })
    })
    return waterArea
}

// console.log(trap([4,2,3]))
console.log(trap([0,1,0,2,1,0,1,3,2,1,2,1]))