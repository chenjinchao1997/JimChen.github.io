/**
 * Definition for a binary tree node.
 * function TreeNode(val) {
 *     this.val = val;
 *     this.left = this.right = null;
 * }
 */
class TreeNode {
    val: number
    left: TreeNode
    right: TreeNode
    constructor (val: number) {
        this.val = val
    }
}
/**
 * @param {TreeNode} root
 * @return {number[]}
 */
var postorderTraversal = function(root: TreeNode): Array<number> {
    if (root == null) {
        return []
    }
    let res: Array<number> = []
    let stack :Array<TreeNode> = []
    stack.push(root)
    while (stack.length > 0) {
        const cur: TreeNode = stack.pop()
        res.unshift(cur.val)
        if (cur.left != null) {
            stack.push(cur.left)
        }
        if (cur.right != null) {
            stack.push(cur.right)
        }
    }
    return res
}