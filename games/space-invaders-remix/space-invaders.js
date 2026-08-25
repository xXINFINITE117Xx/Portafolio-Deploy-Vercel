/**
 * Space Invaders Remix — Shooter neón completo
 * Controles: ← → / A D mover · ESPACIO disparar · Touch compatible
 */
(function () {
  "use strict";

  const canvas = document.getElementById("game-canvas");
  const ctx = canvas.getContext("2d");
  const scoreEl = document.getElementById("score");
  const levelEl = document.getElementById("level");
  const livesEl = document.getElementById("lives");
  const hiEl = document.getElementById("hi-score");
  const finalScoreEl = document.getElementById("final-score");
  const endTitle = document.getElementById("end-title");
  const startScreen = document.getElementById("start-screen");
  const gameoverScreen = document.getElementById("gameover-screen");
  const startBtn = document.getElementById("start-btn");
  const restartBtn = document.getElementById("restart-btn");
  const pauseScreen = document.getElementById("pause-screen");
  const resumeBtn = document.getElementById("resume-btn");
  const pauseRestartBtn = document.getElementById("pause-restart-btn");
  const pauseBtn = document.getElementById("pause-btn");
  const uiHud = document.getElementById("ui-hud");

  const W = 480;
  const H = 560;
  canvas.width = W;
  canvas.height = H;

  // Estado
  let state = "start"; // start | playing | paused | gameover
  let score = 0;
  let level = 1;
  let lives = 3;
  let highScore = parseInt(localStorage.getItem("spaceInvadersHi") || "0", 10);
  hiEl.textContent = highScore;

  const keys = Object.create(null);
  let player = null;
  let bullets = [];
  let enemies = [];
  let enemyBullets = [];
  let barriers = [];
  let powerUps = [];
  let particles = [];
  let enemyDir = 1;
  let enemySpeed = 0.7;
  let shootCooldown = 0;
  let enemyShootTimer = 60;
  let invuln = 0; // frames de invulnerabilidad tras golpe
  let waveClearFlash = 0;

  // ---------- INIT ----------
  function initGame() {
    score = 0;
    level = 1;
    lives = 3;
    enemySpeed = 0.7;
    enemyDir = 1;
    shootCooldown = 0;
    enemyShootTimer = 80;
    invuln = 0;
    waveClearFlash = 0;

    player = {
      x: W / 2 - 15,
      y: H - 55,
      w: 30,
      h: 20,
      speed: 5.5,
      shield: 0,
      multi: false,
      rapid: 0,
    };

    bullets = [];
    enemyBullets = [];
    powerUps = [];
    particles = [];
    spawnEnemies();
    spawnBarriers();
    updateHUD();
  }

  function spawnEnemies() {
    enemies = [];
    const rows = Math.min(5, 3 + Math.floor(level / 2));
    const cols = 8;
    const colors = ["#00FFD1", "#FF007A", "#FFD700", "#7B61FF", "#FF6B35"];
    const points = [50, 40, 30, 20, 10];
    const startY = 55;
    const gapX = 48;
    const gapY = 34;
    const offsetX = (W - cols * gapX) / 2 + 10;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        enemies.push({
          x: offsetX + c * gapX,
          y: startY + r * gapY,
          w: 26,
          h: 18,
          color: colors[r % colors.length],
          points: points[r % points.length],
          type: r % 3, // 0=cuadrado, 1=octágono, 2=alien
        });
      }
    }
  }

  function spawnBarriers() {
    barriers = [];
    const positions = [55, 155, 255, 355];
    positions.forEach((bx) => {
      for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 6; c++) {
          // Forma de búnker (hueco abajo al centro)
          if (r === 2 && c >= 2 && c <= 3) continue;
          barriers.push({
            x: bx + c * 9,
            y: H - 145 + r * 9,
            w: 8,
            h: 8,
            hp: 3,
          });
        }
      }
    });
  }

  function updateHUD() {
    scoreEl.textContent = score;
    levelEl.textContent = level;
    livesEl.textContent = lives > 0 ? "♥ ".repeat(lives).trim() : "—";
  }

  // ---------- PARTICLES ----------
  function spawnExplosion(x, y, color, count) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 3 + 1;
      particles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 20 + Math.random() * 15,
        maxLife: 35,
        color: color,
        size: Math.random() * 3 + 1,
      });
    }
  }

  // ---------- SHOOT ----------
  function shoot() {
    if (state !== "playing" || !player || shootCooldown > 0) return;
    shootCooldown = player.rapid > 0 ? 7 : 16;

    const midX = player.x + player.w / 2 - 2;
    bullets.push({ x: midX, y: player.y - 4, w: 4, h: 12, vy: -9 });

    if (player.multi) {
      bullets.push({ x: player.x + 2, y: player.y, w: 4, h: 10, vy: -8.5 });
      bullets.push({
        x: player.x + player.w - 6,
        y: player.y,
        w: 4,
        h: 10,
        vy: -8.5,
      });
    }
  }

  // ---------- UPDATE ----------
  function update() {
    if (state !== "playing" || !player) return;

    // Movimiento jugador
    if (keys["ArrowLeft"] || keys["a"] || keys["A"]) {
      player.x = Math.max(4, player.x - player.speed);
    }
    if (keys["ArrowRight"] || keys["d"] || keys["D"]) {
      player.x = Math.min(W - player.w - 4, player.x + player.speed);
    }
    if (keys[" "] || keys["Spacebar"]) {
      shoot();
    }

    if (shootCooldown > 0) shootCooldown--;
    if (player.shield > 0) player.shield--;
    if (player.rapid > 0) player.rapid--;
    if (invuln > 0) invuln--;
    if (waveClearFlash > 0) waveClearFlash--;

    // Balas jugador
    for (let i = bullets.length - 1; i >= 0; i--) {
      bullets[i].y += bullets[i].vy;
      if (bullets[i].y + bullets[i].h < 0) bullets.splice(i, 1);
    }

    // Movimiento enemigos
    let hitEdge = false;
    for (let i = 0; i < enemies.length; i++) {
      enemies[i].x += enemyDir * enemySpeed;
      if (enemies[i].x <= 8 || enemies[i].x + enemies[i].w >= W - 8) {
        hitEdge = true;
      }
    }
    if (hitEdge && enemies.length > 0) {
      enemyDir *= -1;
      for (let i = 0; i < enemies.length; i++) {
        enemies[i].y += 14;
      }
    }

    // Disparo enemigo
    enemyShootTimer--;
    if (enemyShootTimer <= 0 && enemies.length > 0) {
      // Preferir enemigos de las filas más bajas
      const bottomY = Math.max(...enemies.map((e) => e.y));
      const candidates = enemies.filter((e) => e.y >= bottomY - 5);
      const pool = candidates.length ? candidates : enemies;
      const shooter = pool[Math.floor(Math.random() * pool.length)];
      enemyBullets.push({
        x: shooter.x + shooter.w / 2 - 2,
        y: shooter.y + shooter.h,
        w: 4,
        h: 10,
        vy: 3.2 + level * 0.25,
      });
      enemyShootTimer = Math.max(25, 70 - level * 4);
    }

    for (let i = enemyBullets.length - 1; i >= 0; i--) {
      enemyBullets[i].y += enemyBullets[i].vy;
      if (enemyBullets[i].y > H) enemyBullets.splice(i, 1);
    }

    // Colisión: bala jugador vs enemigo
    for (let bi = bullets.length - 1; bi >= 0; bi--) {
      const b = bullets[bi];
      let hit = false;
      for (let ei = enemies.length - 1; ei >= 0; ei--) {
        const e = enemies[ei];
        if (
          b.x < e.x + e.w &&
          b.x + b.w > e.x &&
          b.y < e.y + e.h &&
          b.y + b.h > e.y
        ) {
          score += e.points;
          spawnExplosion(e.x + e.w / 2, e.y + e.h / 2, e.color, 10);
          // Power-up chance
          if (Math.random() < 0.14) {
            const types = ["shield", "rapid", "multi"];
            powerUps.push({
              x: e.x + 5,
              y: e.y,
              w: 18,
              h: 18,
              type: types[Math.floor(Math.random() * types.length)],
              vy: 1.4,
            });
          }
          enemies.splice(ei, 1);
          bullets.splice(bi, 1);
          hit = true;
          updateHUD();
          break;
        }
      }
      if (hit) continue;
    }

    // Colisión balas vs barreras
    hitBarriers(bullets);
    hitBarriers(enemyBullets);
    barriers = barriers.filter((b) => b.hp > 0);

    // Colisión bala enemiga vs jugador
    if (invuln <= 0) {
      for (let i = enemyBullets.length - 1; i >= 0; i--) {
        const b = enemyBullets[i];
        if (
          b.x < player.x + player.w &&
          b.x + b.w > player.x &&
          b.y < player.y + player.h &&
          b.y + b.h > player.y
        ) {
          enemyBullets.splice(i, 1);
          if (player.shield > 0) {
            player.shield = 0;
            spawnExplosion(player.x + player.w / 2, player.y, "#00FFD1", 8);
          } else {
            lives--;
            invuln = 90;
            spawnExplosion(
              player.x + player.w / 2,
              player.y + player.h / 2,
              "#FF007A",
              14,
            );
            updateHUD();
            if (lives <= 0) {
              endGame(false);
              return;
            }
          }
          break;
        }
      }
    }

    // Enemigos llegan abajo
    for (let i = 0; i < enemies.length; i++) {
      if (enemies[i].y + enemies[i].h >= player.y - 5) {
        endGame(false);
        return;
      }
    }

    // Power-ups
    for (let i = powerUps.length - 1; i >= 0; i--) {
      const p = powerUps[i];
      p.y += p.vy;
      if (p.y > H) {
        powerUps.splice(i, 1);
        continue;
      }
      if (
        p.x < player.x + player.w &&
        p.x + p.w > player.x &&
        p.y < player.y + player.h &&
        p.y + p.h > player.y
      ) {
        if (p.type === "shield") player.shield = 360;
        if (p.type === "rapid") player.rapid = 450;
        if (p.type === "multi") player.multi = true;
        spawnExplosion(p.x + 9, p.y + 9, "#FFD700", 6);
        powerUps.splice(i, 1);
      }
    }

    // Partículas
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.05;
      p.life--;
      if (p.life <= 0) particles.splice(i, 1);
    }

    // Oleada limpia → siguiente nivel
    if (enemies.length === 0) {
      score += 100 * level; // bonus por oleada
      level++;
      enemySpeed = 0.7 + (level - 1) * 0.22;
      enemyDir = 1;
      waveClearFlash = 40;
      spawnEnemies();
      // Regenerar barreras cada 2 niveles
      if (level % 2 === 1) spawnBarriers();
      updateHUD();
    }
  }

  function hitBarriers(list) {
    for (let bi = list.length - 1; bi >= 0; bi--) {
      const b = list[bi];
      for (let bari = barriers.length - 1; bari >= 0; bari--) {
        const bar = barriers[bari];
        if (bar.hp <= 0) continue;
        if (
          b.x < bar.x + bar.w &&
          b.x + b.w > bar.x &&
          b.y < bar.y + bar.h &&
          b.y + b.h > bar.y
        ) {
          bar.hp--;
          list.splice(bi, 1);
          break;
        }
      }
    }
  }

  // ---------- DRAW ----------
  function draw() {
    // Fondo
    ctx.fillStyle = "#0A0F1B";
    ctx.fillRect(0, 0, W, H);

    // Estrellas
    ctx.fillStyle = "rgba(255,255,255,0.35)";
    for (let i = 0; i < 50; i++) {
      const sx = (i * 97 + 13) % W;
      const sy = (i * 53 + 7) % H;
      ctx.fillRect(sx, sy, 1 + (i % 2), 1 + (i % 2));
    }

    // Flash de oleada limpia
    if (waveClearFlash > 0) {
      ctx.fillStyle = `rgba(0,255,209,${(waveClearFlash / 40) * 0.15})`;
      ctx.fillRect(0, 0, W, H);
    }

    if (!player) return;

    // Barreras
    barriers.forEach((b) => {
      const alpha = 0.25 + (b.hp / 3) * 0.55;
      ctx.fillStyle = `rgba(0,255,209,${alpha})`;
      ctx.fillRect(b.x, b.y, b.w, b.h);
    });

    // Enemigos
    enemies.forEach((e) => {
      ctx.save();
      ctx.shadowColor = e.color;
      ctx.shadowBlur = 10;
      ctx.fillStyle = e.color;

      if (e.type === 0) {
        // Cuerpo rectangular con "alas"
        ctx.fillRect(e.x, e.y + 4, e.w, e.h - 4);
        ctx.fillRect(e.x - 3, e.y + 8, 4, 6);
        ctx.fillRect(e.x + e.w - 1, e.y + 8, 4, 6);
      } else if (e.type === 1) {
        // Forma más ancha
        ctx.beginPath();
        ctx.moveTo(e.x + e.w / 2, e.y);
        ctx.lineTo(e.x + e.w + 2, e.y + e.h / 2);
        ctx.lineTo(e.x + e.w / 2, e.y + e.h);
        ctx.lineTo(e.x - 2, e.y + e.h / 2);
        ctx.closePath();
        ctx.fill();
      } else {
        // Alien clásico simplificado
        ctx.fillRect(e.x + 4, e.y, e.w - 8, e.h);
        ctx.fillRect(e.x, e.y + 4, e.w, e.h - 8);
        ctx.fillRect(e.x + 2, e.y + e.h - 2, 4, 4);
        ctx.fillRect(e.x + e.w - 6, e.y + e.h - 2, 4, 4);
      }

      ctx.shadowBlur = 0;
      // Ojos
      ctx.fillStyle = "#0A0F1B";
      ctx.fillRect(e.x + 6, e.y + 6, 5, 5);
      ctx.fillRect(e.x + e.w - 11, e.y + 6, 5, 5);
      ctx.restore();
    });

    // Balas jugador
    ctx.fillStyle = "#00FFD1";
    ctx.shadowColor = "#00FFD1";
    ctx.shadowBlur = 6;
    bullets.forEach((b) => {
      ctx.fillRect(b.x, b.y, b.w, b.h);
    });
    ctx.shadowBlur = 0;

    // Balas enemigas
    ctx.fillStyle = "#FF007A";
    ctx.shadowColor = "#FF007A";
    ctx.shadowBlur = 5;
    enemyBullets.forEach((b) => {
      ctx.fillRect(b.x, b.y, b.w, b.h);
    });
    ctx.shadowBlur = 0;

    // Power-ups
    powerUps.forEach((p) => {
      const col =
        p.type === "shield"
          ? "#00FFD1"
          : p.type === "rapid"
            ? "#FFD700"
            : "#FF007A";
      ctx.fillStyle = col;
      ctx.shadowColor = col;
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(p.x + p.w / 2, p.y + p.h / 2, p.w / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      // Letra
      ctx.fillStyle = "#0A0F1B";
      ctx.font = "bold 10px Orbitron, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      const letter = p.type === "shield" ? "S" : p.type === "rapid" ? "R" : "M";
      ctx.fillText(letter, p.x + p.w / 2, p.y + p.h / 2 + 1);
    });

    // Partículas
    particles.forEach((p) => {
      ctx.globalAlpha = p.life / p.maxLife;
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x, p.y, p.size, p.size);
    });
    ctx.globalAlpha = 1;

    // Jugador (parpadea si invulnerable)
    if (invuln <= 0 || Math.floor(invuln / 6) % 2 === 0) {
      ctx.save();
      // Escudo
      if (player.shield > 0) {
        ctx.strokeStyle = "rgba(0,255,209,0.7)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(
          player.x + player.w / 2,
          player.y + player.h / 2,
          24,
          0,
          Math.PI * 2,
        );
        ctx.stroke();
        ctx.strokeStyle = "rgba(0,255,209,0.3)";
        ctx.beginPath();
        ctx.arc(
          player.x + player.w / 2,
          player.y + player.h / 2,
          28,
          0,
          Math.PI * 2,
        );
        ctx.stroke();
      }

      ctx.fillStyle = "#00FFD1";
      ctx.shadowColor = "#00FFD1";
      ctx.shadowBlur = 14;
      // Nave triangular
      ctx.beginPath();
      ctx.moveTo(player.x + player.w / 2, player.y);
      ctx.lineTo(player.x + player.w, player.y + player.h);
      ctx.lineTo(player.x + player.w / 2, player.y + player.h - 5);
      ctx.lineTo(player.x, player.y + player.h);
      ctx.closePath();
      ctx.fill();
      // Cabina
      ctx.fillStyle = "#E0E0E0";
      ctx.fillRect(player.x + player.w / 2 - 3, player.y + 6, 6, 5);
      ctx.shadowBlur = 0;
      ctx.restore();
    }
  }

  // ---------- GAME FLOW ----------

  function pauseGame() {
    if (state !== "playing") return;
    state = "paused";
    if (pauseScreen) pauseScreen.classList.remove("hidden");
    if (uiHud) uiHud.classList.remove("playing");
  }

  function resumeGame() {
    if (state !== "paused") return;
    state = "playing";
    if (pauseScreen) pauseScreen.classList.add("hidden");
    if (uiHud) uiHud.classList.add("playing");
  }

  function togglePause() {
    if (state === "playing") pauseGame();
    else if (state === "paused") resumeGame();
  }

  function endGame(won) {
    state = "gameover";
    if (pauseScreen) pauseScreen.classList.add("hidden");
    if (uiHud) uiHud.classList.remove("playing");
    if (score > highScore) {
      highScore = score;
      localStorage.setItem("spaceInvadersHi", String(highScore));
      hiEl.textContent = highScore;
    }
    endTitle.textContent = won ? "¡VICTORIA!" : "GAME OVER";
    finalScoreEl.textContent = score;
    gameoverScreen.classList.remove("hidden");
  }

  function startGame() {
    initGame();
    state = "playing";
    startScreen.classList.add("hidden");
    gameoverScreen.classList.add("hidden");
    if (pauseScreen) pauseScreen.classList.add("hidden");
    if (uiHud) uiHud.classList.add("playing");
  }

  function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
  }

  // ---------- CONTROLES ----------
  document.addEventListener("keydown", (e) => {
    keys[e.key] = true;
    if (e.key === "p" || e.key === "P" || e.key === "Escape") {
      e.preventDefault();
      togglePause();
      return;
    }
    if (e.code === "Space" || e.key === " ") {
      e.preventDefault();
      keys[" "] = true;
      if (state === "start" || state === "gameover") startGame();
      else if (state === "paused") resumeGame();
      else shoot();
    }
    if (
      (e.key === "Enter" || e.key === "r" || e.key === "R") &&
      state === "gameover"
    ) {
      startGame();
    }
  });

  document.addEventListener("keyup", (e) => {
    keys[e.key] = false;
    if (e.code === "Space" || e.key === " ") keys[" "] = false;
  });

  // Touch / pointer
  let dragging = false;
  canvas.addEventListener("pointerdown", (e) => {
    e.preventDefault();
    if (state === "start" || state === "gameover") {
      startGame();
      return;
    }
    if (state !== "playing" || !player) return;
    dragging = true;
    shoot();
    moveToPointer(e);
  });

  canvas.addEventListener("pointermove", (e) => {
    if (!dragging || state !== "playing" || !player) return;
    moveToPointer(e);
  });

  canvas.addEventListener("pointerup", () => {
    dragging = false;
  });
  canvas.addEventListener("pointerleave", () => {
    dragging = false;
  });

  function moveToPointer(e) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = W / rect.width;
    const tx = (e.clientX - rect.left) * scaleX;
    player.x = Math.max(4, Math.min(W - player.w - 4, tx - player.w / 2));
  }

  startBtn.addEventListener("click", startGame);
  restartBtn.addEventListener("click", startGame);
  if (resumeBtn) resumeBtn.addEventListener("click", resumeGame);
  if (pauseRestartBtn) pauseRestartBtn.addEventListener("click", startGame);
  if (pauseBtn)
    pauseBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      togglePause();
    });

  // Resize
  function fit() {
    const s = Math.min(window.innerWidth / W, window.innerHeight / H) * 0.96;
    canvas.style.width = Math.floor(W * s) + "px";
    canvas.style.height = Math.floor(H * s) + "px";
  }
  window.addEventListener("resize", fit);
  fit();

  // Arranque: dibujar fondo vacío hasta que inicie
  loop();
})();
