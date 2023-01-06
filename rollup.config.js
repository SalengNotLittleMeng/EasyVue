import babel from "rollup-plugin-babel";
const plugins = [
  babel({
    exclude: ["node_modules/*", "Vue2.6/*"],
  }),
];
const outputList = ["Vue", "VueRouter", "Vuex"];
const buildList = outputList.map((name) => {
  function getGlobals() {
    const listReg = /(VueRouter)/;
    return listReg.test(name)
      ? {
          vue: "vue", // 指明 global.vue 即是外部依赖 vue
        }
      : void 0;
  }
  return {
    input: `./mine-${name}/src/index.js`,
    output: {
      file: `./mine-${name}/lib/vue.js`,
      name,
      format: "umd",
      sourcemap: true,
    },
    globals: getGlobals(),
    plugins,
  };
});
console.log(buildList);
export default buildList;
