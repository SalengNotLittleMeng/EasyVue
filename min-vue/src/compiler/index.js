import { parseHTML } from "./parse";
// 匹配{{}}
const defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g;
function genProps(attrs) {
  let str = "";
  for (let i = 0; i < attrs.length; i++) {
    let attr = attrs[i];
    // style要做特殊处理
    if (attr.name == "style") {
      let obj = {};
      attr.value.split(";").forEach((item) => {
        let [key, value] = item.split(":");
        obj[key] = value;
      });
      attr.value = obj;
    }
    str += `${attr.name}:${JSON.stringify(attr.value)},`;
  }
  return `{${str.slice(0, -1)}}`;
}
// 将children生成代码
function genChildren(children) {
  if (children) {
    return children
      .map((child) => {
        return gen(child);
      })
      .join(",");
  }
}
function gen(node) {
  // 如果有子节点就递归生成
  if (node.type === 1) {
    return codegen(node);
  } else {
    let text = node.text;
    if (!defaultTagRE.test(text)) {
      // 文本节点直接格式化处理
      return `_v(${JSON.stringify(text)})`;
    } else {
      // 操作模板语法，将模板语法替换为变量
      let tokens = [];
      let match;
      // 注意这里将正则的lastIndex重置为0，每次的行为一致
      defaultTagRE.lastIndex = 0;
      let lastIndex = 0;
      while ((match = defaultTagRE.exec(text))) {
        let index = match.index;
        if (index > lastIndex) {
          // 添加模板引擎之前/之后的内容
          tokens.push(JSON.stringify(text.slice(lastIndex, index)));
        }
        // 将模板中的变量添加进去
        tokens.push(`_s(${match[1].trim()})`);
        lastIndex = index + match[0].length;
      }
      if (lastIndex < text.length) {
        // 添加一般的文本
        tokens.push(JSON.stringify(text.slice(lastIndex)));
      }
      return `_v(${tokens.join("+")})`;
    }
  }
}
// 将ast语法树生成render函数
function codegen(ast) {
  let children = genChildren(ast.children);
  let code = `_c('${ast.tag}',${
    ast.attrs.length > 0 ? genProps(ast.attrs) : "null"
  }${ast.children.length ? `,${children}` : ""})`;
  return code;
}
export function complieToFunction(template) {
  let ast = parseHTML(template);
  let code = codegen(ast);
  // 绑定this并利用Function生成函数
  code = `with(this){return ${code}}`;
  let render = new Function(code);
  return render;
}
