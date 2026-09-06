/** Gráfica 2D y = f(x) */
window.CalcGraph = (function () {
  var canvas,
    ctx,
    zoom = 1,
    fn = "sin(x)";
  var xMin = -Math.PI * 2,
    xMax = Math.PI * 2;

  function init() {
    canvas = document.getElementById("graph-canvas");
    if (!canvas) return;
    ctx = canvas.getContext("2d");
    draw();
    window.addEventListener("resize", draw);
  }

  function setRange(min, max) {
    xMin = Number(min);
    xMax = Number(max);
    if (!(xMax > xMin)) {
      xMin = -6.28;
      xMax = 6.28;
    }
  }

  function setFn(expr) {
    fn = CalcUtils.normalizeExpr(expr) || "sin(x)";
    var el = document.getElementById("graph-eq");
    if (el) el.textContent = "y = " + expr;
    draw();
  }

  function zoomIn() {
    var c = (xMin + xMax) / 2;
    var half = ((xMax - xMin) / 2) * 0.7;
    xMin = c - half;
    xMax = c + half;
    syncInputs();
    draw();
  }
  function zoomOut() {
    var c = (xMin + xMax) / 2;
    var half = ((xMax - xMin) / 2) * 1.4;
    xMin = c - half;
    xMax = c + half;
    syncInputs();
    draw();
  }
  function reset() {
    xMin = -Math.PI * 2;
    xMax = Math.PI * 2;
    syncInputs();
    draw();
  }
  function syncInputs() {
    var a = document.getElementById("x-min");
    var b = document.getElementById("x-max");
    if (a) a.value = String(Math.round(xMin * 100) / 100);
    if (b) b.value = String(Math.round(xMax * 100) / 100);
  }

  function draw() {
    if (!canvas || !ctx) return;
    var dpr = window.devicePixelRatio || 1;
    var w = canvas.clientWidth || 800;
    var h = Math.max(280, Math.min(420, w * 0.5));
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = "rgba(5,10,24,0.95)";
    ctx.fillRect(0, 0, w, h);

    // Sample to find y range
    var ys = [];
    for (var i = 0; i <= 200; i++) {
      var x = xMin + (i / 200) * (xMax - xMin);
      try {
        var y =
          typeof math !== "undefined"
            ? math.evaluate(fn, { x: x })
            : Math.sin(x);
        if (isFinite(y)) ys.push(y);
      } catch (e) {}
    }
    var yMin = -2,
      yMax = 2;
    if (ys.length) {
      yMin = Math.min.apply(null, ys);
      yMax = Math.max.apply(null, ys);
      if (yMin === yMax) {
        yMin -= 1;
        yMax += 1;
      }
      var pad = (yMax - yMin) * 0.1;
      yMin -= pad;
      yMax += pad;
    }

    function toX(x) {
      return ((x - xMin) / (xMax - xMin)) * w;
    }
    function toY(y) {
      return h - ((y - yMin) / (yMax - yMin)) * h;
    }

    // grid
    ctx.strokeStyle = "rgba(0,240,255,0.08)";
    ctx.lineWidth = 1;
    for (var gx = 0; gx < w; gx += 40) {
      ctx.beginPath();
      ctx.moveTo(gx, 0);
      ctx.lineTo(gx, h);
      ctx.stroke();
    }
    for (var gy = 0; gy < h; gy += 40) {
      ctx.beginPath();
      ctx.moveTo(0, gy);
      ctx.lineTo(w, gy);
      ctx.stroke();
    }
    // axes
    ctx.strokeStyle = "rgba(255,45,149,0.4)";
    ctx.lineWidth = 1.5;
    if (yMin < 0 && yMax > 0) {
      ctx.beginPath();
      ctx.moveTo(0, toY(0));
      ctx.lineTo(w, toY(0));
      ctx.stroke();
    }
    if (xMin < 0 && xMax > 0) {
      ctx.beginPath();
      ctx.moveTo(toX(0), 0);
      ctx.lineTo(toX(0), h);
      ctx.stroke();
    }

    ctx.strokeStyle = "#00f0ff";
    ctx.lineWidth = 2.5;
    ctx.shadowColor = "#00f0ff";
    ctx.shadowBlur = 10;
    ctx.beginPath();
    var started = false;
    for (var px = 0; px < w; px++) {
      var xv = xMin + (px / w) * (xMax - xMin);
      try {
        var yv =
          typeof math !== "undefined"
            ? math.evaluate(fn, { x: xv })
            : Math.sin(xv);
        if (!isFinite(yv)) {
          started = false;
          continue;
        }
        var py = toY(yv);
        if (!started) {
          ctx.moveTo(px, py);
          started = true;
        } else ctx.lineTo(px, py);
      } catch (e) {
        started = false;
      }
    }
    ctx.stroke();
    ctx.shadowBlur = 0;
  }

  return {
    init: init,
    setFn: setFn,
    setRange: setRange,
    zoomIn: zoomIn,
    zoomOut: zoomOut,
    reset: reset,
    draw: draw,
  };
})();
