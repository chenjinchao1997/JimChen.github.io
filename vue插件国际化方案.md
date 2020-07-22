# vue 插件国际化方案

插件开发过程遇到了国际化的需求，**默认调用方一定安装了 vue-i18n**，我们这边的插件要根据调用方实际的 locale 自动切换语言。

第一种情况，component：

```javascript
import MyComponent from "./MyComponent.vue";
import Langs from "./locale/langs.json";
// {
//   "zh-cn": {
//     "myComponent": {
//       "hello": "你好"
//     }
//   },
//   "en": {
//     "myComponent": {
//       "hello": "hello"
//     }
//   }
// }

/**
 *
 * @param {Vue} vue
 */
const install = (vue) => {
  vue.use(VueI18n);
  vue.mixin({
    beforeCreate() {
      // 这里为了防止 beforeCreate 比 vue-i18n 的 beforeCreate 先执行导致 this.$i18n 为空
      this.$nextTick(() => {
        // 判断是否为根节点，合并国际化信息
        if (this.$root === this && this.$i18n) {
          for (const lang in Langs) {
            this.$i18n.mergeLocaleMessage(lang, Langs[lang]);
          }
        }
      });
    },
  });
  vue.component("my-component", MyComponent);
};

export default install;
```

第二种情况，通过提供 api，api 内部 new Vue 来实现的插件：

```javascript
import MyComponent from "./MyComponent.vue";
import Langs from "necp.tflow.components.transfer-core/locale/langs.json";
import Vue from "vue";
import VueI18n from "vue-i18n";

const myapi = function (el) {
  Vue.use(VueI18n);
  const calleri18n = this.$i18n || { locale: "zh-cn" };
  const i18n = new VueI18n({
    locale: calleri18n.locale,
    messages: Langs,
  });

  // 构造实例
  const Constructor = Vue.extend(MyComponent);
  const vm = new Constructor({
    i18n,
    el: el,
  });

  // 监听调用方当前地区语言信息
  vm.$watch(
    () => {
      return calleri18n.locale;
    },
    function (val) {
      vm.$i18n.locale = val;
    }
  );
  return vm;
};

const install = (vue) => {
  vue.prototype.$myapi = myapi;
};

export default install;
```
