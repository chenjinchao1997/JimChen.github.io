/**
 * @param {string} s
 * @param {string} p
 * @return {boolean}
 */
var isMatch = function (s, p) {
    var i, j = 0;
    var atomReg;
    while (i < s.length && j < p.length) {
        atomReg = findAtomReg(p, j);
        try {
            i += matchUntil(s, i, atomReg);
            j += atomReg.length;
        }
        catch (e) {
            return false;
        }
    }
    if (i !== s.length || j !== p.length) {
        return false;
    }
    return true;
};
function compareChar(a, reg) {
    if (a === reg || reg === '.')
        return true;
    else
        return false;
}
function findAtomReg(s, i) {
    if (s[i + 1] === '*') {
        return s[i] + '*';
    }
    else {
        s[i];
    }
}
function matchUntil(s, from, reg) {
    if (reg.length > 1) {
        if (reg[0] === '.') {
            var i = 0;
            while (s[from + i + 1] && s[from + i] === s[from + i + 1]) {
                i += 1;
            }
            return i + 1;
        }
        else {
            var i = 0;
            while (s[from + i] && s[from + i] === reg[0]) {
                i += 1;
            }
            return i + 1;
        }
    }
    else {
        if (compareChar(s[from], reg)) {
            return 1;
        }
        else {
            throw new Error('unmatch');
        }
    }
}
console.log(isMatch('aa', '.*'));
//# sourceMappingURL=solution.js.map