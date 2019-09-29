---
markdown:
  image_dir: /assets
  path: Markdown_Preview_Enhanced_Output.md
  ignore_from_front_matter: true
  absolute_image_path: false
export_on_save:
  markdown: true
---

# Markdown Preview Enhanced

## Code Chunk

using code chunk you should set enable scripts execution (in setting file)

```javascript {cmd="node"}
console.log('hello world')
```

```python {cmd=true matplotlib=true}
import matplotlib.pyplot as plt
plt.plot([1,2,3, 4])
plt.show() # show figure
```
