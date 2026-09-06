/** Gráfica 3D z = f(x,y) — proyección perspectiva + rotación */
window.CalcGraph3D = (function () {
  var canvas, ctx;
  var fn = "sin(sqrt(x^2+y^2))";
  var range = 3;
  var res = 28;
  var rotX = 0.7;
  var rotZ = 0.5;
  var scale = 1;
  var dragging = false;
  var lastX = 0,
    lastY = 0;

  function init() {
    canvas = document.getElementById("graph3d-canvas");
    if (!canvas) return;
    ctx = canvas.getContext("2d");
    canvas.addEventListener("mousedown", function (e) {
      dragging = true;
      lastX = e.clientX;
      lastY = e.clientY;
    });
    window.addEventListener("mouseup", function () {
      dragging = false;
    });
    window.addEventListener("mousemove", function (e) {
      if (!dragging) return;
      rotZ += (e.clientX - lastX) * 0.01;
      rotX += (e.clientY - lastY) * 0.01;
      rotX = Math.max(0.15, Math.min(1.4, rotX));
      lastX = e.clientX;
      lastY = e.clientY;
      draw();
    });
    canvas.addEventListener(
      "wheel",
      function (e) {
        e.preventDefault();
        scale *= e.deltaY > 0 ? 0.9 : 1.1;
        scale = Math.max(0.4, Math.min(3, scale));
        draw();
      },
      { passive: false },
    );
    // touch
    canvas.addEventListener(
      "touchstart",
      function (e) {
        if (e.touches.length === 1) {
          dragging = true;
          lastX = e.touches[0].clientX;
          lastY = e.touches[0].clientY;
        }
      },
      { passive: true },
    );
    canvas.addEventListener(
      "touchmove",
      function (e) {
        if (!dragging || e.touches.length !== 1) return;
        rotZ += (e.touches[0].clientX - lastX) * 0.01;
        rotX += (e.touches[0].clientY - lastY) * 0.01;
        lastX = e.touches[0].clientX;
        lastY = e.touches[0].clientY;
        draw();
      },
      { passive: true },
    );
    canvas.addEventListener("touchend", function () {
      dragging = false;
    });
    window.addEventListener("resize", draw);
    draw();
  }

  function setFn(expr, r, resolution) {
    fn = CalcUtils.normalizeExpr(expr) || "sin(sqrt(x^2+y^2))";
    if (r) range = Number(r) || 3;
    if (resolution) res = Math.max(12, Math.min(50, Number(resolution) || 28));
    var el = document.getElementById("graph3d-eq");
    if (el) el.textContent = "z = " + expr;
    draw();
  }

  function project(x, y, z, w, h) {
    // rotate around X then Z
    var cosX = Math.cos(rotX),
      sinX = Math.sin(rotX);
    var cosZ = Math.cos(rotZ),
      sinZ = Math.sin(rotZ);
    var y1 = y * cosX - z * sinX;
    var z1 = y * sinX + z * cosX;
    var x2 = x * cosZ - y1 * sinZ;
    var y2 = x * sinZ + y1 * cosZ;
    var sc = (Math.min(w, h) * 0.22 * scale) / range;
    return {
      x: w / 2 + x2 * sc,
      y: h / 2 - y2 * sc - z1 * sc * 0.35,
    };
  }

  function evalZ(x, y) {
    try {
      if (typeof math === "undefined")
        return Math.sin(Math.sqrt(x * x + y * y));
      return math.evaluate(fn, { x: x, y: y });
    } catch (e) {
      return NaN;
    }
  }

  function draw() {
    if (!canvas || !ctx) return;
    var dpr = window.devicePixelRatio || 1;
    var w = canvas.clientWidth || 800;
    var h = Math.max(280, Math.min(420, w * 0.5));
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = "rgba(5,10,24,0.95)";
    ctx.fillRect(0, 0, w, h);

    var grid = [];
    var n = res;
    for (var i = 0; i <= n; i++) {
      grid[i] = [];
      for (var j = 0; j <= n; j++) {
        var x = -range + (2 * range * i) / n;
        var y = -range + (2 * range * j) / n;
        var z = evalZ(x, y);
        if (!isFinite(z)) z = 0;
        grid[i][j] = { x: x, y: y, z: z };
      }
    }

    // Normalize z a bit for display
    var zMin = Infinity,
      zMax = -Infinity;
    for (i = 0; i <= n; i++) {
      for (j = 0; j <= n; j++) {
        zMin = Math.min(zMin, grid[i][j].z);
        zMax = Math.max(zMax, grid[i][j].z);
      }
    }
    var zSpan = zMax - zMin || 1;

    ctx.lineWidth = 1;
    for (i = 0; i <= n; i++) {
      for (j = 0; j < n; j++) {
        var a = grid[i][j];
        var b = grid[i][j + 1];
        var pa = project(a.x, a.y, a.z, w, h);
        var pb = project(b.x, b.y, b.z, w, h);
        var t = (a.z - zMin) / zSpan;
        ctx.strokeStyle =
          "rgba(" +
          Math.round(0 + t * 255) +
          "," +
          Math.round(240 - t * 100) +
          "," +
          Math.round(255 - t * 100) +
          ",0.75)";
        ctx.beginPath();
        ctx.moveTo(pa.x, pa.y);
        ctx.lineTo(pb.x, pb.y);
        ctx.stroke();
      }
    }
    for (j = 0; j <= n; j++) {
      for (i = 0; i < n; i++) {
        a = grid[i][j];
        b = grid[i + 1][j];
        pa = project(a.x, a.y, a.z, w, h);
        pb = project(b.x, b.y, b.z, w, h);
        t = (a.z - zMin) / zSpan;
        ctx.strokeStyle =
          "rgba(" +
          Math.round(255 - t * 50) +
          "," +
          Math.round(45 + t * 100) +
          "," +
          Math.round(149 + t * 50) +
          ",0.55)";
        ctx.beginPath();
        ctx.moveTo(pa.x, pa.y);
        ctx.lineTo(pb.x, pb.y);
        ctx.stroke();
      }
    }
  }

  return { init: init, setFn: setFn, draw: draw };
})();
