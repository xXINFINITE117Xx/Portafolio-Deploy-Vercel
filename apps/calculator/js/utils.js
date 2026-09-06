/** Helpers y limpieza de texto */
window.CalcUtils = {
  escapeHtml: function (s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  },
  formatNum: function (v) {
    if (v == null) return "—";
    if (typeof v === "object" && v.toString) {
      try {
        return String(v);
      } catch (e) {}
    }
    var n = Number(v);
    if (!isFinite(n)) return String(v);
    return String(Math.round(n * 1e12) / 1e12);
  },
  normalizeExpr: function (s) {
    return String(s)
      .replace(/×/g, "*")
      .replace(/÷/g, "/")
      .replace(/−/g, "-")
      .replace(/–/g, "-")
      .replace(/π/g, "pi")
      .replace(/√\s*/g, "sqrt")
      .replace(/(\d)\(/g, "$1*(")
      .replace(/\)(\d)/g, ")*$1")
      .replace(/(\d)(pi|e|sin|cos|tan|log|ln|sqrt)/gi, "$1*$2")
      .replace(/(pi|e)(\d)/gi, "$1*$2")
      .replace(/\s+/g, "");
  },
  cleanOCR: function (text) {
    return String(text || "")
      .replace(/\n+/g, "")
      .replace(/O/g, "0")
      .replace(/×/g, "*")
      .replace(/÷/g, "/")
      .replace(/−/g, "-")
      .replace(/[^0-9a-zA-Z+\-*/^=().xX\s]/g, "")
      .replace(/X/g, "x")
      .replace(/\s+/g, "")
      .trim();
  },
  formatTime: function (ts) {
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
  },
};
