/**
 * Definition for a binary tree node.
 * function TreeNode(val) {
 *     this.val = val;
 *     this.left = this.right = null;
 * }
 */
class TreeNode {
    constructor(val) {
        this.val = val;
    }
}
/**
 * @param {TreeNode} root
 * @return {number[]}
 */
var postorderTraversal = function (root) {
    if (root == null) {
        return [];
    }
    let res = [];
    let stack = [];
    stack.push(root);
    while (stack.length > 0) {
        const cur = stack.pop();
        res.unshift(cur.val);
        if (cur.left != null) {
            stack.push(cur.left);
        }
        if (cur.right != null) {
            stack.push(cur.right);
        }
    }
    return res;
};
//# sourceMappingURL=solution145.js.map