/** Motor math.js + detección de tipo de expresión */
window.CalcEngine = {
  ans: 0,
  angleDeg: true,

  detectType: function (raw) {
    var s = String(raw).replace(/\s/g, "");
    if (/=/.test(s) && /x/i.test(s)) {
      if (/x\^2|x²|x2/i.test(s)) return "quadratic";
      return "linear";
    }
    if (/mean|median|stdev|var/i.test(s)) return "stats";
    if (/F\s*=|E\s*=|v\s*=|x\s*=.*t/.test(s)) return "physics";
    return "arithmetic";
  },

  eval: function (raw) {
    if (typeof math === "undefined") throw new Error("math.js no cargó");
    var s = CalcUtils.normalizeExpr(raw);
    if (this.angleDeg) {
      s = s
        .replace(/\bsin\(([^)]+)\)/g, "sin(($1)*pi/180)")
        .replace(/\bcos\(([^)]+)\)/g, "cos(($1)*pi/180)")
        .replace(/\btan\(([^)]+)\)/g, "tan(($1)*pi/180)");
    }
    return math.evaluate(s, { ans: this.ans });
  },

  solve: function (raw) {
    var type = this.detectType(raw);
    if (type === "linear" || type === "quadratic") {
      return CalcAlgebra.solve(raw);
    }
    var val = this.eval(raw);
    var out = CalcUtils.formatNum(val);
    this.ans = Number(out) || this.ans;
    return {
      result: out,
      meta: "Resultado ≈ " + out + " · Precisión: 64-bit",
      steps: CalcSteps.arithmetic(raw, out, this.angleDeg),
      type: type,
    };
  },
};
