import "./style.css";
import Split from "split-grid";

const $ = (selector) => document.querySelector(selector);
Split({
  columnGutters: [{ track: 1, element: $(".gutter-col-1") }],
  rowGutters: [{ track: 1, element: $(".gutter-row-1") }],
});

const $js = $("#js");
const $css = $("#css");
const $html = $("#html");

$js.addEventListener("input", update);
$css.addEventListener("input", update);
$html.addEventListener("input", update);

function safeAtob(str) {
  try {
    return str ? window.atob(str) : "";
  } catch {
    return "";
  }
}

function init() {
  const hash = window.location.hash.slice(1);
  if (!hash) return;

  const [rawHtml, rawCss, rawJs] = hash.split("|");

  const html = decode(rawHtml);
  const css = decode(rawCss);
  const js = decode(rawJs);

  $html.value = html;
  $css.value = css;
  $js.value = js;

  const finalhtml = createHtml({ html, css, js });
  $("iframe").setAttribute("srcdoc", finalhtml);
}

function encode(str) {
  return window.btoa(unescape(encodeURIComponent(str)));
}

function decode(str) {
  return decodeURIComponent(escape(window.atob(str)));
}

function update() {
  const html = $html.value;
  const css = $css.value;
  const js = $js.value;

  const hashedCode = `${encode(html)}|${encode(css)}|${encode(js)}`;
  window.history.replaceState(null, null, `#${hashedCode}`);

  const finalhtml = createHtml({ html, css, js });
  $("iframe").setAttribute("srcdoc", finalhtml);
}

const createHtml = ({ html, css, js }) => {
  const cleanJS = js
    .replace(/<\/script>/gi, "<\\/script>")
    .replace(/\/\/# sourceMappingURL=.*$/gm, "");

  return `
    <html>
      <head>
        <style>${css}</style>
      </head>
      <body>
        ${html}
        <script type="module">
        try {
          ${cleanJS}
        } catch (err) {
          console.error("Error en tu JS:", err);
        }
        </script>
      </body>
    </html>
  `;
};

init();
