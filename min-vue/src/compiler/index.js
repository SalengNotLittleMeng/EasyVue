const ncname = `[a-zA-Z_][\\-\\.0-9_a-zA-Z]*`;
const qnameCapture = `((?:${ncname}\\:)?${ncname})`;
const startTagOpen = new RegExp(`^<${qnameCapture}`);
const endTag = new RegExp(`^<\\/${qnameCapture}[^>]>*>`);
const attribute =
  /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>']+)))?/;
const startTagClose = /^\s*(\/?)>/;
const defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g;

export function complieToFunction(template) {
  console.log(template);
}
o9;
