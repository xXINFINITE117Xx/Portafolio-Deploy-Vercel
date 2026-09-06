/** Media, mediana, moda, desviación, varianza */
window.CalcStats = {
  parse: function (str) {
    return String(str)
      .split(/[\s,;]+/)
      .map(function (x) {
        return parseFloat(String(x).replace(",", "."));
      })
      .filter(function (n) {
        return isFinite(n);
      });
  },
  analyze: function (data) {
    if (!data.length) throw new Error("Sin datos");
    var sorted = data.slice().sort(function (a, b) {
      return a - b;
    });
    var n = data.length;
    var sum = data.reduce(function (a, b) {
      return a + b;
    }, 0);
    var mean = sum / n;
    var median =
      n % 2 === 1
        ? sorted[(n - 1) / 2]
        : (sorted[n / 2 - 1] + sorted[n / 2]) / 2;
    var freq = {};
    data.forEach(function (x) {
      freq[x] = (freq[x] || 0) + 1;
    });
    var maxF = 0;
    var modes = [];
    Object.keys(freq).forEach(function (k) {
      if (freq[k] > maxF) {
        maxF = freq[k];
        modes = [k];
      } else if (freq[k] === maxF) modes.push(k);
    });
    var modeStr = maxF <= 1 ? "Amodal" : modes.join(", ");
    var variance =
      data.reduce(function (a, x) {
        return a + Math.pow(x - mean, 2);
      }, 0) / n;
    var stdev = Math.sqrt(variance);
    var range = sorted[n - 1] - sorted[0];
    var steps = [
      {
        title: "1. Muestra",
        detail:
          "<code>n=" +
          n +
          "</code> · <code>[" +
          sorted.map(CalcUtils.formatNum).join(", ") +
          "]</code>",
      },
      {
        title: "2. Media",
        detail: "x̄ = <code>" + CalcUtils.formatNum(mean) + "</code>",
      },
      {
        title: "3. Mediana",
        detail: "<code>" + CalcUtils.formatNum(median) + "</code>",
      },
      {
        title: "4. Moda",
        detail: "<code>" + CalcUtils.escapeHtml(modeStr) + "</code>",
      },
      {
        title: "5. Varianza",
        detail: "σ² = <code>" + CalcUtils.formatNum(variance) + "</code>",
      },
      {
        title: "6. Desv. estándar",
        detail: "σ = <code>" + CalcUtils.formatNum(stdev) + "</code>",
      },
      {
        title: "7. Rango",
        detail: "<code>" + CalcUtils.formatNum(range) + "</code>",
      },
    ];
    return {
      mean: mean,
      median: median,
      mode: modeStr,
      variance: variance,
      stdev: stdev,
      range: range,
      n: n,
      steps: steps,
    };
  },
};
