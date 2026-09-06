/**
 * main.js — Secciones, teclados, stats, gráficas, OCR, historial
 * Teclados se inicializan primero para evitar fallos por errores posteriores.
 */
(function () {
  "use strict";

  function $(id) {
    return document.getElementById(id);
  }
  function on(el, ev, fn) {
    if (el) el.addEventListener(ev, fn);
  }

  var expr = "0";
  var justEval = false;
  var second = false;
  var basicExpr = "0";
  var basicJust = false;

  var exprEl = $("display-expr");
  var resultEl = $("display-result");
  var metaEl = $("display-meta");
  var basicExprEl = $("basic-expr");
  var basicResEl = $("basic-result");

  function setExpr(v) {
    expr = String(v);
    if (exprEl) exprEl.textContent = expr;
  }
  function setResult(v, meta) {
    if (resultEl) resultEl.textContent = v;
    if (meta != null && metaEl) metaEl.textContent = meta;
  }
  function setBasic(v) {
    basicExpr = String(v);
    if (basicExprEl) basicExprEl.textContent = basicExpr;
  }

  /* ========== TECLADO BÁSICO (primero) ========== */
  function onBasic(act) {
    var isDigit = /^[0-9.]$/.test(act);
    var isOp = act === "+" || act === "-" || act === "*" || act === "/";

    if (act === "clear") {
      basicExpr = "0";
      basicJust = false;
      setBasic("0");
      if (basicResEl) basicResEl.textContent = "0";
      return;
    }
    if (act === "back") {
      if (basicJust) {
        basicExpr = "0";
        basicJust = false;
      } else {
        basicExpr = basicExpr.length <= 1 ? "0" : basicExpr.slice(0, -1);
      }
      setBasic(basicExpr);
      return;
    }
    if (act === "eq") {
      try {
        var val = CalcEngine.eval(basicExpr);
        var out = CalcUtils.formatNum(val);
        if (basicResEl) basicResEl.textContent = out;
        CalcEngine.ans = Number(out) || CalcEngine.ans;
        CalcHistory.add({
          expr: basicExpr,
          result: out,
          meta: "Básica",
          steps: CalcSteps.arithmetic(basicExpr, out, CalcEngine.angleDeg),
          t: Date.now(),
        });
        var hs = $("hist-search");
        CalcHistory.render(hs ? hs.value : "");
        basicExpr = out;
        setBasic(out);
        basicJust = true;
      } catch (e) {
        if (basicResEl) basicResEl.textContent = "Error";
      }
      return;
    }
    if (act === "sqrt") {
      basicExpr = basicJust
        ? "sqrt(" + basicExpr + ")"
        : basicExpr === "0"
          ? "sqrt("
          : basicExpr + "sqrt(";
      basicJust = false;
      setBasic(basicExpr);
      return;
    }
    if (act === "pct") {
      try {
        basicExpr = CalcUtils.formatNum(
          Number(CalcEngine.eval(basicExpr)) / 100,
        );
        setBasic(basicExpr);
        basicJust = true;
      } catch (e) {}
      return;
    }

    if (basicJust) {
      if (isDigit) basicExpr = act === "." ? "0." : act;
      else if (isOp) basicExpr = basicExpr + act;
      else basicExpr = basicExpr + act;
      basicJust = false;
      setBasic(basicExpr);
      return;
    }

    if (basicExpr === "0" && isDigit) basicExpr = act === "." ? "0." : act;
    else if (basicExpr === "0" && isOp) basicExpr = "0" + act;
    else if (basicExpr === "0" && act === "(") basicExpr = "(";
    else basicExpr += act;
    setBasic(basicExpr);
  }

  (function buildBasicPad() {
    var pad = $("basic-keypad");
    if (!pad) return;
    pad.innerHTML = "";
    var keys = [
      ["C", "fn", "clear"],
      ["⌫", "fn", "back"],
      ["%", "op", "pct"],
      ["÷", "op", "/"],
      ["7", "", "7"],
      ["8", "", "8"],
      ["9", "", "9"],
      ["×", "op", "*"],
      ["4", "", "4"],
      ["5", "", "5"],
      ["6", "", "6"],
      ["−", "op", "-"],
      ["1", "", "1"],
      ["2", "", "2"],
      ["3", "", "3"],
      ["+", "op", "+"],
      ["0", "", "0"],
      [".", "", "."],
      ["√", "fn", "sqrt"],
      ["=", "eq", "eq"],
    ];
    keys.forEach(function (k) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "key" + (k[1] ? " " + k[1] : "");
      b.textContent = k[0];
      b.setAttribute("data-basic", k[2]);
      b.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();
        onBasic(k[2]);
      });
      pad.appendChild(b);
    });
  })();

  /* ========== TECLADO CIENTÍFICO ========== */
  function insert(token) {
    if (justEval) {
      if (/^[0-9.]$/.test(token)) {
        expr = token === "." ? "0." : token;
      } else if (["+", "-", "*", "/", "^"].indexOf(token) !== -1) {
        expr = String(CalcEngine.ans) + token;
      } else {
        expr = token;
      }
      justEval = false;
      setResult("0", "Resultado · Precisión: 64-bit");
      if (window.CalcSteps) CalcSteps.clear();
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

  function applyResult(raw, payload) {
    setExpr(raw);
    setResult(payload.result, payload.meta);
    CalcSteps.render(payload.steps);
    var n = Number(String(payload.result).replace(/^x\s*=\s*/, ""));
    if (isFinite(n)) CalcEngine.ans = n;
    CalcHistory.add({
      expr: raw,
      result: String(payload.result),
      meta: payload.meta || "",
      steps: payload.steps || [],
      t: Date.now(),
    });
    var hs = $("hist-search");
    CalcHistory.render(hs ? hs.value : "");
  }

  function solveCurrent() {
    try {
      var payload = CalcEngine.solve(expr);
      applyResult(expr, payload);
      var cleaned = String(payload.result).replace(/^x\s*=\s*/, "");
      if (isFinite(Number(cleaned))) expr = cleaned;
      justEval = true;
    } catch (e) {
      applyResult(expr, {
        result: "Error",
        meta: e.message,
        steps: [{ title: "Error", detail: CalcUtils.escapeHtml(e.message) }],
      });
    }
  }

  function onAct(act) {
    var btn2nd = $("btn-2nd");
    switch (act) {
      case "clear":
        expr = "0";
        justEval = false;
        setExpr("0");
        setResult("0", "Resultado · Precisión: 64-bit");
        if (window.CalcSteps) CalcSteps.clear();
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
        solveCurrent();
        break;
      case "ans":
        insert(String(CalcEngine.ans));
        break;
      case "2nd":
        second = !second;
        if (btn2nd) btn2nd.classList.toggle("active-2nd", second);
        break;
      case "deg":
        CalcEngine.angleDeg = !CalcEngine.angleDeg;
        if ($("btn-deg")) {
          $("btn-deg").textContent = CalcEngine.angleDeg
            ? "deg/rad"
            : "rad/deg";
        }
        if (metaEl) {
          metaEl.textContent =
            (CalcEngine.angleDeg ? "Modo: grados" : "Modo: radianes") +
            " · Precisión: 64-bit";
        }
        break;
      case "sin":
        insert(second ? "asin(" : "sin(");
        second = false;
        if (btn2nd) btn2nd.classList.remove("active-2nd");
        break;
      case "cos":
        insert(second ? "acos(" : "cos(");
        second = false;
        if (btn2nd) btn2nd.classList.remove("active-2nd");
        break;
      case "tan":
        insert(second ? "atan(" : "tan(");
        second = false;
        if (btn2nd) btn2nd.classList.remove("active-2nd");
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
        insert("^(-1)");
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
          expr = CalcUtils.formatNum(Number(CalcEngine.eval(expr)) / 100);
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
    }
  }

  // Delegación de eventos en panel científico (más fiable que nodos sueltos)
  var padCard = document.querySelector("#section-calc .pad-card");
  if (padCard) {
    padCard.addEventListener("click", function (e) {
      var btn = e.target.closest(".key[data-act]");
      if (!btn) return;
      e.preventDefault();
      onAct(btn.getAttribute("data-act"));
    });
  }
  // Fallback: todos los data-act
  document
    .querySelectorAll("#section-calc .key[data-act]")
    .forEach(function (btn) {
      btn.addEventListener("click", function (e) {
        e.preventDefault();
        onAct(btn.getAttribute("data-act"));
      });
    });

  /* ========== SECCIONES ========== */
  function showSection(id) {
    document.querySelectorAll(".section-panel").forEach(function (p) {
      p.classList.remove("active");
    });
    document.querySelectorAll(".sec-btn").forEach(function (b) {
      b.classList.toggle("active", b.getAttribute("data-section") === id);
    });
    var panel = $("section-" + id);
    if (panel) panel.classList.add("active");
    if (id === "graph2d" && window.CalcGraph) CalcGraph.draw();
    if (id === "graph3d" && window.CalcGraph3D) CalcGraph3D.draw();
    if (id === "ocr" && window.CalcDraw) CalcDraw.resize();
  }

  document.querySelectorAll(".sec-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      showSection(btn.getAttribute("data-section"));
    });
  });

  /* Teclado físico */
  document.addEventListener("keydown", function (e) {
    if (e.target.matches("input, textarea")) return;
    var active = document.querySelector(".section-panel.active");
    var sid = active ? active.id : "";
    var k = e.key;

    if (sid === "section-basic") {
      if (/^[0-9]$/.test(k)) onBasic(k);
      else if (k === ".") onBasic(".");
      else if (k === "+") onBasic("+");
      else if (k === "-") onBasic("-");
      else if (k === "*") onBasic("*");
      else if (k === "/") {
        e.preventDefault();
        onBasic("/");
      } else if (k === "Enter" || k === "=") {
        e.preventDefault();
        onBasic("eq");
      } else if (k === "Backspace") {
        e.preventDefault();
        onBasic("back");
      } else if (k === "Escape") onBasic("clear");
      return;
    }

    if (sid !== "section-calc") return;
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

  /* Historial */
  if (window.CalcHistory) {
    CalcHistory.load();
    CalcHistory.render();
  }
  on($("hist-search"), "input", function (e) {
    CalcHistory.render(e.target.value);
  });
  on($("btn-hist-clear"), "click", function () {
    CalcHistory.clear();
    CalcHistory.render();
  });
  on($("btn-hist-csv"), "click", function () {
    CalcHistory.exportCSV();
  });
  on($("history-list"), "click", function (e) {
    var li = e.target.closest("li[data-i]");
    if (!li) return;
    var h = CalcHistory.get()[+li.getAttribute("data-i")];
    if (!h) return;
    expr = h.expr;
    justEval = true;
    setExpr(h.expr);
    setResult(h.result, h.meta || "");
    CalcSteps.render(h.steps);
    showSection("calc");
  });
  on($("btn-hist-png"), "click", function () {
    CalcExport.historyPng().catch(function (err) {
      alert(err.message);
    });
  });
  on($("btn-hist-pdf"), "click", function () {
    CalcExport.historyPdf().catch(function (err) {
      alert(err.message);
    });
  });

  /* Gráficas */
  if (window.CalcGraph) CalcGraph.init();
  if (window.CalcGraph3D) CalcGraph3D.init();
  on($("btn-plot-2d"), "click", function () {
    var fn = ($("fn2d-input") && $("fn2d-input").value.trim()) || "sin(x)";
    CalcGraph.setRange($("x-min").value, $("x-max").value);
    CalcGraph.setFn(fn);
  });
  on($("btn-zoom-in"), "click", function () {
    CalcGraph.zoomIn();
  });
  on($("btn-zoom-out"), "click", function () {
    CalcGraph.zoomOut();
  });
  on($("btn-reset-2d"), "click", function () {
    CalcGraph.reset();
  });
  document.querySelectorAll("#fn2d-presets .chip").forEach(function (c) {
    c.addEventListener("click", function () {
      if ($("fn2d-input")) $("fn2d-input").value = c.getAttribute("data-fn");
      CalcGraph.setFn(c.getAttribute("data-fn"));
    });
  });
  on($("btn-plot-3d"), "click", function () {
    CalcGraph3D.setFn(
      $("fn3d-input").value.trim(),
      $("range-3d").value,
      $("res-3d").value,
    );
  });
  document.querySelectorAll("#fn3d-presets .chip").forEach(function (c) {
    c.addEventListener("click", function () {
      if ($("fn3d-input")) $("fn3d-input").value = c.getAttribute("data-fn");
      CalcGraph3D.setFn(
        c.getAttribute("data-fn"),
        $("range-3d").value,
        $("res-3d").value,
      );
    });
  });

  /* OCR */
  document.querySelectorAll(".ocr-tab").forEach(function (tab) {
    tab.addEventListener("click", function () {
      document.querySelectorAll(".ocr-tab").forEach(function (t) {
        t.classList.remove("active");
      });
      tab.classList.add("active");
      var id = tab.getAttribute("data-ocr");
      if ($("ocr-upload"))
        $("ocr-upload").classList.toggle("hidden", id !== "upload");
      if ($("ocr-draw"))
        $("ocr-draw").classList.toggle("hidden", id !== "draw");
      if (id === "draw" && window.CalcDraw) CalcDraw.resize();
    });
  });
  if (window.CalcDraw) CalcDraw.init();
  on($("btn-draw-clear"), "click", function () {
    CalcDraw.clear();
  });

  var imgPreview = $("img-preview");
  var ocrDrop = $("ocr-drop");
  var ocrRow = $("ocr-row");

  function loadImageFile(file) {
    if (!file || !file.type.match(/^image\//)) return;
    var url = URL.createObjectURL(file);
    if (imgPreview) {
      imgPreview.onload = function () {
        imgPreview.hidden = false;
        if (ocrRow) ocrRow.hidden = false;
      };
      imgPreview.src = url;
    }
  }

  on($("btn-upload"), "click", function () {
    if ($("img-input")) $("img-input").click();
  });
  on($("img-input"), "change", function (e) {
    loadImageFile(e.target.files && e.target.files[0]);
  });
  if (ocrDrop) {
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
  }
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

  on($("btn-ocr-run"), "click", function () {
    var status = $("ocr-status");
    var activeTab = document.querySelector(".ocr-tab.active");
    var mode = activeTab ? activeTab.getAttribute("data-ocr") : "upload";
    var source =
      mode === "upload"
        ? imgPreview && !imgPreview.hidden
          ? imgPreview
          : null
        : CalcDraw.hasInk()
          ? CalcDraw.getCanvas()
          : null;
    if (!source) {
      if (status)
        status.textContent =
          mode === "upload" ? "Sube una imagen" : "Escribe en el lienzo";
      return;
    }
    if (status) status.textContent = "OCR…";
    CalcOCR.recognize(source, function (p) {
      if (status) status.textContent = "OCR " + p + "%";
    })
      .then(function (text) {
        if ($("ocr-result")) $("ocr-result").value = text;
        if (status)
          status.textContent = text
            ? "Revisa y pulsa RESOLVER"
            : "Sin texto detectado";
        if (ocrRow) ocrRow.hidden = false;
      })
      .catch(function (err) {
        if (status) status.textContent = err.message;
      });
  });

  on($("btn-ocr-solve"), "click", function () {
    var t = ($("ocr-result") && $("ocr-result").value.trim()) || "";
    if (!t) return;
    expr = t;
    setExpr(t);
    if ($("ocr-display-expr")) $("ocr-display-expr").textContent = t;
    try {
      var payload = CalcEngine.solve(t);
      if ($("ocr-display-result"))
        $("ocr-display-result").textContent = payload.result;
      applyResult(t, payload);
      justEval = true;
    } catch (e) {
      if ($("ocr-display-result"))
        $("ocr-display-result").textContent = "Error";
    }
  });

  /* Estadística */
  function runStats(kind) {
    var raw = ($("stats-input") && $("stats-input").value) || "";
    try {
      var data = CalcStats.parse(raw);
      var r = CalcStats.analyze(data);
      var box = $("stats-summary");
      var pills = [
        ["n", r.n],
        ["Media", CalcUtils.formatNum(r.mean)],
        ["Mediana", CalcUtils.formatNum(r.median)],
        ["Moda", r.mode],
        ["σ", CalcUtils.formatNum(r.stdev)],
        ["σ²", CalcUtils.formatNum(r.variance)],
        ["Rango", CalcUtils.formatNum(r.range)],
      ];
      if (kind && kind !== "all") {
        var one = {
          mean: ["Media", CalcUtils.formatNum(r.mean)],
          median: ["Mediana", CalcUtils.formatNum(r.median)],
          mode: ["Moda", r.mode],
          stdev: ["Desv. est.", CalcUtils.formatNum(r.stdev)],
          variance: ["Varianza", CalcUtils.formatNum(r.variance)],
          range: ["Rango", CalcUtils.formatNum(r.range)],
        };
        if (one[kind]) pills = [["n", r.n], one[kind]];
      }
      if (box) {
        box.innerHTML = pills
          .map(function (p) {
            return (
              '<div class="stat-pill"><div class="label">' +
              p[0] +
              '</div><div class="value">' +
              p[1] +
              "</div></div>"
            );
          })
          .join("");
      }
      var stepsEl = $("stats-steps");
      if (stepsEl) {
        stepsEl.innerHTML = r.steps
          .map(function (s) {
            return (
              '<li><span class="step-title">' +
              CalcUtils.escapeHtml(s.title) +
              "</span>" +
              (s.detail || "") +
              "</li>"
            );
          })
          .join("");
      }
      CalcHistory.add({
        expr: "Datos n=" + r.n,
        result:
          "x̄=" +
          CalcUtils.formatNum(r.mean) +
          " · σ=" +
          CalcUtils.formatNum(r.stdev),
        meta: "Estadística",
        steps: r.steps,
        t: Date.now(),
      });
      CalcHistory.render(($("hist-search") && $("hist-search").value) || "");
    } catch (e) {
      if ($("stats-summary"))
        $("stats-summary").innerHTML =
          '<p class="muted">' + CalcUtils.escapeHtml(e.message) + "</p>";
    }
  }
  on($("btn-stats-run"), "click", function () {
    runStats("all");
  });
  document.querySelectorAll("#stats-ops .chip").forEach(function (c) {
    c.addEventListener("click", function () {
      runStats(c.getAttribute("data-stat"));
    });
  });

  on($("theme-toggle"), "change", function (e) {
    var dark = e.target.checked;
    document.body.classList.toggle("light", !dark);
    var lab = $("theme-label-text");
    if (lab) lab.textContent = dark ? "MODO OSCURO" : "MODO CLARO";
  });

  setResult("0", "Resultado · Precisión: 64-bit");
  setBasic("0");
  if (basicResEl) basicResEl.textContent = "0";
  showSection("basic");
})();
