/**
 * @param {number[]} numbers
 * @return {number}
 */
var minArray = function (numbers) {
  let cur = Infinity;
  for (let i = numbers.length - 1; i >= 0; i--) {
    if (cur >= numbers[i]) cur = numbers[i];
    else break;
  }
  return cur;
};
