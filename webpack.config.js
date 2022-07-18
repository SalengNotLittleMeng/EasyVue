const path = require("path");

module.exports = {
  entry: "./src/index.js", // 指定打包的路径
  output: {
    // 输出文件设置
    filename: "bundle.js", // 文件名
    path: path.join(__dirname, "output"), // 一定要是绝对路径
  },
};
