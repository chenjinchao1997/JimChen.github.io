package main

import (
	"fmt"
)

func main() {
	m1 := matrix{{1, 1}, {1, 0}}
	rs := m1.time(m1)
	fmt.Println(rs)

}

type timer interface {
	time(x timer) timer
}

func power(number timer, n int) timer {
	result := number
	for i := 0; i < n; i++ {
		result = result.time(result)
	}
	return result
}

// type matrix struct {
// 	data [][]int
// }

type matrix [][]int

func (m1 matrix) time(m2 matrix) matrix {
	col := len(m1)
	row := len(m2[0])
	k := len(m1[0])
	var rs [][]int
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

type matrix2_2 struct {
	data [2][2]int
}

func (m1 *matrix2_2) time(m2 matrix2_2) matrix2_2 {

	var rs [2][2]int

	for c := 0; c < 2; c++ {
		for r := 0; r < 2; r++ {
			for i := 0; i < 2; i++ {
				rs[c][r] += m1.data[c][i] * m2.data[i][r]
			}
		}
	}
	return matrix2_2{
		data: rs,
	}
}
