# lerna + vue-cli 组件库管理

[common-element-ui](https://github.com/chenjinchao1997/common-element-ui)是我将常用的 element-ui 中组件的使用方式做了个二次封装，这个包的管理方式就是使用 lerna 加上 vue-cli 的功能，使用了 typescript。

选用 vue-cli 使得不需要考虑太多 webpack 的配置，当然如果你的项目需要进一步的定制以及规范化，就要重新去做了。

基本上就只有两个命令比较常用。

```bash
lerna bootstrap --hoist # 将所有 package 的依赖引到 根目录的 node_modules 中，节省空间
lerna run build # 来执行所有 package 中的 build 命令
```
