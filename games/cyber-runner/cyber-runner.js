/**
 * Cyber Runner — Infinite runner cyberpunk + pausa
 */
(function () {
  const canvas = document.getElementById("game-canvas");
  const ctx = canvas.getContext("2d");
  const scoreEl = document.getElementById("score");
  const hiEl = document.getElementById("hi-score");
  const finalScoreEl = document.getElementById("final-score");
  const finalHiEl = document.getElementById("final-hi");
  const startScreen = document.getElementById("start-screen");
  const gameoverScreen = document.getElementById("gameover-screen");
  const pauseScreen = document.getElementById("pause-screen");
  const startBtn = document.getElementById("start-btn");
  const restartBtn = document.getElementById("restart-btn");
  const resumeBtn = document.getElementById("resume-btn");
  const pauseRestartBtn = document.getElementById("pause-restart-btn");
  const pauseBtn = document.getElementById("pause-btn");
  const uiHud = document.getElementById("ui-hud");

  const W = 800,
    H = 400;
  canvas.width = W;
  canvas.height = H;

  let state = "start"; // start | playing | paused | gameover
  let score = 0;
  let highScore = parseInt(localStorage.getItem("cyberRunnerHi") || "0", 10);
  hiEl.textContent = highScore;

  const player = {
    x: 100,
    y: H - 80,
    w: 28,
    h: 28,
    vy: 0,
    jumping: false,
    groundY: H - 80,
  };
  const GRAVITY = 0.7;
  const JUMP = -13;

  let obstacles = [];
  let spawnTimer = 0;
  let speed = 5;
  let particles = [];
  let gridOffset = 0;

  function reset() {
    score = 0;
    speed = 5;
    obstacles = [];
    particles = [];
    spawnTimer = 0;
    player.y = player.groundY;
    player.vy = 0;
    player.jumping = false;
    scoreEl.textContent = "0";
  }

  function jump() {
    if (state !== "playing") return;
    if (!player.jumping) {
      player.vy = JUMP;
      player.jumping = true;
      for (let i = 0; i < 8; i++) {
        particles.push({
          x: player.x + player.w / 2,
          y: player.y + player.h,
          vx: (Math.random() - 0.5) * 4,
          vy: Math.random() * 2 + 1,
          life: 20,
          color: Math.random() > 0.5 ? "#00FFD1" : "#FF007A",
        });
      }
    }
  }

  function spawnObstacle() {
    const h = 30 + Math.random() * 40;
    obstacles.push({
      x: W + 10,
      y: H - 50 - h,
      w: 20 + Math.random() * 15,
      h: h,
    });
  }

  function pauseGame() {
    if (state !== "playing") return;
    state = "paused";
    pauseScreen.classList.remove("hidden");
    uiHud.classList.remove("playing");
  }

  function resumeGame() {
    if (state !== "paused") return;
    state = "playing";
    pauseScreen.classList.add("hidden");
    uiHud.classList.add("playing");
  }

  function togglePause() {
    if (state === "playing") pauseGame();
    else if (state === "paused") resumeGame();
  }

  function update() {
    if (state !== "playing") return;

    player.vy += GRAVITY;
    player.y += player.vy;
    if (player.y >= player.groundY) {
      player.y = player.groundY;
      player.vy = 0;
      player.jumping = false;
    }

    speed += 0.0015;
    score += Math.floor(speed * 0.15);
    scoreEl.textContent = score;

    spawnTimer--;
    if (spawnTimer <= 0) {
      spawnObstacle();
      spawnTimer = 60 + Math.random() * 50 - Math.min(speed * 2, 30);
    }
    obstacles.forEach((o) => {
      o.x -= speed;
    });
    obstacles = obstacles.filter((o) => o.x + o.w > 0);

    for (const o of obstacles) {
      if (
        player.x < o.x + o.w &&
        player.x + player.w > o.x &&
        player.y < o.y + o.h &&
        player.y + player.h > o.y
      ) {
        gameOver();
        return;
      }
    }

    particles.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      p.life--;
    });
    particles = particles.filter((p) => p.life > 0);
    gridOffset = (gridOffset + speed * 0.5) % 40;
  }

  function drawGrid() {
    ctx.strokeStyle = "rgba(0,255,209,0.08)";
    ctx.lineWidth = 1;
    for (let y = H - 50; y > H / 2; y -= 20) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(W, y);
      ctx.stroke();
    }
    const vanishingX = W / 2;
    for (let i = -10; i <= 10; i++) {
      const x = vanishingX + i * 40 - gridOffset;
      ctx.beginPath();
      ctx.moveTo(vanishingX, H / 2);
      ctx.lineTo(x, H);
      ctx.stroke();
    }
    ctx.strokeStyle = "rgba(0,255,209,0.4)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, H - 50);
    ctx.lineTo(W, H - 50);
    ctx.stroke();
  }

  function draw() {
    ctx.fillStyle = "#0A0F1B";
    ctx.fillRect(0, 0, W, H);
    drawGrid();

    const glow = ctx.createRadialGradient(
      player.x + player.w / 2,
      player.y + player.h / 2,
      0,
      player.x + player.w / 2,
      player.y + player.h / 2,
      30,
    );
    glow.addColorStop(0, "rgba(0,255,209,0.5)");
    glow.addColorStop(1, "transparent");
    ctx.fillStyle = glow;
    ctx.fillRect(player.x - 15, player.y - 15, player.w + 30, player.h + 30);

    ctx.fillStyle = "#00FFD1";
    ctx.shadowColor = "#00FFD1";
    ctx.shadowBlur = 15;
    ctx.fillRect(player.x, player.y, player.w, player.h);
    ctx.shadowBlur = 0;

    obstacles.forEach((o) => {
      ctx.fillStyle = "#FF007A";
      ctx.shadowColor = "#FF007A";
      ctx.shadowBlur = 12;
      ctx.fillRect(o.x, o.y, o.w, o.h);
      ctx.shadowBlur = 0;
      ctx.strokeStyle = "#FF4DA6";
      ctx.lineWidth = 2;
      ctx.strokeRect(o.x, o.y, o.w, o.h);
    });

    particles.forEach((p) => {
      ctx.globalAlpha = p.life / 20;
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x, p.y, 3, 3);
      ctx.globalAlpha = 1;
    });
  }

  function gameOver() {
    state = "gameover";
    uiHud.classList.remove("playing");
    if (score > highScore) {
      highScore = score;
      localStorage.setItem("cyberRunnerHi", String(highScore));
      hiEl.textContent = highScore;
    }
    finalScoreEl.textContent = score;
    finalHiEl.textContent = highScore;
    pauseScreen.classList.add("hidden");
    gameoverScreen.classList.remove("hidden");
  }

  function startGame() {
    reset();
    state = "playing";
    startScreen.classList.add("hidden");
    gameoverScreen.classList.add("hidden");
    pauseScreen.classList.add("hidden");
    uiHud.classList.add("playing");
  }

  function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
  }

  document.addEventListener("keydown", (e) => {
    if (e.code === "Space") {
      e.preventDefault();
      if (state === "start" || state === "gameover") startGame();
      else if (state === "paused") resumeGame();
      else jump();
    }
    if (e.key === "p" || e.key === "P" || e.key === "Escape") {
      e.preventDefault();
      togglePause();
    }
  });

  canvas.addEventListener("pointerdown", () => {
    if (state === "playing") jump();
  });

  startBtn.addEventListener("click", startGame);
  restartBtn.addEventListener("click", startGame);
  resumeBtn.addEventListener("click", resumeGame);
  pauseRestartBtn.addEventListener("click", startGame);
  pauseBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    togglePause();
  });

  function fitCanvas() {
    const pad = window.innerWidth < 600 ? 0 : 16;
    const availW = Math.max(200, window.innerWidth - pad * 2);
    const availH = Math.max(160, window.innerHeight - pad * 2);
    const scale = Math.min(availW / W, availH / H);
    canvas.style.width = Math.floor(W * scale) + "px";
    canvas.style.height = Math.floor(H * scale) + "px";
  }
  window.addEventListener("resize", fitCanvas);
  window.addEventListener("orientationchange", () =>
    setTimeout(fitCanvas, 120),
  );
  fitCanvas();
  loop();
})();
