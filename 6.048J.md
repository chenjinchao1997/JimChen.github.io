# 最快的斐波那契数列

## 更快的n次幂算法

一般来说，n次幂最直观朴素的求解是

$$
x^n = x\cdot x\cdot x \cdots x
$$

明显地，该算法复杂度为 $\theta (n)$。稍作思考，可以发现

$$
x^n = \begin{cases}
    x^\frac{n}{2} \cdot x^\frac{n}{2} &\text{n为偶数} \\
    x^\frac{n-1}{2} \cdot x^\frac{n-1}{2} \cdot x &\text{n为奇数}
\end{cases}
$$

由此将该算法复杂度变为 $\theta (lgn)$。

## 更快的斐波那契数列

斐波那契数列定义如下：

$$
f(n) = \begin{cases}
    0 & n=1 \\
    1 & n=2 \\
    f(n-1) + f(n-2)
\end{cases}
$$

如果直接使用递归算法复杂度为指数级（证明过程涉及差分方程）。稍微思考，可以改为自下而上地推出答案，复杂度为$\theta (n)$。

由斐波那契数列的定义，我们可以推出

$$
\begin{pmatrix}
    f(n) \\
    f(n-1)
\end{pmatrix} = \begin{pmatrix}
    1 & 1 \\
    1 & 0
\end{pmatrix} \begin{pmatrix}
    f(n-1) \\
    f(n-2)
\end{pmatrix} = \begin{pmatrix}
    1 & 1 \\
    1 & 0
\end{pmatrix} ^{n-2} \begin{pmatrix}
    f(2) \\
    f(1)
\end{pmatrix}
$$

或者更加简洁地

$$
\begin{pmatrix}
    f(n+1) & f(n) \\
    f(n) & f(n-1)
\end{pmatrix} = \begin{pmatrix}
    f(n) & f(n-1) \\
    f(n-1) & f(n-2)
\end{pmatrix} \begin{pmatrix}
    1 & 1 \\
    1 & 0
\end{pmatrix} = \begin{pmatrix}
    1 & 1 \\
    1 & 0
\end{pmatrix} ^ {n}
$$

以下是使用Go语言实现

```go
package main

import (
    "fmt"
)

{% raw %}
func main() {
    m1 := matrix{{1, 1}, {1, 0}}
    n := 5
    rs := power(m1, n-2)
    fmt.Println(rs)

    fmt.Println(fib(n))
}
{% endraw %}

type timer interface {
    time(x timer) timer
}

func power(t timer, n int) timer {
    if n == 1 {
        return t
    }
    if n%2 == 0 {
        half := power(t, n/2)
        rs := half.time(half)
        return rs
    }
    if n%2 == 1 {
        half := power(t, (n-1)/2)
        rs := half.time(half).time(t)
        return rs
    }
    return nil
}

type matrix [][]int

func (m1 matrix) time(t timer) timer {
    m2, ok := t.(matrix)
    if !ok {
        return nil
    }
    col := len(m1)
    row := len(m2[0])
    k := len(m1[0])
    var rs matrix
    for i := 0; i < col; i++ {
        tmp := make([]int, row)
        rs = append(rs, tmp)
    }

    for c := 0; c < col; c++ {
        for r := 0; r < row; r++ {
            for i := 0; i < k; i++ {
                rs[c][r] += m1[c][i] * m2[i][r]
            }
        }
    }
    return rs
}

func fib(n int) int {
    if n == 1 {
        return 0
    }
    if n == 2 {
        return 1
    }
    var fn, fn1, fn2 int
    fn1 = 1
    fn2 = 0
    for i := 3; i <= n; i++ {
        fn = fn1 + fn2
        fn2 = fn1
        fn1 = fn
    }
    return fn
}
```

## 为什么会更快

实际上，观察运算过程我们发现，对于偶数 $n(n>=4)$

$$
f(n) = f(\frac{n}{2} + 1)^2 + f(\frac{n}{2})^2
$$

将两个个斐波那契数列中的数平方并相加，就可以获得一个斐波那契数列的数，一瞬间还是让人发懵的。再来研究一个具体例子

$$
0,1,1,2,3,5,8,13
$$

对于第8个数。$13 = 3^2 + 2^2$
这时我们回头看看递归的定义，仔细观察，并考究这条式子的意义。

```javascript
Num             1  2  3  4  5  6  7   8
                0  1  1  2  3  5  8  13
number of 3     _  _  _  0  1  1  2   3
number of 2     _  _  _  _  0  1  1   2
```

这条式子其实是在用一个新的斐波那契数列统计13有多少个3和2。不难发现$f(n)$恰好就有$f(\frac{n}{2} + 1)$个$f(\frac{n}{2} + 1)$和$f(\frac{n}{2})$个$f(\frac{n}{2})$
