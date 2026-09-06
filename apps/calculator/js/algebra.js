/** Ecuaciones lineales y cuadráticas (nerdamer + fallback) */
window.CalcAlgebra = {
  solve: function (raw) {
    var expr = raw
      .replace(/×/g, "*")
      .replace(/÷/g, "/")
      .replace(/−/g, "-")
      .replace(/x²/g, "x^2")
      .replace(/X/g, "x");
    var steps = [
      {
        title: "1. Entrada",
        detail: "<code>" + CalcUtils.escapeHtml(raw) + "</code>",
      },
    ];

    if (typeof nerdamer !== "undefined" && expr.indexOf("=") !== -1) {
      try {
        var parts = expr.split("=");
        var eq = "(" + parts[0] + ")-(" + parts[1] + ")";
        steps.push({
          title: "2. Forma f(x) = 0",
          detail: "<code>" + CalcUtils.escapeHtml(eq) + " = 0</code>",
        });
        steps.push({
          title: "3. Motor",
          detail: "Resolución simbólica con <strong>nerdamer.solve</strong>",
        });
        var sols = nerdamer.solve(eq, "x");
        var text = sols.toString();
        try {
          text = nerdamer(sols).evaluate().text("decimals");
        } catch (e1) {}
        steps.push({
          title: "4. Solución",
          detail: "<code>x = " + CalcUtils.escapeHtml(text) + "</code>",
        });
        return {
          result: "x = " + text,
          meta: "Álgebra · nerdamer",
          steps: steps,
          type: "algebra",
        };
      } catch (e) {
        steps.push({
          title: "Fallback",
          detail: CalcUtils.escapeHtml(e.message),
        });
      }
    }

    // Fallback numérico math.js
    try {
      var val = CalcEngine.eval(expr);
      return {
        result: CalcUtils.formatNum(val),
        meta: "Expresión · math.js",
        steps: steps.concat([
          {
            title: "Evaluación",
            detail: "<code>" + CalcUtils.formatNum(val) + "</code>",
          },
        ]),
        type: "algebra",
      };
    } catch (e2) {
      return {
        result: "Error",
        meta: e2.message,
        steps: [{ title: "Error", detail: CalcUtils.escapeHtml(e2.message) }],
        type: "error",
      };
    }
  },
};
