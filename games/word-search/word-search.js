/**
 * Sopa de Letras Neón — búsqueda de palabras 8 direcciones
 * Pausar, timer, dificultad, partículas, touch/mouse
 */
(function () {
  "use strict";

  const DIRS = [
    [0, 1],
    [1, 0],
    [0, -1],
    [-1, 0],
    [1, 1],
    [1, -1],
    [-1, 1],
    [-1, -1],
  ];

  const WORD_BANKS = {
    easy: [
      "HTML",
      "CSS",
      "CODE",
      "JAVA",
      "DATA",
      "API",
      "WEB",
      "NEON",
      "GAME",
      "BYTE",
    ],
    normal: [
      "HTML",
      "CSS",
      "JAVASCRIPT",
      "PYTHON",
      "REACT",
      "NODE",
      "CANVAS",
      "PIXEL",
      "CYBER",
      "NEON",
      "CODER",
      "DEBUG",
      "ARRAY",
      "LOGIC",
    ],
    hard: [
      "JAVASCRIPT",
      "TYPESCRIPT",
      "PYTHON",
      "FRAMEWORK",
      "DATABASE",
      "FRONTEND",
      "BACKEND",
      "ALGORITHM",
      "CYBERPUNK",
      "PORTFOLIO",
      "RESPONSIVE",
      "FUNCTION",
    ],
  };

  const SIZE_MAP = { easy: 8, normal: 10, hard: 12 };
  const COUNT_MAP = { easy: 6, normal: 8, hard: 10 };

  const boardEl = document.getElementById("board");
  const wordListEl = document.getElementById("word-list");
  const foundEl = document.getElementById("found-count");
  const totalEl = document.getElementById("total-count");
  const timerEl = document.getElementById("timer");
  const difficultyEl = document.getElementById("difficulty");
  const newBtn = document.getElementById("new-btn");
  const pauseBtn = document.getElementById("pause-btn");
  const startBtn = document.getElementById("start-btn");
  const resumeBtn = document.getElementById("resume-btn");
  const pauseNewBtn = document.getElementById("pause-new-btn");
  const playAgainBtn = document.getElementById("play-again");
  const startModal = document.getElementById("start-modal");
  const pauseModal = document.getElementById("pause-modal");
  const winModal = document.getElementById("win-modal");
  const winTimeEl = document.getElementById("win-time");
  const winHiEl = document.getElementById("win-hi");

  let size = 10;
  let grid = [];
  let words = [];
  let found = {};
  let cellMap = []; // positions of placed words
  let selecting = false;
  let startCell = null;
  let currentPath = [];
  let seconds = 0;
  let timerId = null;
  let started = false;
  let paused = false;
  let difficulty = "normal";

  function formatTime(s) {
    const m = Math.floor(s / 60);
    return String(m).padStart(2, "0") + ":" + String(s % 60).padStart(2, "0");
  }

  function startTimer() {
    if (timerId) return;
    timerId = setInterval(function () {
      if (paused) return;
      seconds++;
      timerEl.textContent = formatTime(seconds);
    }, 1000);
  }

  function stopTimer() {
    if (timerId) {
      clearInterval(timerId);
      timerId = null;
    }
  }

  function randomLetter() {
    return "ABCDEFGHIJKLMNOPQRSTUVWXYZ"[Math.floor(Math.random() * 26)];
  }

  function canPlace(word, r, c, dr, dc) {
    for (let i = 0; i < word.length; i++) {
      const nr = r + dr * i;
      const nc = c + dc * i;
      if (nr < 0 || nc < 0 || nr >= size || nc >= size) return false;
      const ch = grid[nr][nc];
      if (ch !== "" && ch !== word[i]) return false;
    }
    return true;
  }

  function placeWord(word) {
    const tries = 80;
    for (let t = 0; t < tries; t++) {
      const dir = DIRS[Math.floor(Math.random() * DIRS.length)];
      const dr = dir[0];
      const dc = dir[1];
      const r = Math.floor(Math.random() * size);
      const c = Math.floor(Math.random() * size);
      if (!canPlace(word, r, c, dr, dc)) continue;
      const path = [];
      for (let i = 0; i < word.length; i++) {
        const nr = r + dr * i;
        const nc = c + dc * i;
        grid[nr][nc] = word[i];
        path.push([nr, nc]);
      }
      return path;
    }
    return null;
  }

  function buildGrid() {
    difficulty = difficultyEl.value || "normal";
    size = SIZE_MAP[difficulty] || 10;
    const bank = WORD_BANKS[difficulty].slice();
    const need = COUNT_MAP[difficulty] || 8;

    // Shuffle bank
    for (let i = bank.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const tmp = bank[i];
      bank[i] = bank[j];
      bank[j] = tmp;
    }

    grid = Array.from({ length: size }, function () {
      return Array.from({ length: size }, function () {
        return "";
      });
    });

    words = [];
    cellMap = {};
    found = {};

    for (let i = 0; i < bank.length && words.length < need; i++) {
      const w = bank[i].toUpperCase().replace(/[^A-Z]/g, "");
      if (w.length < 3 || w.length > size) continue;
      const path = placeWord(w);
      if (path) {
        words.push(w);
        cellMap[w] = path;
      }
    }

    // Fill empty
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (!grid[r][c]) grid[r][c] = randomLetter();
      }
    }

    seconds = 0;
    started = false;
    paused = false;
    stopTimer();
    timerEl.textContent = "00:00";
    foundEl.textContent = "0";
    totalEl.textContent = String(words.length);
    pauseBtn.textContent = "PAUSA";
    boardEl.classList.remove("paused");
    pauseModal.classList.add("hidden");
    winModal.classList.add("hidden");
    render();
  }

  function calcCellSize() {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    let boardCap;
    if (vw <= 480) boardCap = Math.min(vw - 24, 360);
    else if (vw <= 768) boardCap = Math.min(vw * 0.62, 420);
    else if (vw <= 920) boardCap = 460;
    else if (vw <= 1279) boardCap = 500;
    else boardCap = 540;

    const heightCap = vh < 500 ? vh * 0.55 : vh * 0.62;
    const maxSide = Math.min(boardCap, heightCap);
    const gap = size >= 12 ? 2 : size >= 10 ? 3 : 4;
    const pad = 8;
    const raw = Math.floor((maxSide - pad - gap * (size - 1)) / size);
    const minC = vw <= 480 ? 22 : 26;
    const maxC = size >= 12 ? 36 : size >= 10 ? 42 : 48;
    return { cell: Math.max(minC, Math.min(maxC, raw)), gap: gap, pad: pad };
  }

  function render() {
    const dims = calcCellSize();
    boardEl.style.gridTemplateColumns =
      "repeat(" + size + ", " + dims.cell + "px)";
    boardEl.style.setProperty("--cell", dims.cell + "px");
    boardEl.style.setProperty("--gap", dims.gap + "px");
    boardEl.style.setProperty("--pad", dims.pad + "px");
    boardEl.innerHTML = "";

    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        const div = document.createElement("div");
        div.className = "cell";
        div.textContent = grid[r][c];
        div.dataset.r = String(r);
        div.dataset.c = String(c);
        div.setAttribute("role", "gridcell");
        boardEl.appendChild(div);
      }
    }

    // Mark already found cells
    Object.keys(found).forEach(function (w) {
      markFound(w, false);
    });

    // Word list
    wordListEl.innerHTML = "";
    words.forEach(function (w) {
      const li = document.createElement("li");
      li.textContent = w;
      li.dataset.word = w;
      if (found[w]) li.classList.add("found");
      wordListEl.appendChild(li);
    });
  }

  function getCellFromPoint(x, y) {
    const el = document.elementFromPoint(x, y);
    if (!el || !el.classList.contains("cell")) return null;
    return {
      r: parseInt(el.dataset.r, 10),
      c: parseInt(el.dataset.c, 10),
      el: el,
    };
  }

  function linePath(r0, c0, r1, c1) {
    const dr = r1 - r0;
    const dc = c1 - c0;
    const steps = Math.max(Math.abs(dr), Math.abs(dc));
    if (steps === 0) return [[r0, c0]];
    // Must be straight line in one of 8 directions
    if (dr !== 0 && dc !== 0 && Math.abs(dr) !== Math.abs(dc)) return null;
    const sr = dr === 0 ? 0 : dr / Math.abs(dr);
    const sc = dc === 0 ? 0 : dc / Math.abs(dc);
    const path = [];
    for (let i = 0; i <= steps; i++) {
      path.push([r0 + sr * i, c0 + sc * i]);
    }
    return path;
  }

  function clearSelecting() {
    boardEl.querySelectorAll(".cell.selecting").forEach(function (el) {
      el.classList.remove("selecting");
    });
    currentPath = [];
  }

  function highlightPath(path) {
    clearSelecting();
    if (!path) return;
    path.forEach(function (p) {
      const el = boardEl.querySelector(
        '.cell[data-r="' + p[0] + '"][data-c="' + p[1] + '"]',
      );
      if (el) el.classList.add("selecting");
    });
    currentPath = path;
  }

  function pathToWord(path) {
    return path
      .map(function (p) {
        return grid[p[0]][p[1]];
      })
      .join("");
  }

  function markFound(word, animate) {
    const path = cellMap[word];
    if (!path) return;
    path.forEach(function (p) {
      const el = boardEl.querySelector(
        '.cell[data-r="' + p[0] + '"][data-c="' + p[1] + '"]',
      );
      if (el) {
        el.classList.remove("selecting");
        el.classList.add("found");
      }
    });
    const li = wordListEl.querySelector('li[data-word="' + word + '"]');
    if (li) li.classList.add("found");
  }

  function tryComplete(path) {
    if (!path || path.length < 2) return;
    const forward = pathToWord(path);
    const backward = pathToWord(path.slice().reverse());
    let match = null;
    if (words.indexOf(forward) !== -1 && !found[forward]) match = forward;
    else if (words.indexOf(backward) !== -1 && !found[backward])
      match = backward;

    if (match) {
      found[match] = true;
      markFound(match, true);
      const n = Object.keys(found).length;
      foundEl.textContent = String(n);
      if (n >= words.length) onWin();
    }
  }

  function onPointerDown(e) {
    if (paused || !started) return;
    if (e.cancelable) e.preventDefault();
    const pt = e.touches ? e.touches[0] : e;
    const cell = getCellFromPoint(pt.clientX, pt.clientY);
    if (!cell) return;
    selecting = true;
    startCell = cell;
    highlightPath([[cell.r, cell.c]]);
  }

  function onPointerMove(e) {
    if (!selecting || !startCell || paused) return;
    if (e.cancelable) e.preventDefault();
    const pt = e.touches ? e.touches[0] : e;
    const cell = getCellFromPoint(pt.clientX, pt.clientY);
    if (!cell) return;
    const path = linePath(startCell.r, startCell.c, cell.r, cell.c);
    if (path) highlightPath(path);
  }

  function onPointerUp() {
    if (!selecting) return;
    selecting = false;
    tryComplete(currentPath);
    clearSelecting();
    startCell = null;
  }

  function onWin() {
    stopTimer();
    paused = false;
    const key = "sopaLetrasHi_" + difficulty;
    const prev = localStorage.getItem(key);
    let hiText = formatTime(seconds);
    if (!prev || seconds < parseInt(prev, 10)) {
      localStorage.setItem(key, String(seconds));
    } else {
      hiText = formatTime(parseInt(prev, 10));
    }
    winTimeEl.textContent = formatTime(seconds);
    winHiEl.textContent = hiText;
    winModal.classList.remove("hidden");
    pauseModal.classList.add("hidden");
  }

  function pauseGame() {
    if (paused || !started) return;
    if (!winModal.classList.contains("hidden")) return;
    if (!startModal.classList.contains("hidden")) return;
    paused = true;
    boardEl.classList.add("paused");
    pauseModal.classList.remove("hidden");
    pauseBtn.textContent = "REANUDAR";
  }

  function resumeGame() {
    if (!paused) return;
    paused = false;
    boardEl.classList.remove("paused");
    pauseModal.classList.add("hidden");
    pauseBtn.textContent = "PAUSA";
    if (started && !timerId) startTimer();
  }

  function togglePause() {
    if (!started) return;
    if (!winModal.classList.contains("hidden")) return;
    if (!startModal.classList.contains("hidden")) return;
    if (paused) resumeGame();
    else pauseGame();
  }

  function startGame() {
    startModal.classList.add("hidden");
    buildGrid();
    started = true;
    startTimer();
  }

  function newGame() {
    winModal.classList.add("hidden");
    pauseModal.classList.add("hidden");
    buildGrid();
    if (!startModal.classList.contains("hidden")) return;
    started = true;
    startTimer();
  }

  /* Partículas */
  function initParticles() {
    const canvas = document.getElementById("particles-canvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const reduced =
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const COUNT = reduced ? 14 : window.innerWidth < 600 ? 24 : 36;
    let particles = [];

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }

    function P() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.size = Math.random() * 2 + 0.6;
      this.vx = (Math.random() - 0.5) * 0.5;
      this.vy = (Math.random() - 0.5) * 0.5;
      this.color =
        Math.random() > 0.5 ? "rgba(0,255,209,0.7)" : "rgba(255,0,122,0.65)";
    }
    P.prototype.update = function () {
      this.x += this.vx;
      this.y += this.vy;
      if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
      if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
    };
    P.prototype.draw = function () {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.fill();
    };

    function loop() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 120) {
            ctx.strokeStyle = "rgba(0,255,209," + (1 - d / 120) * 0.15 + ")";
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }
      requestAnimationFrame(loop);
    }

    resize();
    particles = [];
    for (let i = 0; i < COUNT; i++) particles.push(new P());
    if (!reduced) requestAnimationFrame(loop);
    else
      particles.forEach(function (p) {
        p.draw();
      });
    window.addEventListener("resize", resize);
  }

  /* Events */
  boardEl.addEventListener("mousedown", onPointerDown);
  window.addEventListener("mousemove", onPointerMove);
  window.addEventListener("mouseup", onPointerUp);
  boardEl.addEventListener("touchstart", onPointerDown, { passive: false });
  window.addEventListener("touchmove", onPointerMove, { passive: false });
  window.addEventListener("touchend", onPointerUp);

  startBtn.addEventListener("click", startGame);
  newBtn.addEventListener("click", function () {
    if (!startModal.classList.contains("hidden")) return;
    newGame();
  });
  pauseBtn.addEventListener("click", function (e) {
    e.preventDefault();
    togglePause();
  });
  resumeBtn.addEventListener("click", resumeGame);
  pauseNewBtn.addEventListener("click", function () {
    resumeGame();
    newGame();
  });
  playAgainBtn.addEventListener("click", newGame);
  difficultyEl.addEventListener("change", function () {
    if (!startModal.classList.contains("hidden")) {
      buildGrid();
      return;
    }
    newGame();
  });

  pauseModal.addEventListener("click", function (e) {
    if (e.target === pauseModal) resumeGame();
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "p" || e.key === "P" || e.key === "Escape") {
      e.preventDefault();
      togglePause();
    }
  });

  let resizeT = null;
  window.addEventListener("resize", function () {
    clearTimeout(resizeT);
    resizeT = setTimeout(function () {
      if (grid.length) render();
    }, 100);
  });

  initParticles();
  buildGrid();
})();
