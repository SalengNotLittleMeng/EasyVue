import babel from "rollup-plugin-babel";
import nodeResolve from "rollup-plugin-node-resolve";
import commonjs from "rollup-plugin-commonjs";
const plugins = [
  nodeResolve(),
  commonjs(),
  babel({
    exclude: ["node_modules/*", "Vue2.6/*"],
  }),
];
const outputList = ["Vue", "VueRouter"];
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
      globals: getGlobals(),
    },
    plugins,
  };
});
export default buildList;
