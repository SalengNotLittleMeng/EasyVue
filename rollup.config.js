import babel from "rollup-plugin-babel";
const plugins = [
  babel({
    exclude: ["node_modules/*", "Vue2.6/*"],
  }),
];
export default [
  {
    input: "./mine-Vue/src/index.js",
    output: {
      file: "./mine-Vue/lib/vue.js",
      name: "Vue",
      format: "umd",
      sourcemap: true,
    },
    plugins,
  },
  {
    input: "./mine-VueRouter/index.js",
    output: {
      file: "./mine-VueRouter/lib/vue-router.js",
      name: "VueRouter",
      format: "umd",
      sourcemap: true,
      globals: {
        vue: "vue", // 指明 global.vue 即是外部依赖 vue
      },
    },
    plugins,
  },
  {
    input: "./mine-Vuex/src/index.js",
    output: {
      file: "./mine-Vuex/lib/vuex.js",
      name: "Vuex",
      format: "umd",
      sourcemap: true,
    },
    plugins,
  },
];
