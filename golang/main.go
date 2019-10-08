package main

import (
	"fmt"
)

func main() {
	m1 := matrix{{1, 1}, {1, 0}}
	n := 5
	rs := power(m1, n-2)
	fmt.Println(rs)

	fmt.Println(fib(n))
}

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
