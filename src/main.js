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
  return window.btoa(String.fromCharCode(...new TextEncoder().encode(str)));
}

function decode(str) {
  try {
    return new TextDecoder().decode(
      Uint8Array.from(window.atob(str), (c) => c.charCodeAt(0))
    );
  } catch {
    return "";
  }
}


function update() {
  clearTimeout(timer);
  timer = setTimeout(() => {
    const html = $html.value;
    const css = $css.value;
    const js = $js.value;
  
    const hashedCode = `${encode(html)}|${encode(css)}|${encode(js)}`;
    window.history.replaceState(null, null, `#${hashedCode}`);
  
    const finalhtml = createHtml({ html, css, js });
    $("iframe").setAttribute("srcdoc", finalhtml);
  }, 500)
}

const createHtml = ({ html, css, js }) => {
  const cleanJS = js
    .replace(/<\/script>/gi, "<\\/script>")
    .replace(/\/\/# sourceMappingURL=.*$/gm, "");

  const safeHtml = html.replace(/<\/script>/gi, "<\\/script>");

  return `
    <html>
      <head>
        <meta charset="utf-8" />
        <style>${css || ""}</style>
      </head>
      <body>
        ${safeHtml}
        <script type="module">
        try {
          ${cleanJS}
        } catch (err) {
          console.error("Error en tu JS:", err);
          document.body.insertAdjacentHTML("beforeend", 
            "<pre style='color:red'>Error en tu JS: " + err.message + "</pre>"
          );
        }
        </script>
      </body>
    </html>
  `;
};

init();
