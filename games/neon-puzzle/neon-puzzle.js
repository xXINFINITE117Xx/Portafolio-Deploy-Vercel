/**
 * Neon Puzzle — sliding puzzle + pausa fiable + partículas de fondo
 */
(function () {
  "use strict";

  const boardEl = document.getElementById("board");
  const movesEl = document.getElementById("moves");
  const timerEl = document.getElementById("timer");
  const difficultyEl = document.getElementById("difficulty");
  const shuffleBtn = document.getElementById("shuffle-btn");
  const pauseBtn = document.getElementById("pause-btn");
  const resumeBtn = document.getElementById("resume-btn");
  const pauseShuffleBtn = document.getElementById("pause-shuffle-btn");
  const pauseModal = document.getElementById("pause-modal");
  const winModal = document.getElementById("win-modal");
  const playAgainBtn = document.getElementById("play-again");
  const winMoves = document.getElementById("win-moves");
  const winTime = document.getElementById("win-time");
  const winHi = document.getElementById("win-hi");

  let size = 4;
  let tiles = [];
  let emptyIdx = 0;
  let moves = 0;
  let seconds = 0;
  let timerId = null;
  let started = false;
  let paused = false;

  function formatTime(s) {
    const m = Math.floor(s / 60);
    const r = s % 60;
    return String(m).padStart(2, "0") + ":" + String(r).padStart(2, "0");
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

  /** Pausa siempre disponible (excepto en victoria) */
  function pauseGame() {
    if (paused) return;
    if (!winModal.classList.contains("hidden")) return;

    paused = true;
    boardEl.classList.add("paused");
    pauseModal.classList.remove("hidden");
    pauseBtn.textContent = "REANUDAR";
    pauseBtn.setAttribute("aria-pressed", "true");
  }

  function resumeGame() {
    if (!paused) return;
    paused = false;
    boardEl.classList.remove("paused");
    pauseModal.classList.add("hidden");
    pauseBtn.textContent = "PAUSA";
    pauseBtn.setAttribute("aria-pressed", "false");
    if (started && !timerId) startTimer();
  }

  function togglePause() {
    if (!winModal.classList.contains("hidden")) return;
    if (paused) resumeGame();
    else pauseGame();
  }

  function isWon() {
    for (let i = 0; i < tiles.length - 1; i++) {
      if (tiles[i] !== i + 1) return false;
    }
    return tiles[tiles.length - 1] === 0;
  }

  function inversionCount(arr) {
    let inv = 0;
    for (let i = 0; i < arr.length; i++) {
      if (arr[i] === 0) continue;
      for (let j = i + 1; j < arr.length; j++) {
        if (arr[j] !== 0 && arr[i] > arr[j]) inv++;
      }
    }
    return inv;
  }

  function isSolvable(arr) {
    const inv = inversionCount(arr);
    if (size % 2 === 1) return inv % 2 === 0;
    const emptyRowFromBottom = size - Math.floor(arr.indexOf(0) / size);
    return (inv + emptyRowFromBottom) % 2 === 0;
  }

  function shuffle() {
    size = parseInt(difficultyEl.value, 10) || 4;
    const total = size * size;
    do {
      tiles = Array.from({ length: total }, function (_, i) {
        return (i + 1) % total;
      });
      for (let i = tiles.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const tmp = tiles[i];
        tiles[i] = tiles[j];
        tiles[j] = tmp;
      }
    } while (!isSolvable(tiles) || isWon());

    emptyIdx = tiles.indexOf(0);
    moves = 0;
    seconds = 0;
    started = false;
    paused = false;
    stopTimer();
    movesEl.textContent = "0";
    timerEl.textContent = "00:00";
    winModal.classList.add("hidden");
    pauseModal.classList.add("hidden");
    boardEl.classList.remove("paused");
    pauseBtn.textContent = "PAUSA";
    pauseBtn.setAttribute("aria-pressed", "false");
    render();
  }

  function canMove(idx) {
    const er = Math.floor(emptyIdx / size);
    const ec = emptyIdx % size;
    const r = Math.floor(idx / size);
    const c = idx % size;
    return (
      (r === er && Math.abs(c - ec) === 1) ||
      (c === ec && Math.abs(r - er) === 1)
    );
  }

  function move(idx) {
    if (paused) return;
    if (!canMove(idx)) return;
    if (!started) {
      started = true;
      startTimer();
    }
    tiles[emptyIdx] = tiles[idx];
    tiles[idx] = 0;
    emptyIdx = idx;
    moves++;
    movesEl.textContent = String(moves);
    render();
    if (isWon()) onWin();
  }

  function calcTileSize() {
    const wrap = boardEl.parentElement;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const wrapW = wrap ? wrap.clientWidth : vw;

    // Techo de tablero según breakpoint de la guía
    let boardCap;
    if (vw <= 480) boardCap = Math.min(wrapW - 4, 360);
    else if (vw <= 768) boardCap = Math.min(wrapW - 8, 440);
    else if (vw <= 920) boardCap = Math.min(wrapW - 8, 480);
    else if (vw <= 1279) boardCap = Math.min(wrapW - 8, 520);
    else boardCap = Math.min(wrapW - 8, 560);

    // En landscape bajo, limitar por altura
    const heightCap = vh < 500 ? vh * 0.5 : vh * 0.58;
    const maxSide = Math.min(boardCap, heightCap);

    const gap = size >= 5 ? 5 : size === 4 ? 7 : 8;
    const pad = vw <= 480 ? 12 : 16;
    const raw = Math.floor((maxSide - pad - gap * (size - 1)) / size);

    let maxTile, minTile;
    if (vw <= 480) {
      maxTile = size >= 5 ? 56 : size === 4 ? 68 : 78;
      minTile = 36;
    } else if (vw <= 768) {
      maxTile = size >= 5 ? 64 : size === 4 ? 78 : 90;
      minTile = 42;
    } else if (vw <= 920) {
      maxTile = size >= 5 ? 70 : size === 4 ? 84 : 96;
      minTile = 48;
    } else if (vw <= 1279) {
      maxTile = size >= 5 ? 76 : size === 4 ? 90 : 102;
      minTile = 52;
    } else {
      maxTile = size >= 5 ? 84 : size === 4 ? 98 : 110;
      minTile = 56;
    }

    return Math.max(minTile, Math.min(maxTile, raw));
  }

  function render() {
    const tileSize = calcTileSize();
    const gap = size >= 5 ? 5 : 7;
    boardEl.style.gridTemplateColumns =
      "repeat(" + size + ", " + tileSize + "px)";
    boardEl.style.setProperty("--tile", tileSize + "px");
    boardEl.style.setProperty("--gap", gap + "px");
    boardEl.innerHTML = "";

    tiles.forEach(function (val, i) {
      const div = document.createElement("div");
      div.className = "tile" + (val === 0 ? " empty" : "");
      div.setAttribute("role", "gridcell");
      if (val !== 0) {
        div.textContent = String(val);
        div.tabIndex = 0;
        div.addEventListener("click", function () {
          move(i);
        });
        div.addEventListener("keydown", function (e) {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            move(i);
          }
        });
      } else {
        div.setAttribute("aria-label", "Hueco");
      }
      boardEl.appendChild(div);
    });
  }

  function onWin() {
    stopTimer();
    paused = false;
    const key = "neonPuzzleHi_" + size;
    const prev = localStorage.getItem(key);
    let hiText = moves + " mov / " + formatTime(seconds);
    if (!prev || moves < parseInt(prev.split("|")[0], 10)) {
      localStorage.setItem(key, moves + "|" + seconds);
    } else {
      const parts = prev.split("|");
      hiText = parts[0] + " mov / " + formatTime(parseInt(parts[1], 10));
    }
    winMoves.textContent = String(moves);
    winTime.textContent = formatTime(seconds);
    winHi.textContent = hiText;
    winModal.classList.remove("hidden");
    pauseModal.classList.add("hidden");
    boardEl.classList.remove("paused");
    pauseBtn.textContent = "PAUSA";
    launchConfetti();
  }

  function launchConfetti() {
    const canvas = document.getElementById("confetti");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const pieces = [];
    const colors = ["#00FFD1", "#FF007A", "#FFD700", "#7B61FF", "#FFFFFF"];
    for (let i = 0; i < 80; i++) {
      pieces.push({
        x: Math.random() * canvas.width,
        y: Math.random() * -canvas.height,
        w: 4 + Math.random() * 6,
        h: 6 + Math.random() * 8,
        vy: 2 + Math.random() * 3,
        vx: (Math.random() - 0.5) * 2,
        rot: Math.random() * Math.PI,
        vr: (Math.random() - 0.5) * 0.2,
        color: colors[i % colors.length],
      });
    }
    let frames = 0;
    function frame() {
      frames++;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      pieces.forEach(function (p) {
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.vr;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      });
      if (frames < 120) requestAnimationFrame(frame);
      else ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    requestAnimationFrame(frame);
  }

  /* ---------- Partículas de fondo (estilo portafolio) ---------- */
  function initParticles() {
    const canvas = document.getElementById("particles-canvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const reduced =
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const COUNT = reduced ? 18 : window.innerWidth < 600 ? 28 : 42;
    let particles = [];
    let mouse = { x: null, y: null, radius: 90 };
    let raf = 0;

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }

    function Particle() {
      this.reset();
    }
    Particle.prototype.reset = function () {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.size = Math.random() * 2 + 0.7;
      this.speedX = (Math.random() - 0.5) * 0.55;
      this.speedY = (Math.random() - 0.5) * 0.55;
      this.color =
        Math.random() > 0.5
          ? "rgba(0, 255, 209, 0.75)"
          : "rgba(255, 0, 122, 0.7)";
    };
    Particle.prototype.update = function () {
      this.x += this.speedX;
      this.y += this.speedY;
      if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
      if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;
      if (mouse.x !== null) {
        const dx = this.x - mouse.x;
        const dy = this.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < mouse.radius && dist > 0.01) {
          const force = (mouse.radius - dist) / mouse.radius;
          this.x += (dx / dist) * force * 1.4;
          this.y += (dy / dist) * force * 1.4;
        }
      }
    };
    Particle.prototype.draw = function () {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.fill();
    };

    function connect() {
      const maxDist = 130;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < maxDist) {
            const opacity = (1 - dist / maxDist) * 0.18;
            ctx.strokeStyle = "rgba(0, 255, 209, " + opacity + ")";
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }
    }

    function loop() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(function (p) {
        p.update();
        p.draw();
      });
      connect();
      raf = requestAnimationFrame(loop);
    }

    resize();
    particles = [];
    for (let i = 0; i < COUNT; i++) particles.push(new Particle());
    if (!reduced) loop();
    else {
      particles.forEach(function (p) {
        p.draw();
      });
      connect();
    }

    window.addEventListener("resize", function () {
      resize();
    });
    window.addEventListener(
      "mousemove",
      function (e) {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
      },
      { passive: true },
    );
    window.addEventListener(
      "mouseleave",
      function () {
        mouse.x = null;
        mouse.y = null;
      },
      { passive: true },
    );
  }

  /* ---------- Eventos ---------- */
  shuffleBtn.addEventListener("click", shuffle);
  difficultyEl.addEventListener("change", shuffle);
  pauseBtn.addEventListener("click", function (e) {
    e.preventDefault();
    e.stopPropagation();
    togglePause();
  });
  resumeBtn.addEventListener("click", function (e) {
    e.preventDefault();
    resumeGame();
  });
  pauseShuffleBtn.addEventListener("click", function () {
    resumeGame();
    shuffle();
  });
  playAgainBtn.addEventListener("click", shuffle);

  // Cerrar pausa al tocar backdrop
  pauseModal.addEventListener("click", function (e) {
    if (e.target === pauseModal) resumeGame();
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "p" || e.key === "P" || e.key === "Escape") {
      e.preventDefault();
      togglePause();
    }
  });

  let resizeTimer = null;
  window.addEventListener("resize", function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      if (tiles.length) render();
    }, 100);
  });
  window.addEventListener("orientationchange", function () {
    setTimeout(function () {
      if (tiles.length) render();
    }, 150);
  });

  // Init
  initParticles();
  shuffle();
})();
