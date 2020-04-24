/**
 * @param {number} N
 * @return {number}
 */
var numDupDigitsAtMostN = function (N) {
    const uniqueN = dp(N);
    return N - uniqueN;
};
const dp = function (N) {
    let result = 0;
    const digits = N.toString().split('').map(each => parseInt(each));
    for (let i = 0; i < digits.length - 1; i++) {
        result += 9 * A(9, i);
    }
    // first number
    if (digits[0] !== 1) {
        for (let j = 1; j < digits[0]; j++) {
            result += A(9, digits.length - 1);
        }
    }
    // other numbers
    for (let i = 1; i < digits.length; i++) {
        if (digits.slice(0, i - 1).indexOf(digits[i - 1]) !== -1) {
            break;
        }
        for (let j = 0; j < digits[i]; j++) {
            if (digits.slice(0, i).indexOf(j) !== -1) {
                continue;
            }
            else {
                debugger;
                result += A(10 - (i + 1), digits.length - (i + 1));
                debugger;
            }
        }
    }
    result += digits.filter((each, i) => digits.indexOf(each) !== i).length > 0 ? 0 : 1;
    return result;
};
const factcache = new Map();
factcache.set(0, 1);
factcache.set(1, 1);
const fact = function (n) {
    if (factcache.get(n)) {
        return factcache.get(n);
    }
    else {
        factcache.set(n, fact(n - 1) * n);
        return factcache.get(n);
    }
};
const A = function (m, n) {
    return fact(m) / fact(m - n);
};
console.log(numDupDigitsAtMostN(111));
//# sourceMappingURL=solution1012.js.map