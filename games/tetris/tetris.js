(function () {
  "use strict";
  var COLS = 10,
    ROWS = 20,
    SIZE = 30;
  var canvas = document.getElementById("game");
  var ctx = canvas.getContext("2d");
  var nextC = document.getElementById("next");
  var nctx = nextC.getContext("2d");

  var COLORS = {
    I: "#00ffd1",
    O: "#ffd100",
    T: "#ff007a",
    S: "#00ff9d",
    Z: "#ff4d6d",
    J: "#4d9fff",
    L: "#ff9f1c",
  };
  var SHAPES = {
    I: [[1, 1, 1, 1]],
    O: [
      [1, 1],
      [1, 1],
    ],
    T: [
      [0, 1, 0],
      [1, 1, 1],
    ],
    S: [
      [0, 1, 1],
      [1, 1, 0],
    ],
    Z: [
      [1, 1, 0],
      [0, 1, 1],
    ],
    J: [
      [1, 0, 0],
      [1, 1, 1],
    ],
    L: [
      [0, 0, 1],
      [1, 1, 1],
    ],
  };
  var NAMES = Object.keys(SHAPES);

  var board,
    piece,
    nextPiece,
    score,
    lines,
    level,
    running,
    paused,
    dropMs,
    acc,
    last;

  function emptyBoard() {
    return Array.from({ length: ROWS }, function () {
      return Array(COLS).fill(null);
    });
  }
  function rndPiece() {
    var t = NAMES[(Math.random() * NAMES.length) | 0];
    return {
      type: t,
      m: SHAPES[t].map(function (r) {
        return r.slice();
      }),
      x: 3,
      y: 0,
    };
  }
  function collide(p, ox, oy, mat) {
    mat = mat || p.m;
    for (var r = 0; r < mat.length; r++) {
      for (var c = 0; c < mat[r].length; c++) {
        if (!mat[r][c]) continue;
        var x = p.x + c + (ox || 0);
        var y = p.y + r + (oy || 0);
        if (x < 0 || x >= COLS || y >= ROWS) return true;
        if (y >= 0 && board[y][x]) return true;
      }
    }
    return false;
  }
  function merge() {
    for (var r = 0; r < piece.m.length; r++) {
      for (var c = 0; c < piece.m[r].length; c++) {
        if (!piece.m[r][c]) continue;
        var y = piece.y + r,
          x = piece.x + c;
        if (y >= 0) board[y][x] = piece.type;
      }
    }
  }
  function clearLines() {
    var cleared = 0;
    for (var r = ROWS - 1; r >= 0; r--) {
      if (
        board[r].every(function (c) {
          return c;
        })
      ) {
        board.splice(r, 1);
        board.unshift(Array(COLS).fill(null));
        cleared++;
        r++;
      }
    }
    if (cleared) {
      lines += cleared;
      score += [0, 100, 300, 500, 800][cleared] * level;
      level = 1 + Math.floor(lines / 10);
      dropMs = Math.max(80, 800 - (level - 1) * 70);
      updateHud();
    }
  }
  function rotate(mat) {
    var N = mat.length,
      M = mat[0].length;
    var out = Array.from({ length: M }, function () {
      return Array(N).fill(0);
    });
    for (var r = 0; r < N; r++)
      for (var c = 0; c < M; c++) out[c][N - 1 - r] = mat[r][c];
    return out;
  }
  function tryRotate() {
    var nm = rotate(piece.m);
    if (!collide(piece, 0, 0, nm)) piece.m = nm;
    else if (!collide(piece, -1, 0, nm)) {
      piece.x--;
      piece.m = nm;
    } else if (!collide(piece, 1, 0, nm)) {
      piece.x++;
      piece.m = nm;
    }
  }
  function spawn() {
    piece = nextPiece || rndPiece();
    nextPiece = rndPiece();
    if (collide(piece, 0, 0)) gameOver();
    drawNext();
  }
  function hardDrop() {
    while (!collide(piece, 0, 1)) {
      piece.y++;
      score += 2;
    }
    lock();
  }
  function lock() {
    merge();
    clearLines();
    updateHud();
    spawn();
  }
  function updateHud() {
    document.getElementById("score").textContent = score;
    document.getElementById("lines").textContent = lines;
    document.getElementById("level").textContent = level;
  }

  function drawCell(ctx2, x, y, color, s) {
    s = s || SIZE;
    ctx2.fillStyle = color;
    ctx2.shadowColor = color;
    ctx2.shadowBlur = 8;
    ctx2.fillRect(x * s + 1, y * s + 1, s - 2, s - 2);
    ctx2.shadowBlur = 0;
    ctx2.fillStyle = "rgba(255,255,255,0.15)";
    ctx2.fillRect(x * s + 1, y * s + 1, s - 2, 4);
  }
  function draw() {
    ctx.fillStyle = "#070b16";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    // grid
    ctx.strokeStyle = "rgba(0,255,209,0.06)";
    for (var x = 0; x <= COLS; x++) {
      ctx.beginPath();
      ctx.moveTo(x * SIZE, 0);
      ctx.lineTo(x * SIZE, ROWS * SIZE);
      ctx.stroke();
    }
    for (var y = 0; y <= ROWS; y++) {
      ctx.beginPath();
      ctx.moveTo(0, y * SIZE);
      ctx.lineTo(COLS * SIZE, y * SIZE);
      ctx.stroke();
    }
    for (y = 0; y < ROWS; y++)
      for (x = 0; x < COLS; x++)
        if (board[y][x]) drawCell(ctx, x, y, COLORS[board[y][x]]);
    if (piece) {
      for (var r = 0; r < piece.m.length; r++)
        for (var c = 0; c < piece.m[r].length; c++)
          if (piece.m[r][c])
            drawCell(ctx, piece.x + c, piece.y + r, COLORS[piece.type]);
    }
    if (paused && running) {
      ctx.fillStyle = "rgba(5,8,15,0.6)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#00ffd1";
      ctx.font = "bold 28px Orbitron";
      ctx.textAlign = "center";
      ctx.fillText("PAUSA", canvas.width / 2, canvas.height / 2);
    }
  }
  function drawNext() {
    nctx.fillStyle = "#070b16";
    nctx.fillRect(0, 0, nextC.width, nextC.height);
    if (!nextPiece) return;
    var s = 24;
    var m = nextPiece.m;
    var ox = (4 - m[0].length) / 2;
    var oy = (4 - m.length) / 2;
    for (var r = 0; r < m.length; r++)
      for (var c = 0; c < m[r].length; c++)
        if (m[r][c]) drawCell(nctx, ox + c, oy + r, COLORS[nextPiece.type], s);
  }

  function tick(ts) {
    if (!last) last = ts;
    var dt = ts - last;
    last = ts;
    if (running && !paused) {
      acc += dt;
      while (acc >= dropMs) {
        acc -= dropMs;
        if (!collide(piece, 0, 1)) piece.y++;
        else lock();
      }
    }
    draw();
    requestAnimationFrame(tick);
  }

  function start() {
    board = emptyBoard();
    score = 0;
    lines = 0;
    level = 1;
    dropMs = 800;
    acc = 0;
    nextPiece = null;
    running = true;
    paused = false;
    updateHud();
    spawn();
    document.getElementById("overlay").classList.add("hidden");
  }
  function gameOver() {
    running = false;
    document.getElementById("overlay").classList.remove("hidden");
    document.getElementById("ov-title").textContent = "GAME OVER";
    document.getElementById("ov-msg").textContent =
      "Score: " + score + " · Líneas " + lines;
    document.getElementById("btn-start").textContent = "REINTENTAR";
  }

  function move(dx) {
    if (!running || paused) return;
    if (!collide(piece, dx, 0)) piece.x += dx;
  }
  function softDrop() {
    if (!running || paused) return;
    if (!collide(piece, 0, 1)) {
      piece.y++;
      score += 1;
      updateHud();
    } else lock();
  }

  document.addEventListener("keydown", function (e) {
    if (!running && e.key !== "Enter") return;
    if (e.key === "ArrowLeft") move(-1);
    if (e.key === "ArrowRight") move(1);
    if (e.key === "ArrowDown") softDrop();
    if (e.key === "ArrowUp") tryRotate();
    if (e.key === " ") {
      e.preventDefault();
      hardDrop();
    }
    if (e.key === "p" || e.key === "P" || e.key === "Escape") {
      if (running) paused = !paused;
    }
  });

  document.querySelectorAll("#touch [data-act]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var a = btn.getAttribute("data-act");
      if (a === "left") move(-1);
      if (a === "right") move(1);
      if (a === "rot") tryRotate();
      if (a === "drop") softDrop();
    });
  });

  document.getElementById("btn-start").onclick = start;
  document.getElementById("btn-pause").onclick = function () {
    if (running) paused = !paused;
  };

  board = emptyBoard();
  draw();
  requestAnimationFrame(tick);
})();
