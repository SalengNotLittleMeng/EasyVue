const ncname = `[a-zA-Z_][\\-\\.0-9_a-zA-Z]*`;
// 下面的这个正则中的：表示匹配命名空间：<div:XXX>
const qnameCapture = `((?:${ncname}\\:)?${ncname})`;
// 匹配前标签开始 <div
const startTagOpen = new RegExp(`^<${qnameCapture}`);
// 匹配结束的标签
const endTag = new RegExp(`^<\\/${qnameCapture}[^>]>*>`);
// 匹配属性,第一个分组是属性的key，属性的值是分组3/4/5
const attribute =
  /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>']+)))?/;
//匹配前标签结束
const startTagClose = /^\s*(\/?)>/;
// 匹配{{}}
const defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g;
// 转化为ast模板语法树
export function parseHTML(html) {
  const ELEMENT_TYPE = 1;
  const TEXT_TYPE = 3;
  const stack = [];
  let currentParent;
  let root;
  // 创建节点
  function createASTElement(tag, attrs) {
    return {
      tag,
      type: ELEMENT_TYPE,
      children: [],
      attrs,
      parent: null,
    };
  }
  function advance(n) {
    html = html.substring(n);
  }
  // 在解析的各个阶段建立一颗ast语法树
  function start(tag, attrs) {
    let node = createASTElement(tag, attrs);
    if (!root) {
      root = node;
    }
    // 如果有栈中有值，就将栈中最后一个元素作为parent
    if (currentParent) {
      // 这里要同时建立节点的父子关系
      node.parent = currentParent;
      currentParent.children.push(node);
    }
    // 将当前的节点推入栈中，并更新当前的父节点
    stack.push(node);
    currentParent = node;
  }
  function end(tag) {
    // 出栈并更新当前父节点
    stack.pop();
    currentParent = stack[stack.length - 1];
  }
  function char(text) {
    // 处理文本节点
    text = text.replace(/\s/g, "");
    text &&
      currentParent.children.push({
        type: TEXT_TYPE,
        text,
        parent: currentParent,
      });
  }
  // 解析开始标签，收集属性
  function parseStartTag() {
    const start = html.match(startTagOpen);
    if (start) {
      const match = {
        tagName: [start[1]], //标签名
        attrs: [],
      };
      advance(start[0].length);
      // 如果不是开始标签的结束，就一直匹配下去
      let attr, end;
      while (
        !(end = html.match(startTagClose)) &&
        (attr = html.match(attribute))
      ) {
        advance(attr[0].length);
        match.attrs.push({
          name: attr[1],
          value: attr[3] || attr[4] || attr[5] || true,
        });
      }
      if (end) {
        advance(end[0].length);
      }
      return match;
    }
    return false;
  }
  while (html) {
    // textEnd如果为0，就是一个开始标签或结束标签
    //textEnd>0,说明是一个文本
    let textEnd = html.indexOf("<"); //如果indexOf中的索引是0，就是一个标签
    if (textEnd == 0) {
      const startTagMatch = parseStartTag();
      if (startTagMatch) {
        // 解析到开始标签
        start(startTagMatch.tagName, startTagMatch.attrs);
        continue;
      }
      let endTagMatch = html.match(endTag);
      if (endTagMatch) {
        advance(endTagMatch[0].length);
        end(endTagMatch[1]);
        continue;
      }
    }
    if (textEnd > 0) {
      let text = html.substring(0, textEnd); //文本内容
      if (text) {
        char(text);
        advance(text.length);
      }
      continue;
    }
  }
  return root;
}
