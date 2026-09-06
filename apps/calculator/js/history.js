/** Historial con LocalStorage */
window.CalcHistory = (function () {
  var KEY = "calcSciHistory_v3";
  var data = [];

  function load() {
    try {
      data = JSON.parse(localStorage.getItem(KEY) || "[]");
    } catch (e) {
      data = [];
    }
    return data;
  }
  function save() {
    localStorage.setItem(KEY, JSON.stringify(data.slice(0, 50)));
  }

  return {
    load: load,
    get: function () {
      return data;
    },
    add: function (entry) {
      data.unshift(entry);
      data = data.slice(0, 50);
      save();
    },
    clear: function () {
      data = [];
      save();
    },
    render: function (filter) {
      var list = document.getElementById("history-list");
      if (!list) return;
      var q = (filter || "").toLowerCase();
      var items = data.filter(function (h) {
        if (!q) return true;
        return (
          String(h.expr).toLowerCase().indexOf(q) !== -1 ||
          String(h.result).toLowerCase().indexOf(q) !== -1
        );
      });
      if (!items.length) {
        list.innerHTML =
          '<li style="color:var(--muted);font-size:0.85rem">Sin resultados</li>';
        return;
      }
      list.innerHTML = items
        .map(function (h) {
          var idx = data.indexOf(h);
          return (
            '<li data-i="' +
            idx +
            '"><div><div class="h-expr">' +
            CalcUtils.escapeHtml(h.expr) +
            '</div><div class="h-res">= ' +
            CalcUtils.escapeHtml(h.result) +
            '</div></div><span class="h-time">' +
            CalcUtils.formatTime(h.t) +
            "</span></li>"
          );
        })
        .join("");
    },
    exportCSV: function () {
      var csv =
        "expr,result,time\n" +
        data
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
    },
  };
})();
