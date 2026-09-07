(function () {
  "use strict";
  // 10x10 grid — programming theme
  // Words: HTML(0,0 H), CSS(0,5 H), JS(2,0 H), API(4,0 H), DOM(6,0 H),
  // CODE(0,0 V), NODE(0,3 V), GIT(2,2 V), SQL(4,2 V), BUG(6,3 V)
  var ROWS = 9,
    COLS = 9;
  var words = [
    {
      ans: "CODE",
      row: 0,
      col: 0,
      dir: "across",
      clue: "Código fuente de un programa",
    },
    {
      ans: "CSS",
      row: 0,
      col: 0,
      dir: "down",
      clue: "Hojas de estilo en cascada",
    },
    {
      ans: "HTML",
      row: 0,
      col: 5,
      dir: "across",
      clue: "Lenguaje de marcado de páginas web",
    },
    {
      ans: "HTTP",
      row: 0,
      col: 5,
      dir: "down",
      clue: "Protocolo de transferencia web",
    },
    {
      ans: "GIT",
      row: 2,
      col: 2,
      dir: "across",
      clue: "Control de versiones distribuido",
    },
    {
      ans: "API",
      row: 4,
      col: 0,
      dir: "across",
      clue: "Interfaz de programación de aplicaciones",
    },
    {
      ans: "JS",
      row: 4,
      col: 4,
      dir: "across",
      clue: "Lenguaje del navegador (abrev.)",
    },
    {
      ans: "JSON",
      row: 4,
      col: 4,
      dir: "down",
      clue: "Formato de datos ligero",
    },
    {
      ans: "DOM",
      row: 6,
      col: 0,
      dir: "across",
      clue: "Modelo de objetos del documento",
    },
    {
      ans: "SQL",
      row: 6,
      col: 6,
      dir: "across",
      clue: "Lenguaje de consultas a bases de datos",
    },
    { ans: "BUG", row: 8, col: 0, dir: "across", clue: "Error en el código" },
    {
      ans: "NODE",
      row: 5,
      col: 0,
      dir: "across",
      clue: "Runtime de JavaScript en servidor",
    },
  ];

  var grid = [];
  var cells = {};
  var active = null;
  var hints = 3;
  var paused = false;
  var started = 0;
  var elapsed = 0;
  var tick = null;

  function buildGrid() {
    grid = Array.from({ length: ROWS }, function () {
      return Array.from({ length: COLS }, function () {
        return { ch: null, block: true, num: 0 };
      });
    });
    words.forEach(function (w, wi) {
      for (var i = 0; i < w.ans.length; i++) {
        var r = w.dir === "across" ? w.row : w.row + i;
        var c = w.dir === "across" ? w.col + i : w.col;
        grid[r][c].block = false;
        grid[r][c].ch = w.ans[i];
        if (i === 0) grid[r][c].num = wi + 1;
      }
      w.num = grid[w.row][w.col].num || wi + 1;
    });
  }

  function renderBoard() {
    var board = document.getElementById("board");
    board.style.gridTemplateColumns =
      "repeat(" + COLS + ", clamp(28px, 6vw, 36px))";
    board.innerHTML = "";
    cells = {};
    for (var r = 0; r < ROWS; r++) {
      for (var c = 0; c < COLS; c++) {
        var g = grid[r][c];
        var div = document.createElement("div");
        div.className = "cell" + (g.block ? " block" : "");
        div.dataset.r = r;
        div.dataset.c = c;
        if (!g.block) {
          if (g.num) {
            var n = document.createElement("span");
            n.className = "num";
            n.textContent = g.num;
            div.appendChild(n);
          }
          var inp = document.createElement("input");
          inp.maxLength = 1;
          inp.autocomplete = "off";
          inp.inputMode = "text";
          inp.setAttribute("aria-label", "Celda " + r + "," + c);
          (function (rr, cc, input) {
            input.addEventListener("focus", function () {
              setActive(rr, cc);
            });
            input.addEventListener("input", function () {
              input.value = input.value.replace(/[^a-zA-Z]/g, "").toUpperCase();
              if (input.value) moveNext(rr, cc);
              updateSolved();
            });
            input.addEventListener("keydown", function (e) {
              if (e.key === "Backspace" && !input.value) movePrev(rr, cc);
              if (e.key === "ArrowRight") {
                e.preventDefault();
                focusCell(rr, cc + 1);
              }
              if (e.key === "ArrowLeft") {
                e.preventDefault();
                focusCell(rr, cc - 1);
              }
              if (e.key === "ArrowDown") {
                e.preventDefault();
                focusCell(rr + 1, cc);
              }
              if (e.key === "ArrowUp") {
                e.preventDefault();
                focusCell(rr - 1, cc);
              }
            });
          })(r, c, inp);
          div.appendChild(inp);
          cells[r + "," + c] = { div: div, input: inp, ans: g.ch };
        }
        board.appendChild(div);
      }
    }
    document.getElementById("total").textContent = String(words.length);
  }

  function renderClues() {
    var a = document.getElementById("across");
    var d = document.getElementById("down");
    a.innerHTML = "";
    d.innerHTML = "";
    words.forEach(function (w) {
      var li = document.createElement("li");
      li.innerHTML = "<span>" + w.num + ".</span>" + w.clue;
      li.addEventListener("click", function () {
        document.querySelectorAll(".clues li").forEach(function (x) {
          x.classList.remove("sel");
        });
        li.classList.add("sel");
        focusCell(w.row, w.col);
      });
      (w.dir === "across" ? a : d).appendChild(li);
    });
  }

  function setActive(r, c) {
    if (active && cells[active]) cells[active].div.classList.remove("active");
    active = r + "," + c;
    if (cells[active]) cells[active].div.classList.add("active");
  }
  function focusCell(r, c) {
    if (r < 0 || c < 0 || r >= ROWS || c >= COLS) return;
    var k = r + "," + c;
    if (cells[k]) cells[k].input.focus();
  }
  function moveNext(r, c) {
    for (var i = c + 1; i < COLS; i++)
      if (cells[r + "," + i]) {
        focusCell(r, i);
        return;
      }
    for (var rr = r + 1; rr < ROWS; rr++)
      for (var cc = 0; cc < COLS; cc++)
        if (cells[rr + "," + cc]) {
          focusCell(rr, cc);
          return;
        }
  }
  function movePrev(r, c) {
    for (var i = c - 1; i >= 0; i--)
      if (cells[r + "," + i]) {
        focusCell(r, i);
        return;
      }
    for (var rr = r - 1; rr >= 0; rr--)
      for (var cc = COLS - 1; cc >= 0; cc--)
        if (cells[rr + "," + cc]) {
          focusCell(rr, cc);
          return;
        }
  }

  function wordComplete(w) {
    for (var i = 0; i < w.ans.length; i++) {
      var r = w.dir === "across" ? w.row : w.row + i;
      var c = w.dir === "across" ? w.col + i : w.col;
      var cell = cells[r + "," + c];
      if (!cell || cell.input.value !== w.ans[i]) return false;
    }
    return true;
  }
  function updateSolved() {
    var n = words.filter(wordComplete).length;
    document.getElementById("solved").textContent = String(n);
    if (n === words.length) win();
  }
  function checkAll() {
    Object.keys(cells).forEach(function (k) {
      var cell = cells[k];
      cell.div.classList.remove("ok", "bad");
      if (!cell.input.value) return;
      cell.div.classList.add(cell.input.value === cell.ans ? "ok" : "bad");
    });
    updateSolved();
  }
  function useHint() {
    if (hints <= 0 || paused) return;
    var empty = Object.keys(cells).filter(function (k) {
      return !cells[k].input.value;
    });
    if (!empty.length) return;
    var k = empty[Math.floor(Math.random() * empty.length)];
    cells[k].input.value = cells[k].ans;
    cells[k].div.classList.add("ok");
    hints--;
    document.getElementById("hints-left").textContent = String(hints);
    updateSolved();
  }

  function fmt(ms) {
    var s = Math.floor(ms / 1000);
    var m = Math.floor(s / 60);
    s = s % 60;
    return (m < 10 ? "0" : "") + m + ":" + (s < 10 ? "0" : "") + s;
  }
  function startTimer() {
    if (tick) return;
    started = Date.now() - elapsed;
    tick = setInterval(function () {
      if (paused) return;
      elapsed = Date.now() - started;
      document.getElementById("timer").textContent = fmt(elapsed);
    }, 250);
  }
  var introDone = false;
  function showOverlay(title, msg, btnLabel) {
    document.getElementById("overlay").classList.remove("hidden");
    document.getElementById("overlay-title").textContent = title;
    document.getElementById("overlay-msg").textContent = msg;
    document.getElementById("btn-resume").textContent = btnLabel || "CONTINUAR";
  }
  function togglePause(force) {
    if (!introDone && force !== false) return;
    if (force === false) paused = false;
    else if (force === true) paused = true;
    else paused = !paused;
    if (paused) {
      showOverlay("PAUSA", "El juego está en pausa", "CONTINUAR");
    } else {
      document.getElementById("overlay").classList.add("hidden");
      startTimer();
    }
  }
  function win() {
    paused = true;
    if (tick) clearInterval(tick);
    tick = null;
    document.getElementById("overlay").classList.remove("hidden");
    document.getElementById("overlay-title").textContent = "¡COMPLETADO!";
    document.getElementById("overlay-msg").textContent =
      "Tiempo: " + fmt(elapsed);
  }
  function reset() {
    hints = 3;
    elapsed = 0;
    paused = false;
    document.getElementById("hints-left").textContent = "3";
    document.getElementById("timer").textContent = "00:00";
    document.getElementById("overlay").classList.add("hidden");
    Object.keys(cells).forEach(function (k) {
      cells[k].input.value = "";
      cells[k].div.classList.remove("ok", "bad");
    });
    updateSolved();
    startTimer();
  }

  // particles
  (function bg() {
    var c = document.getElementById("bg");
    var ctx = c.getContext("2d");
    var pts = [];
    function resize() {
      c.width = innerWidth;
      c.height = innerHeight;
    }
    function init() {
      pts = [];
      for (var i = 0; i < 40; i++)
        pts.push({
          x: Math.random() * c.width,
          y: Math.random() * c.height,
          v: 0.2 + Math.random() * 0.5,
        });
    }
    function draw() {
      ctx.clearRect(0, 0, c.width, c.height);
      ctx.fillStyle = "rgba(0,255,209,0.35)";
      pts.forEach(function (p) {
        p.y += p.v;
        if (p.y > c.height) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 1.2, 0, Math.PI * 2);
        ctx.fill();
      });
      requestAnimationFrame(draw);
    }
    resize();
    init();
    draw();
    addEventListener("resize", function () {
      resize();
      init();
    });
  })();

  buildGrid();
  renderBoard();
  renderClues();
  paused = true;
  document.getElementById("btn-hint").onclick = useHint;
  document.getElementById("btn-check").onclick = checkAll;
  document.getElementById("btn-pause").onclick = function () {
    togglePause();
  };
  document.getElementById("btn-resume").onclick = function () {
    if (!introDone) {
      introDone = true;
      paused = false;
      document.getElementById("overlay").classList.add("hidden");
      startTimer();
      return;
    }
    togglePause(false);
  };
  document.getElementById("btn-reset").onclick = reset;
  document.addEventListener("keydown", function (e) {
    if (e.key === "p" || e.key === "P" || e.key === "Escape") togglePause();
  });
})();
