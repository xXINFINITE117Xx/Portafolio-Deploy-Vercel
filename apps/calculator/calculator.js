/**
 * Calculadora Científica Avanzada v3
 * Layout tipo referencia · math.js + nerdamer · OCR · gráfica · historial
 */
(function () {
  "use strict";

  var HIST_KEY = "calcSciHistory_v3";
  var exprEl = document.getElementById("display-expr");
  var resultEl = document.getElementById("display-result");
  var metaEl = document.getElementById("display-meta");
  var stepsCard = document.getElementById("steps-card");
  var stepsList = document.getElementById("steps-list");
  var historyList = document.getElementById("history-list");
  var histSearch = document.getElementById("hist-search");

  var expr = "0";
  var ans = 0;
  var justEval = false;
  var angleDeg = true;
  var second = false;
  var graphZoom = 1;
  var graphFn = "sin(x)";
  var history = loadHist();

  function loadHist() {
    try {
      return JSON.parse(localStorage.getItem(HIST_KEY) || "[]");
    } catch (e) {
      return [];
    }
  }
  function saveHist() {
    localStorage.setItem(HIST_KEY, JSON.stringify(history.slice(0, 50)));
  }
  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }
  function formatNum(v) {
    if (v == null) return "—";
    if (typeof v === "object" && v.toString) {
      try {
        return String(v);
      } catch (e) {}
    }
    var n = Number(v);
    if (!isFinite(n)) return String(v);
    return String(Math.round(n * 1e12) / 1e12);
  }
  function normalize(s) {
    return String(s)
      .replace(/×/g, "*")
      .replace(/÷/g, "/")
      .replace(/−/g, "-")
      .replace(/π/g, "pi")
      .replace(/√/g, "sqrt")
      .replace(/(\d)\(/g, "$1*(")
      .replace(/\)(\d)/g, ")*$1")
      .replace(/(\d)(pi|e|sin|cos|tan|log|ln|sqrt)/gi, "$1*$2")
      .replace(/(pi|e)(\d)/gi, "$1*$2");
  }

  function setExpr(v) {
    expr = v;
    exprEl.textContent = expr;
  }
  function setResult(v, meta) {
    resultEl.textContent = v;
    if (meta) metaEl.textContent = meta;
  }

  function showResult(inputExpr, result, meta, steps) {
    setExpr(inputExpr);
    setResult(result, meta || "Resultado · Precisión: 64-bit");
    if (steps && steps.length) {
      stepsCard.hidden = false;
      stepsList.innerHTML = steps
        .map(function (s) {
          if (typeof s === "string") return "<li>" + s + "</li>";
          return (
            '<li><span class="step-title">' +
            escapeHtml(s.title) +
            "</span>" +
            (s.detail || "") +
            "</li>"
          );
        })
        .join("");
    } else {
      stepsCard.hidden = true;
      stepsList.innerHTML = "";
    }
    var n = Number(result);
    if (isFinite(n)) ans = n;
    history.unshift({
      expr: inputExpr,
      result: String(result),
      meta: meta || "",
      steps: steps || [],
      t: Date.now(),
    });
    history = history.slice(0, 50);
    saveHist();
    renderHistory();
    // Actualizar gráfica si parece función de x
    if (/x/i.test(inputExpr) && inputExpr.indexOf("=") === -1) {
      graphFn = normalize(inputExpr);
      document.getElementById("graph-eq").textContent = "y = " + inputExpr;
      drawGraph();
    }
  }

  function evalExpr(raw) {
    var s = normalize(raw);
    if (typeof math !== "undefined") {
      var scope = {
        ans: ans,
        deg: function (x) {
          return (x * Math.PI) / 180;
        },
      };
      // Wrappers for deg mode
      if (angleDeg) {
        math.config({ angle: math.unit ? undefined : undefined });
        var parser = math.parser();
        parser.set("ans", ans);
        // replace trig for degrees
        s = s
          .replace(/sin\(/g, "sin(deg(")
          .replace(/cos\(/g, "cos(deg(")
          .replace(/tan\(/g, "tan(deg(");
        // deg helper
        s = s.replace(/deg\(/g, "((pi/180)*(");
        // Fix: better approach - custom
      }
      // simpler deg handling
      if (angleDeg) {
        return math.evaluate(wrapTrigDeg(normalize(raw)), { ans: ans });
      }
      return math.evaluate(normalize(raw), { ans: ans });
    }
    throw new Error("math.js no cargó");
  }

  function wrapTrigDeg(s) {
    // sin(x) -> sin(x*pi/180) when in deg mode for numeric x-like
    return s
      .replace(/\bsin\(([^)]+)\)/g, "sin(($1)*pi/180)")
      .replace(/\bcos\(([^)]+)\)/g, "cos(($1)*pi/180)")
      .replace(/\btan\(([^)]+)\)/g, "tan(($1)*pi/180)");
  }

  function solve(raw) {
    var steps = [
      { title: "1. Expresión", detail: "<code>" + escapeHtml(raw) + "</code>" },
      {
        title: "2. Modo angular",
        detail: angleDeg ? "Grados (deg)" : "Radianes (rad)",
      },
    ];
    try {
      if (raw.indexOf("=") !== -1 && typeof nerdamer !== "undefined") {
        var parts = raw.split("=");
        var eq = "(" + parts[0] + ")-(" + parts[1] + ")";
        steps.push({
          title: "3. Ecuación f(x)=0",
          detail: "<code>" + escapeHtml(eq) + "</code>",
        });
        var sols = nerdamer.solve(eq, "x");
        var text = sols.toString();
        try {
          text = nerdamer(sols).evaluate().text("decimals");
        } catch (e1) {}
        steps.push({
          title: "4. Solución",
          detail: "<code>x = " + escapeHtml(text) + "</code>",
        });
        showResult(raw, "x = " + text, "Álgebra · nerdamer", steps);
        justEval = true;
        return;
      }
      steps.push({
        title: "3. Evaluación",
        detail: "Motor <strong>math.js</strong> (64-bit float)",
      });
      var val = evalExpr(raw);
      var out = formatNum(val);
      steps.push({
        title: "4. Resultado",
        detail: "<code>" + escapeHtml(out) + "</code>",
      });
      showResult(
        raw,
        out,
        "Resultado ≈ " + out + " · Precisión: 64-bit",
        steps,
      );
      expr = out;
      justEval = true;
    } catch (e) {
      showResult(raw, "Error", e.message, [
        { title: "Error", detail: escapeHtml(e.message) },
      ]);
    }
  }

  /* ---------- Key actions ---------- */
  function insert(token) {
    if (justEval) {
      if (/^[0-9.]$/.test(token)) {
        expr = token === "." ? "0." : token;
      } else if (["+", "-", "*", "/", "^"].indexOf(token) !== -1) {
        expr = expr + token;
      } else if (token === "ans") {
        expr = String(ans);
      } else {
        expr = token;
      }
      justEval = false;
      setResult("", "Resultado · Precisión: 64-bit");
      stepsCard.hidden = true;
    } else if (expr === "0" && /^[0-9]$/.test(token)) {
      expr = token;
    } else if (expr === "0" && token === ".") {
      expr = "0.";
    } else if (expr === "0" && token === "(") {
      expr = "(";
    } else if (
      expr === "0" &&
      ["+", "-", "*", "/", "^"].indexOf(token) !== -1
    ) {
      expr = "0" + token;
    } else {
      expr += token;
    }
    setExpr(expr);
  }

  function onAct(act) {
    switch (act) {
      case "clear":
        expr = "0";
        justEval = false;
        setExpr("0");
        setResult("0", "Resultado · Precisión: 64-bit");
        stepsCard.hidden = true;
        break;
      case "back":
        if (justEval) {
          expr = "0";
          justEval = false;
        } else {
          expr = expr.length <= 1 ? "0" : expr.slice(0, -1);
        }
        setExpr(expr);
        break;
      case "eq":
        solve(expr);
        break;
      case "ans":
        insert(String(ans));
        break;
      case "2nd":
        second = !second;
        document
          .getElementById("btn-2nd")
          .classList.toggle("active-2nd", second);
        break;
      case "deg":
        angleDeg = !angleDeg;
        document.getElementById("btn-deg").textContent = angleDeg
          ? "deg/rad"
          : "rad/deg";
        metaEl.textContent =
          (angleDeg ? "Modo: grados" : "Modo: radianes") +
          " · Precisión: 64-bit";
        break;
      case "sin":
        insert(second ? "asin(" : "sin(");
        second = false;
        document.getElementById("btn-2nd").classList.remove("active-2nd");
        break;
      case "cos":
        insert(second ? "acos(" : "cos(");
        second = false;
        document.getElementById("btn-2nd").classList.remove("active-2nd");
        break;
      case "tan":
        insert(second ? "atan(" : "tan(");
        second = false;
        document.getElementById("btn-2nd").classList.remove("active-2nd");
        break;
      case "ln":
        insert("log(");
        break;
      case "log10":
        insert("log10(");
        break;
      case "log2":
        insert("log2(");
        break;
      case "exp":
        insert("exp(");
        break;
      case "pow10":
        insert("10^(");
        break;
      case "sqrt":
        insert("sqrt(");
        break;
      case "sq":
        insert("^2");
        break;
      case "pi":
        insert("pi");
        break;
      case "e":
        insert("e");
        break;
      case "pow":
        insert("^");
        break;
      case "invx":
        insert("^(1/");
        break;
      case "inv":
        insert("^(−1)");
        // fix minus
        expr = expr.replace("^(−1)", "^(-1)");
        setExpr(expr);
        break;
      case "fact":
        insert("!");
        break;
      case "mod":
        insert(" mod ");
        break;
      case "abs":
        insert("abs(");
        break;
      case "pct":
        try {
          var v = evalExpr(expr);
          expr = formatNum(Number(v) / 100);
          setExpr(expr);
          justEval = true;
        } catch (e) {}
        break;
      case "sum":
        insert("sum(");
        break;
      case "int":
        insert("integrate(");
        break;
      case "(":
      case ")":
      case "+":
      case "-":
      case "*":
      case "/":
      case ".":
        insert(act);
        break;
      default:
        if (/^[0-9]$/.test(act)) insert(act);
        break;
    }
  }

  document.querySelectorAll(".key[data-act]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      onAct(btn.dataset.act);
    });
  });

  // Keyboard
  document.addEventListener("keydown", function (e) {
    if (e.target.matches("input, textarea")) return;
    var k = e.key;
    if (/^[0-9]$/.test(k)) onAct(k);
    else if (k === ".") onAct(".");
    else if (k === "+") onAct("+");
    else if (k === "-") onAct("-");
    else if (k === "*") onAct("*");
    else if (k === "/") {
      e.preventDefault();
      onAct("/");
    } else if (k === "Enter" || k === "=") {
      e.preventDefault();
      onAct("eq");
    } else if (k === "Backspace") {
      e.preventDefault();
      onAct("back");
    } else if (k === "Escape") onAct("clear");
    else if (k === "(") onAct("(");
    else if (k === ")") onAct(")");
  });

  /* ---------- History ---------- */
  function formatTime(ts) {
    var d = new Date(ts);
    var now = new Date();
    var same =
      d.getDate() === now.getDate() &&
      d.getMonth() === now.getMonth() &&
      d.getFullYear() === now.getFullYear();
    var t =
      String(d.getHours()).padStart(2, "0") +
      ":" +
      String(d.getMinutes()).padStart(2, "0");
    return same
      ? "Hoy " + t
      : d.toLocaleDateString("es-ES", { day: "2-digit", month: "short" }) +
          " " +
          t;
  }

  function renderHistory() {
    var q = (histSearch.value || "").toLowerCase();
    var list = history.filter(function (h) {
      if (!q) return true;
      return (
        String(h.expr).toLowerCase().indexOf(q) !== -1 ||
        String(h.result).toLowerCase().indexOf(q) !== -1
      );
    });
    if (!list.length) {
      historyList.innerHTML =
        '<li style="color:var(--muted);font-size:0.85rem">Sin resultados</li>';
      return;
    }
    historyList.innerHTML = list
      .map(function (h, i) {
        var idx = history.indexOf(h);
        return (
          '<li data-i="' +
          idx +
          '"><div><div class="h-expr">' +
          escapeHtml(h.expr) +
          '</div><div class="h-res">= ' +
          escapeHtml(h.result) +
          '</div></div><span class="h-time">' +
          formatTime(h.t) +
          "</span></li>"
        );
      })
      .join("");
  }
  histSearch.addEventListener("input", renderHistory);
  historyList.addEventListener("click", function (e) {
    var li = e.target.closest("li[data-i]");
    if (!li) return;
    var h = history[+li.dataset.i];
    if (!h) return;
    expr = h.expr;
    justEval = true;
    setExpr(h.expr);
    setResult(h.result, h.meta || "");
    if (h.steps && h.steps.length) {
      stepsCard.hidden = false;
      stepsList.innerHTML = h.steps
        .map(function (s) {
          if (typeof s === "string") return "<li>" + s + "</li>";
          return (
            '<li><span class="step-title">' +
            escapeHtml(s.title) +
            "</span>" +
            (s.detail || "") +
            "</li>"
          );
        })
        .join("");
    }
  });
  document
    .getElementById("btn-hist-clear")
    .addEventListener("click", function () {
      history = [];
      saveHist();
      renderHistory();
    });
  document
    .getElementById("btn-hist-csv")
    .addEventListener("click", function () {
      var csv =
        "expr,result,time\n" +
        history
          .map(function (h) {
            return (
              '"' +
              String(h.expr).replace(/"/g, '""') +
              '","' +
              String(h.result).replace(/"/g, '""') +
              '",' +
              new Date(h.t).toISOString()
            );
          })
          .join("\n");
      var a = document.createElement("a");
      a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
      a.download = "historial-calc.csv";
      a.click();
    });

  /* ---------- Graph ---------- */
  var gCanvas = document.getElementById("graph-canvas");
  var gctx = gCanvas.getContext("2d");

  function drawGraph() {
    var dpr = window.devicePixelRatio || 1;
    var w = gCanvas.clientWidth || 400;
    var h = 180;
    gCanvas.width = w * dpr;
    gCanvas.height = h * dpr;
    gctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    gctx.clearRect(0, 0, w, h);
    gctx.fillStyle = "rgba(5,10,24,0.9)";
    gctx.fillRect(0, 0, w, h);

    // grid
    gctx.strokeStyle = "rgba(0,240,255,0.08)";
    gctx.lineWidth = 1;
    for (var gx = 0; gx < w; gx += 20) {
      gctx.beginPath();
      gctx.moveTo(gx, 0);
      gctx.lineTo(gx, h);
      gctx.stroke();
    }
    for (var gy = 0; gy < h; gy += 20) {
      gctx.beginPath();
      gctx.moveTo(0, gy);
      gctx.lineTo(w, gy);
      gctx.stroke();
    }
    // axes
    gctx.strokeStyle = "rgba(255,45,149,0.35)";
    gctx.beginPath();
    gctx.moveTo(0, h / 2);
    gctx.lineTo(w, h / 2);
    gctx.moveTo(w / 2, 0);
    gctx.lineTo(w / 2, h);
    gctx.stroke();

    var xMin = -Math.PI * 2 * graphZoom;
    var xMax = Math.PI * 2 * graphZoom;
    var yScale = (h / 2 - 10) / (2 * graphZoom);

    gctx.strokeStyle = "#00f0ff";
    gctx.lineWidth = 2;
    gctx.shadowColor = "#00f0ff";
    gctx.shadowBlur = 8;
    gctx.beginPath();
    var started = false;
    for (var px = 0; px < w; px++) {
      var x = xMin + (px / w) * (xMax - xMin);
      var y;
      try {
        if (typeof math !== "undefined") {
          y = math.evaluate(graphFn, { x: x });
        } else {
          y = Math.sin(x);
        }
        if (!isFinite(y)) {
          started = false;
          continue;
        }
        var py = h / 2 - y * yScale;
        if (!started) {
          gctx.moveTo(px, py);
          started = true;
        } else gctx.lineTo(px, py);
      } catch (e) {
        started = false;
      }
    }
    gctx.stroke();
    gctx.shadowBlur = 0;
  }
  document.getElementById("btn-zoom-in").addEventListener("click", function () {
    graphZoom = Math.max(0.25, graphZoom * 0.7);
    drawGraph();
  });
  document
    .getElementById("btn-zoom-out")
    .addEventListener("click", function () {
      graphZoom = Math.min(4, graphZoom * 1.4);
      drawGraph();
    });
  window.addEventListener("resize", drawGraph);

  /* ---------- OCR ---------- */
  var imgPreview = document.getElementById("img-preview");
  var processCanvas = document.getElementById("ocr-process");
  var ocrDrop = document.getElementById("ocr-drop");
  var ocrRow = document.getElementById("ocr-row");

  function preprocess(source) {
    var sw = source.naturalWidth || source.width;
    var sh = source.naturalHeight || source.height;
    var scale = Math.min(3, Math.max(2, 1000 / sw));
    var w = Math.round(sw * scale);
    var h = Math.round(sh * scale);
    processCanvas.width = w;
    processCanvas.height = h;
    var ctx = processCanvas.getContext("2d");
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, w, h);
    ctx.drawImage(source, 0, 0, w, h);
    var img = ctx.getImageData(0, 0, w, h);
    var d = img.data;
    var sum = 0;
    for (var i = 0; i < d.length; i += 4) {
      var g = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
      g = Math.min(255, Math.max(0, (g - 128) * 1.4 + 128));
      d[i] = d[i + 1] = d[i + 2] = g;
      sum += g;
    }
    var thr = (sum / (d.length / 4)) * 0.92;
    for (var j = 0; j < d.length; j += 4) {
      var v = d[j] > thr ? 255 : 0;
      d[j] = d[j + 1] = d[j + 2] = v;
    }
    ctx.putImageData(img, 0, 0);
    return processCanvas;
  }

  function cleanOCR(t) {
    return String(t || "")
      .replace(/\n+/g, "")
      .replace(/O/g, "0")
      .replace(/×/g, "*")
      .replace(/÷/g, "/")
      .replace(/−/g, "-")
      .replace(/[^0-9a-zA-Z+\-*/^=().xX\s]/g, "")
      .replace(/X/g, "x")
      .replace(/\s+/g, "")
      .trim();
  }

  function loadImageFile(file) {
    if (!file || !file.type.match(/^image\//)) return;
    var url = URL.createObjectURL(file);
    imgPreview.onload = function () {
      imgPreview.hidden = false;
      ocrRow.hidden = false;
    };
    imgPreview.src = url;
  }

  document.getElementById("btn-upload").addEventListener("click", function () {
    document.getElementById("img-input").click();
  });
  document.getElementById("img-input").addEventListener("change", function (e) {
    loadImageFile(e.target.files && e.target.files[0]);
  });
  ocrDrop.addEventListener("dragover", function (e) {
    e.preventDefault();
    ocrDrop.classList.add("dragover");
  });
  ocrDrop.addEventListener("dragleave", function () {
    ocrDrop.classList.remove("dragover");
  });
  ocrDrop.addEventListener("drop", function (e) {
    e.preventDefault();
    ocrDrop.classList.remove("dragover");
    loadImageFile(e.dataTransfer.files && e.dataTransfer.files[0]);
  });
  document.addEventListener("paste", function (e) {
    var items = e.clipboardData && e.clipboardData.items;
    if (!items) return;
    for (var i = 0; i < items.length; i++) {
      if (items[i].type.indexOf("image") !== -1) {
        loadImageFile(items[i].getAsFile());
        break;
      }
    }
  });

  document.getElementById("btn-ocr-run").addEventListener("click", function () {
    var status = document.getElementById("ocr-status");
    if (imgPreview.hidden || typeof Tesseract === "undefined") {
      status.textContent = "Sube una imagen y espera a que cargue Tesseract.";
      return;
    }
    status.textContent = "OCR…";
    var src = preprocess(imgPreview);
    Tesseract.recognize(src, "eng", {
      logger: function (m) {
        if (m.status === "recognizing text") {
          status.textContent =
            "OCR " + Math.round((m.progress || 0) * 100) + "%";
        }
      },
      tessedit_char_whitelist: "0123456789+-*/=()xX.^ ",
    })
      .then(function (res) {
        var t = cleanOCR(res.data && res.data.text);
        document.getElementById("ocr-result").value = t;
        status.textContent = t
          ? "Revisa el texto y pulsa RESOLVER"
          : "Sin texto detectado";
      })
      .catch(function (e) {
        status.textContent = e.message;
      });
  });

  document
    .getElementById("btn-ocr-solve")
    .addEventListener("click", function () {
      var t = document.getElementById("ocr-result").value.trim();
      if (!t) return;
      expr = t;
      setExpr(t);
      solve(t);
    });

  /* ---------- Export ---------- */
  async function capture() {
    var wrap = document.createElement("div");
    wrap.style.cssText =
      "position:fixed;left:-9999px;padding:24px;background:#050814;color:#e8f4ff;width:700px;font-family:Inter,sans-serif;";
    var clone = document.querySelector(".input-card").cloneNode(true);
    wrap.appendChild(clone);
    if (!stepsCard.hidden) wrap.appendChild(stepsCard.cloneNode(true));
    document.body.appendChild(wrap);
    var c = await html2canvas(wrap, { backgroundColor: "#050814", scale: 2 });
    document.body.removeChild(wrap);
    return c;
  }
  document
    .getElementById("btn-png")
    .addEventListener("click", async function () {
      try {
        var c = await capture();
        var a = document.createElement("a");
        a.download = "calculo.png";
        a.href = c.toDataURL("image/png");
        a.click();
      } catch (e) {
        alert(e.message);
      }
    });
  document
    .getElementById("btn-pdf")
    .addEventListener("click", async function () {
      try {
        var c = await capture();
        var pdf = new window.jspdf.jsPDF({ unit: "pt", format: "a4" });
        var pw = pdf.internal.pageSize.getWidth();
        var m = 40;
        var w = pw - m * 2;
        var h = (c.height * w) / c.width;
        pdf.setFillColor(5, 8, 20);
        pdf.rect(0, 0, pw, pdf.internal.pageSize.getHeight(), "F");
        pdf.addImage(
          c.toDataURL("image/png"),
          "PNG",
          m,
          m,
          w,
          Math.min(h, 700),
        );
        pdf.save("calculo.pdf");
      } catch (e) {
        alert(e.message);
      }
    });

  /* Theme */
  document
    .getElementById("theme-toggle")
    .addEventListener("change", function (e) {
      document.body.classList.toggle("light", !e.target.checked);
    });

  renderHistory();
  drawGraph();
  setResult("0", "Resultado · Precisión: 64-bit");
})();
