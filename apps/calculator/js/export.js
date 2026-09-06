/** Export historial con estética cyberpunk legible (alto contraste) */
window.CalcExport = {
  buildHistorySheet: function () {
    var data = CalcHistory.get();
    var wrap = document.createElement("div");
    wrap.setAttribute("id", "export-sheet");
    wrap.style.cssText = [
      "position:fixed",
      "left:-9999px",
      "top:0",
      "width:740px",
      "padding:0",
      "font-family:Inter,Segoe UI,system-ui,sans-serif",
      "background:#070b16",
      "color:#e8f4ff",
      "border-radius:16px",
      "overflow:hidden",
      "border:1px solid rgba(0,240,255,0.35)",
    ].join(";");

    var header = document.createElement("div");
    header.style.cssText =
      "padding:22px 28px;background:linear-gradient(135deg,#0a1528,#12102a);" +
      "border-bottom:1px solid rgba(0,240,255,0.25);";
    header.innerHTML =
      '<div style="display:flex;align-items:center;gap:12px;margin-bottom:8px">' +
      '<div style="width:36px;height:36px;border-radius:10px;background:rgba(0,240,255,0.12);' +
      "border:1px solid rgba(0,240,255,0.4);display:flex;align-items:center;justify-content:center;" +
      'color:#00f0ff;font-size:16px;font-weight:700">∑</div>' +
      '<div><div style="font-family:Orbitron,sans-serif;font-size:15px;letter-spacing:2px;' +
      "background:linear-gradient(90deg,#00f0ff,#ff2d95);-webkit-background-clip:text;" +
      '-webkit-text-fill-color:transparent;background-clip:text;font-weight:700">' +
      "CALCULADORA CIENTÍFICA</div>" +
      '<div style="font-size:11px;color:#7a8ba8;margin-top:2px">Historial de cálculos · Export</div></div></div>' +
      '<div style="font-size:12px;color:#00f0ff">' +
      new Date().toLocaleString("es-ES") +
      " · " +
      data.length +
      " registro(s)</div>";
    wrap.appendChild(header);

    var body = document.createElement("div");
    body.style.cssText = "padding:18px 22px 24px;background:#070b16";

    if (!data.length) {
      var empty = document.createElement("p");
      empty.textContent = "Sin cálculos en el historial.";
      empty.style.cssText = "color:#7a8ba8;text-align:center;padding:24px";
      body.appendChild(empty);
    } else {
      data.forEach(function (h, i) {
        var row = document.createElement("div");
        row.style.cssText =
          "padding:14px 16px;margin-bottom:10px;border-radius:12px;" +
          "background:linear-gradient(145deg,rgba(12,22,42,0.98),rgba(18,12,32,0.98));" +
          "border:1px solid rgba(0,240,255,0.22);" +
          "box-shadow:0 0 20px rgba(0,240,255,0.06)";
        var expr = String(h.expr)
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;");
        var res = String(h.result)
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;");
        var meta = h.meta
          ? String(h.meta).replace(/&/g, "&amp;").replace(/</g, "&lt;")
          : "";
        row.innerHTML =
          '<div style="display:flex;justify-content:space-between;gap:8px;margin-bottom:6px">' +
          '<span style="font-family:Orbitron,sans-serif;font-size:10px;letter-spacing:1px;color:#ff2d95">#' +
          (i + 1) +
          (meta ? " · " + meta : "") +
          "</span>" +
          '<span style="font-size:10px;color:#7a8ba8">' +
          new Date(h.t).toLocaleString("es-ES") +
          "</span></div>" +
          '<div style="font-family:JetBrains Mono,Consolas,monospace;font-size:13px;color:#00f0ff;' +
          'word-break:break-word;text-shadow:0 0 8px rgba(0,240,255,0.25)">' +
          expr +
          "</div>" +
          '<div style="margin-top:6px;font-family:Orbitron,sans-serif;font-size:18px;font-weight:700;' +
          "background:linear-gradient(90deg,#00f0ff,#ffffff,#ff2d95);-webkit-background-clip:text;" +
          '-webkit-text-fill-color:transparent;background-clip:text">= ' +
          res +
          "</div>";
        body.appendChild(row);
      });
    }
    wrap.appendChild(body);

    var foot = document.createElement("div");
    foot.style.cssText =
      "padding:12px 22px;border-top:1px solid rgba(255,45,149,0.25);" +
      "font-size:10px;color:#7a8ba8;text-align:center;letter-spacing:1px;" +
      "font-family:Orbitron,sans-serif";
    foot.textContent = "PORTAFOLIO GAMER · CALC PRO · CYBERPUNK";
    wrap.appendChild(foot);

    document.body.appendChild(wrap);
    return wrap;
  },

  captureHistory: async function () {
    var wrap = this.buildHistorySheet();
    try {
      // Esperar un frame para fuentes/layout
      await new Promise(function (r) {
        requestAnimationFrame(function () {
          requestAnimationFrame(r);
        });
      });
      return await html2canvas(wrap, {
        backgroundColor: "#070b16",
        scale: 2,
        useCORS: true,
        logging: false,
      });
    } finally {
      if (wrap.parentNode) document.body.removeChild(wrap);
    }
  },

  historyPng: async function () {
    var c = await this.captureHistory();
    var a = document.createElement("a");
    a.download = "historial-calc-pro.png";
    a.href = c.toDataURL("image/png");
    a.click();
  },

  historyPdf: async function () {
    var c = await this.captureHistory();
    var pdf = new window.jspdf.jsPDF({ unit: "pt", format: "a4" });
    var pw = pdf.internal.pageSize.getWidth();
    var ph = pdf.internal.pageSize.getHeight();
    var m = 28;
    var w = pw - m * 2;
    var ratio = w / c.width;
    var fullH = c.height * ratio;
    var pageH = ph - m * 2;

    if (fullH <= pageH) {
      pdf.setFillColor(7, 11, 22);
      pdf.rect(0, 0, pw, ph, "F");
      pdf.addImage(c.toDataURL("image/png"), "PNG", m, m, w, fullH);
    } else {
      var slicePx = pageH / ratio;
      var pageCanvas = document.createElement("canvas");
      var pageCtx = pageCanvas.getContext("2d");
      pageCanvas.width = c.width;
      var offset = 0;
      var first = true;
      while (offset < c.height - 1) {
        if (!first) pdf.addPage();
        first = false;
        pdf.setFillColor(7, 11, 22);
        pdf.rect(0, 0, pw, ph, "F");
        var sh = Math.min(slicePx, c.height - offset);
        pageCanvas.height = Math.ceil(sh);
        pageCtx.fillStyle = "#070b16";
        pageCtx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
        pageCtx.drawImage(c, 0, offset, c.width, sh, 0, 0, c.width, sh);
        pdf.addImage(
          pageCanvas.toDataURL("image/png"),
          "PNG",
          m,
          m,
          w,
          sh * ratio,
        );
        offset += sh;
      }
    }
    pdf.save("historial-calc-pro.pdf");
  },

  png: async function () {
    return this.historyPng();
  },
  pdf: async function () {
    return this.historyPdf();
  },
};
