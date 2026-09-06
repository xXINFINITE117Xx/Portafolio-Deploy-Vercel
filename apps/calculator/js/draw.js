/** Canvas manuscrita */
window.CalcDraw = (function () {
  var canvas,
    ctx,
    drawing = false,
    hasInk = false;

  function setup() {
    canvas = document.getElementById("draw-canvas");
    if (!canvas) return;
    ctx = canvas.getContext("2d");
    resize();
    canvas.addEventListener("mousedown", start);
    canvas.addEventListener("mousemove", move);
    window.addEventListener("mouseup", end);
    canvas.addEventListener("touchstart", start, { passive: false });
    canvas.addEventListener("touchmove", move, { passive: false });
    canvas.addEventListener("touchend", end);
  }

  function resize() {
    if (!canvas) return;
    var wrap = canvas.parentElement;
    var w = Math.max(280, wrap ? wrap.clientWidth : 320);
    var h = 160;
    var ratio = window.devicePixelRatio || 1;
    canvas.width = w * ratio;
    canvas.height = h * ratio;
    canvas.style.width = w + "px";
    canvas.style.height = h + "px";
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = "#111111";
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    hasInk = false;
  }

  function pos(e) {
    var rect = canvas.getBoundingClientRect();
    var pt = e.touches ? e.touches[0] : e;
    return { x: pt.clientX - rect.left, y: pt.clientY - rect.top };
  }
  function start(e) {
    e.preventDefault();
    drawing = true;
    hasInk = true;
    var p = pos(e);
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
    if (navigator.vibrate) navigator.vibrate(8);
  }
  function move(e) {
    if (!drawing) return;
    e.preventDefault();
    var p = pos(e);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
  }
  function end() {
    drawing = false;
  }

  return {
    init: setup,
    clear: resize,
    hasInk: function () {
      return hasInk;
    },
    getCanvas: function () {
      return canvas;
    },
    resize: resize,
  };
})();
