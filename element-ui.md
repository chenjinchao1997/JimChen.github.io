# 这就是我全部的波纹了

## 如何展开el-tree所有元素

```javascript
expandOrCollapseAllNote(this.refs.tree, true)

/**
 * expanded: true 展开 false 收叠
 */
const expandOrCollapseAllNote = (root, expanded) => {
  let nodes = root.childNodes
  nodes.forEach((element, index) => {
    nodes[index].expanded = expanded
    expandOrCollapseAllNote(nodes[index], expanded)
  })
}
```

## 带定位功能的el-tree LocateTree

```vue
<script>
const _expandOrCollapseAllNote = (root, expanded) => {
  let nodes = root.childNodes
  nodes.forEach((element, index) => {
    nodes[index].expanded = expanded
    _expandOrCollapseAllNote(nodes[index], expanded)
  })
}

const _expandLevel = (root, level) => {
  if (root.level === level) {
    root.expanded = true
  } else {
    let nodes = root.childNodes
    nodes.forEach((element, index) => {
      _expandLevel(nodes[index], level)
    })
  }
}

const _expandSelfAndParents = (leaf) => {
  if (leaf) {
    leaf.expanded = true
    if (leaf.parent) _expandSelfAndParents(leaf.parent)
  }
}

export default {
  render (h) {
    return (
      <div class="flex-col-container">
        <div {...{
          class: {
            'flex-col-item': true,
            'flex-grow-item': true,
            'border': true
          },
          style: {
            'overflow': 'auto'
          }
        }}>
          <el-tree
            renderContent={ this.renderContent }
            render-after-expand={ false }
            {...{
              props: this.$attrs,
              attrs: this.$attrs,
              on: this.$listeners,
              style: {
                width: '100%'
              }
            }}
            ref="tree"
          ></el-tree>
        </div>
        <div {...{
          class: {
            'flex-col-item': true,
            'flex-fixed-item': true
          }
        }}>
          <el-input
            placeholder="请搜索您要的内容"
            v-model={ this.value }
            {...{
              // props: this.$attrs,
              // attrs: this.$attrs,
              style: {
                width: 'fit-content'
              },
              nativeOn: {
                'keyup': (e) => {
                  if (e.keyCode === 13) {
                    this.currentHighlightSpanIndex += 1
                    this.focusOnHighlight()
                  }
                }
              }
            }}
            size="mini">
            <template slot="append">
              <el-button onClick={ () => {
                this.currentHighlightSpanIndex -= 1
                this.focusOnHighlight()
              } }>∧</el-button>
              <el-button onClick={ () => {
                this.currentHighlightSpanIndex += 1
                this.focusOnHighlight()
              } }>∨</el-button>
            </template>
          </el-input>
        </div>
      </div>
    )
  },
  props: {
  },
  data () {
    return {
      value: '',
      currentHighlightSpanIndex: null,
      nodesIncludeKeyword: []
    }
  },
  mounted () {
  },
  methods: {
    focusOnHighlight () {
      // _expandOrCollapseAllNote(this.$refs.tree.root, true)
      let node = this.currentHighlightSpan
      if (node == null) return
      let key = node.attributes.key.nodeValue
      let tNode = this.$refs.tree.getNode(key)
      if (tNode.parent) _expandSelfAndParents(tNode.parent)
      let click = document.createEvent('HTMLEvents')
      click.initEvent('click', true, true)
      node.dispatchEvent(click)

      node.scrollIntoView({
        behavior: 'auto',
        block: 'start',
        inline: 'nearest'
      })
    },
    expandLevel (level) {
      if (level !== 0) {
        _expandLevel(this.$refs.tree.root, level)
      }
    },
    expandOrCollapseAllNote (isExpand) {
      _expandOrCollapseAllNote(this.$refs.tree.root, true)
    }
  },
  watch: {
    value (val) {
      this.$nextTick(() => {
        let list = document.querySelectorAll('font.include-keyword')
        list = Array.of(...list)
        this.nodesIncludeKeyword = list.map(node => node.parentElement)

        this.currentHighlightSpanIndex = 0
        this.focusOnHighlight()
      })
    },
    currentHighlightSpan (newVal, preVal) {
      if (preVal) preVal.firstElementChild.className = 'include-keyword'
      newVal.firstElementChild.className = 'include-keyword focus-include-keyword'
    }
  },
  computed: {
    renderContent () {
      return (h, {data, node, store}) => {
        return (
          <span {...{
            attrs: {
              'key': node.key
            }
          }}>{
              this.value === ''
                ? node.label
                : node.label.indexOf(this.value) !== -1
                  ? <font class="include-keyword">{ node.label }</font>
                  : node.label
            }</span>
        )
      }
    },
    label () {
      return this.$attrs.props.label || 'label'
    },
    nodeKey () {
      return this.$attrs['node-key'] || 'id'
    },
    currentHighlightSpan () {
      let l = this.nodesIncludeKeyword.length
      if (l === 0) return null
      let i = (this.currentHighlightSpanIndex + 1) % l
      i = i > 0 ? i : i + l
      return this.nodesIncludeKeyword[i - 1]
    }
  }
}
</script>
<style lang="scss">
.include-keyword {
  font-weight: bold;
  background: #ffcc00;
}
.focus-include-keyword {
  background: #ff6600;
}

* {
  box-sizing: border-box;
}

.flex-row-container {
  display: flex;
  overflow: hidden;
  flex-direction: row;
  justify-content: space-between;
  align-items: stretch;
}

.flex-col-container {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: stretch;
}

.flex-row-item+.flex-row-item {
  margin: 0px;
  margin-left: 5px;
}

.flex-col-item+.flex-col-item {
  margin: 0px;
  margin-top: 5px;
}

.flex-fixed-item {
  flex-grow: 0;
  flex-shrink: 0;
}

.flex-grow-item {
  flex-grow: 2;
}
</style>
```

### tree list data 转换

```javascript

// let props = {
//   idname: 'compid',
//   pidname: 'pcompid',
//   childrenname: 'children'
// }

export function tree2Flat (props, treeData) {
  let flatData = []
  // let pidName = props.pidname
  // let idName = props.idname
  let childrenName = props.childrenname

  function addToList (node, flatData) {
    flatData.push(node)
    node[childrenName].forEach((value, index, array) => {
      addToList(array[index], flatData)
    })
  }

  if (treeData instanceof Array) {
    treeData.forEach((value, index, array) => {
      addToList(array[index], flatData)
    })
  } else if (treeData instanceof Object) {
    addToList(treeData, flatData)
  }
  flatData.forEach((value, index, array) => {
    array[index][childrenName] = null
    delete array[index][childrenName]
  })
  return flatData
}

export function flat2Tree (props, flatData) {
  let pidName = props.pidname
  let idName = props.idname
  let childrenName = props.childrenname

  flatData.forEach((value, index, array) => {
    array[index][childrenName] = flatData.filter(val => val[pidName] && value[idName] && val[pidName] === value[idName])
    array[index][childrenName].forEach((val, j, arr) => {
      arr[j].parentNode = array[index]
    })
  })
  let tree = flatData.filter(value => value.parentNode == null)

  function clearParentNode (node) {
    node[childrenName].forEach((value, index, array) => {
      array[index].parentNode = null
      delete array[index].parentNode
      clearParentNode(array[index])
    })
  }
  tree.forEach((value, index, array) => {
    clearParentNode(array[index])
  })

  return tree
}
```
