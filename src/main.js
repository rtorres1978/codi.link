import "./style.css";
import Split from "split-grid";
import * as monaco from "monaco-editor";

import HtmlWorker from "monaco-editor/esm/vs/language/html/html.worker?worker";
import CssWorker from "monaco-editor/esm/vs/language/css/css.worker?worker";
import TsWorker from "monaco-editor/esm/vs/language/typescript/ts.worker?worker";
import EditorWorker from "monaco-editor/esm/vs/editor/editor.worker?worker";

self.MonacoEnvironment = {
  getWorker(_, label) {
    if (label === "css") return new CssWorker();
    if (label === "html") return new HtmlWorker();
    if (label === "typescript" || label === "javascript") return new TsWorker();
    return new EditorWorker();
  },
};

const $ = (sel) => document.querySelector(sel);

Split({
  columnGutters: [{ track: 1, element: $(".gutter-col-1") }],
  rowGutters: [{ track: 1, element: $(".gutter-row-1") }],
});

const hash = window.location.hash.slice(1);
const [rawHtml, rawCss, rawJs] = hash.split("|");
const decode = (str) =>
  str
    ? new TextDecoder().decode(
        Uint8Array.from(window.atob(str), (c) => c.charCodeAt(0))
      )
    : "";

const html = decode(rawHtml);
const css = decode(rawCss);
const js = decode(rawJs);

// ---- Crear editores ----
const htmlEditor = monaco.editor.create($("#html"), {
  value: html || "<h1>Hola 👋</h1>",
  language: "html",
  theme: "vs-dark",
});

const cssEditor = monaco.editor.create($("#css"), {
  value: css || "body { font-family: sans-serif; }",
  language: "css",
  theme: "vs-dark",
});

const jsEditor = monaco.editor.create($("#js"), {
  value: js || "console.log('Hello World');",
  language: "javascript",
  theme: "vs-dark",
});

// ---- Actualizar preview ----
let timer;
function update() {
  clearTimeout(timer);
  timer = setTimeout(() => {
    const html = htmlEditor.getValue();
    const css = cssEditor.getValue();
    const js = jsEditor.getValue();

    const encode = (str) =>
      window.btoa(String.fromCharCode(...new TextEncoder().encode(str)));

    const hashed = `${encode(html)}|${encode(css)}|${encode(js)}`;
    window.history.replaceState(null, null, `#${hashed}`);

    $("iframe").setAttribute("srcdoc", createHtml({ html, css, js }));
  }, 400);
}

[htmlEditor, cssEditor, jsEditor].forEach((ed) =>
  ed.onDidChangeModelContent(update)
);

// ---- Generar HTML final ----
function createHtml({ html, css, js }) {

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>${css}</style>
      </head>
      <body>
        ${html}
        <script>
          ${js}
        </script>
      </body>
    </html>
  `;
}

$("iframe").setAttribute("srcdoc", createHtml({ html, css, js }));
