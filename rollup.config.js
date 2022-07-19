import babel from "rollup-plugin-babel";
export default {
  input: "./min-vue/src/index.js",
  output: {
    file: "./min-vue/dist/vue.js",
    name: "Vue",
    format: "umd",
    sourcemap: true,
  },
  plugins: [
    babel({
      exclude: ["node_modules/*", "Vue2.6/*"],
    }),
  ],
};
