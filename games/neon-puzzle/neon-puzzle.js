/**
 * Neon Puzzle — Sliding puzzle + pausa
 */
(function () {
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
  const winMoves = document.getElementById("win-moves");
  const winTime = document.getElementById("win-time");
  const winHi = document.getElementById("win-hi");
  const playAgain = document.getElementById("play-again");
  const confettiCanvas = document.getElementById("confetti");
  const cctx = confettiCanvas.getContext("2d");

  let size = 4;
  let tiles = [];
  let emptyIdx = 0;
  let moves = 0;
  let seconds = 0;
  let timerInterval = null;
  let started = false;
  let paused = false;
  let confettiParticles = [];

  function formatTime(s) {
    const m = Math.floor(s / 60)
      .toString()
      .padStart(2, "0");
    const sec = (s % 60).toString().padStart(2, "0");
    return m + ":" + sec;
  }

  function startTimer() {
    if (timerInterval || paused) return;
    timerInterval = setInterval(() => {
      if (paused) return;
      seconds++;
      timerEl.textContent = formatTime(seconds);
    }, 1000);
  }

  function stopTimer() {
    clearInterval(timerInterval);
    timerInterval = null;
  }

  function pauseGame() {
    if (paused || !started || !winModal.classList.contains("hidden")) return;
    paused = true;
    stopTimer();
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
    if (started) startTimer();
  }

  function togglePause() {
    if (paused) resumeGame();
    else pauseGame();
  }

  function isSolvable(arr) {
    let inv = 0;
    const flat = arr.filter((n) => n !== 0);
    for (let i = 0; i < flat.length; i++) {
      for (let j = i + 1; j < flat.length; j++) {
        if (flat[i] > flat[j]) inv++;
      }
    }
    if (size % 2 === 1) return inv % 2 === 0;
    const emptyRow = Math.floor(arr.indexOf(0) / size);
    return (inv + emptyRow) % 2 === 1;
  }

  function isWon() {
    for (let i = 0; i < tiles.length - 1; i++) {
      if (tiles[i] !== i + 1) return false;
    }
    return tiles[tiles.length - 1] === 0;
  }

  function shuffle() {
    size = parseInt(difficultyEl.value, 10);
    const total = size * size;
    do {
      tiles = Array.from({ length: total }, (_, i) => (i + 1) % total);
      for (let i = tiles.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [tiles[i], tiles[j]] = [tiles[j], tiles[i]];
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
    movesEl.textContent = moves;
    render();
    if (isWon()) onWin();
  }

  function render() {
    boardEl.style.gridTemplateColumns = "repeat(" + size + ", 1fr)";
    boardEl.innerHTML = "";
    const tileSize = size >= 5 ? 56 : size === 4 ? 70 : 80;
    tiles.forEach((val, i) => {
      const div = document.createElement("div");
      div.className = "tile" + (val === 0 ? " empty" : "");
      div.style.width = tileSize + "px";
      div.style.height = tileSize + "px";
      if (val !== 0) {
        div.textContent = val;
        div.addEventListener("click", () => move(i));
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
      const [hm, hs] = prev.split("|");
      hiText = hm + " mov / " + formatTime(parseInt(hs, 10));
    }
    winMoves.textContent = moves;
    winTime.textContent = formatTime(seconds);
    winHi.textContent = hiText;
    winModal.classList.remove("hidden");
    pauseModal.classList.add("hidden");
    launchConfetti();
  }

  function launchConfetti() {
    confettiCanvas.width = window.innerWidth;
    confettiCanvas.height = window.innerHeight;
    confettiParticles = [];
    for (let i = 0; i < 80; i++) {
      confettiParticles.push({
        x: Math.random() * confettiCanvas.width,
        y: -20 - Math.random() * 100,
        vx: (Math.random() - 0.5) * 4,
        vy: Math.random() * 3 + 2,
        color: Math.random() > 0.5 ? "#00FFD1" : "#FF007A",
        size: Math.random() * 6 + 3,
        life: 120,
      });
    }
    function anim() {
      cctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
      confettiParticles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.life--;
        cctx.globalAlpha = Math.max(0, p.life / 120);
        cctx.fillStyle = p.color;
        cctx.fillRect(p.x, p.y, p.size, p.size);
      });
      confettiParticles = confettiParticles.filter((p) => p.life > 0);
      if (confettiParticles.length) requestAnimationFrame(anim);
      else cctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    }
    anim();
  }

  shuffleBtn.addEventListener("click", shuffle);
  difficultyEl.addEventListener("change", shuffle);
  playAgain.addEventListener("click", shuffle);
  pauseBtn.addEventListener("click", togglePause);
  resumeBtn.addEventListener("click", resumeGame);
  pauseShuffleBtn.addEventListener("click", shuffle);

  document.addEventListener("keydown", (e) => {
    if (e.key === "p" || e.key === "P" || e.key === "Escape") {
      e.preventDefault();
      if (!winModal.classList.contains("hidden")) return;
      togglePause();
    }
  });

  shuffle();
})();
