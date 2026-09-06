/** Fórmulas de física comunes */
window.CalcPhysics = {
  formulas: {
    f_ma: {
      label: "F = m·a",
      compute: function (m, a) {
        return m * a;
      },
      unit: "N",
      steps: function (m, a, r) {
        return [
          { title: "1. 2ª ley de Newton", detail: "<code>F = m · a</code>" },
          { title: "2. Datos", detail: "m=" + m + " kg, a=" + a + " m/s²" },
          {
            title: "3. Resultado",
            detail: "F = <code>" + CalcUtils.formatNum(r) + "</code> N",
          },
        ];
      },
    },
    ke: {
      label: "Ec = ½mv²",
      compute: function (m, v) {
        return 0.5 * m * v * v;
      },
      unit: "J",
      steps: function (m, v, r) {
        return [
          { title: "1. Energía cinética", detail: "<code>Ec = ½ m v²</code>" },
          {
            title: "2. Resultado",
            detail: "<code>" + CalcUtils.formatNum(r) + "</code> J",
          },
        ];
      },
    },
    pe: {
      label: "Ep = mgh",
      compute: function (m, h, g) {
        return m * (g || 9.81) * h;
      },
      unit: "J",
      steps: function (m, h, r, g) {
        return [
          { title: "1. Ep gravitatoria", detail: "<code>Ep = m g h</code>" },
          { title: "2. g", detail: String(g || 9.81) },
          {
            title: "3. Resultado",
            detail: "<code>" + CalcUtils.formatNum(r) + "</code> J",
          },
        ];
      },
    },
    v_at: {
      label: "v = v₀ + a·t",
      compute: function (v0, a, t) {
        return v0 + a * t;
      },
      unit: "m/s",
      steps: function (v0, a, t, r) {
        return [
          { title: "1. MRUV", detail: "<code>v = v₀ + a·t</code>" },
          {
            title: "2. Resultado",
            detail: "<code>" + CalcUtils.formatNum(r) + "</code> m/s",
          },
        ];
      },
    },
  },
};
