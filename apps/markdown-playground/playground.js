(function () {
  "use strict";

  var STORAGE_KEY = "mdPlayground_v1";
  var editor = document.getElementById("editor");
  var preview = document.getElementById("preview");
  var stats = document.getElementById("stats");

  var SAMPLE =
    "# Markdown + Code Playground\n\n" +
    "Editor **cyberpunk** con preview en vivo.\n\n" +
    "## Características\n\n" +
    "- Markdown a la izquierda\n" +
    "- Preview a la derecha\n" +
    "- Resaltado de código con highlight.js\n\n" +
    "### Código JavaScript\n\n" +
    "```js\n" +
    "function greet(name) {\n" +
    "  return `Hola, ${name}!`;\n" +
    "}\n" +
    'console.log(greet("Neo"));\n' +
    "```\n\n" +
    "### CSS\n\n" +
    "```css\n" +
    ".neon {\n" +
    "  color: #00FFD1;\n" +
    "  text-shadow: 0 0 12px rgba(0, 255, 209, 0.5);\n" +
    "}\n" +
    "```\n\n" +
    "> Tip: el contenido se guarda en localStorage.\n\n" +
    "| Stack | Uso |\n" +
    "| ----- | --- |\n" +
    "| HTML  | Estructura |\n" +
    "| CSS   | Estilos |\n" +
    "| JS    | Lógica |\n";

  if (window.marked) {
    marked.setOptions({
      gfm: true,
      breaks: true,
      highlight: function (code, lang) {
        if (window.hljs) {
          try {
            if (lang && hljs.getLanguage(lang)) {
              return hljs.highlight(code, { language: lang }).value;
            }
            return hljs.highlightAuto(code).value;
          } catch (e) {
            return code;
          }
        }
        return code;
      },
    });
  }

  function render() {
    var md = editor.value;
    stats.textContent =
      md.length + " caracteres · " + md.split(/\n/).length + " líneas";
    if (!window.marked) {
      preview.textContent = md;
      return;
    }
    preview.innerHTML = marked.parse(md);
    if (window.hljs) {
      preview.querySelectorAll("pre code").forEach(function (block) {
        hljs.highlightElement(block);
      });
    }
    try {
      localStorage.setItem(STORAGE_KEY, md);
    } catch (e) {}
  }

  var t = null;
  editor.addEventListener("input", function () {
    clearTimeout(t);
    t = setTimeout(render, 120);
  });

  // Tab inserts spaces
  editor.addEventListener("keydown", function (e) {
    if (e.key === "Tab") {
      e.preventDefault();
      var start = editor.selectionStart;
      var end = editor.selectionEnd;
      editor.value =
        editor.value.slice(0, start) + "  " + editor.value.slice(end);
      editor.selectionStart = editor.selectionEnd = start + 2;
      render();
    }
  });

  document.getElementById("btn-sample").addEventListener("click", function () {
    editor.value = SAMPLE;
    render();
  });

  document.getElementById("btn-clear").addEventListener("click", function () {
    editor.value = "";
    render();
  });

  document.getElementById("btn-copy").addEventListener("click", function () {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(editor.value);
    } else {
      editor.select();
      document.execCommand("copy");
    }
  });

  // Restore
  try {
    var saved = localStorage.getItem(STORAGE_KEY);
    editor.value = saved != null && saved !== "" ? saved : SAMPLE;
  } catch (e) {
    editor.value = SAMPLE;
  }
  render();
})();
