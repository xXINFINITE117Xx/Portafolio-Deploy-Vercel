/** Generador y render de pasos detallados */
window.CalcSteps = {
  render: function (steps) {
    var card = document.getElementById("steps-card");
    var list = document.getElementById("steps-list");
    if (!card || !list) return;
    if (!steps || !steps.length) {
      card.hidden = true;
      list.innerHTML = "";
      return;
    }
    card.hidden = false;
    list.innerHTML = steps
      .map(function (s) {
        if (typeof s === "string") return "<li>" + s + "</li>";
        return (
          '<li><span class="step-title">' +
          CalcUtils.escapeHtml(s.title) +
          "</span>" +
          (s.detail || "") +
          "</li>"
        );
      })
      .join("");
  },
  clear: function () {
    this.render([]);
  },
  arithmetic: function (raw, result, angleDeg) {
    return [
      {
        title: "1. Expresión",
        detail: "<code>" + CalcUtils.escapeHtml(raw) + "</code>",
      },
      {
        title: "2. Jerarquía",
        detail: "Paréntesis → potencias → ×÷ → +− (izquierda a derecha).",
      },
      {
        title: "3. Modo angular",
        detail: angleDeg ? "Grados (deg)" : "Radianes (rad)",
      },
      {
        title: "4. Resultado",
        detail: "<code>" + CalcUtils.escapeHtml(String(result)) + "</code>",
      },
    ];
  },
};
