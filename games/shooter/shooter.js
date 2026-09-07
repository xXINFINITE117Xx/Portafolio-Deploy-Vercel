(function () {
  "use strict";
  var canvas = document.getElementById("game");
  var ctx = canvas.getContext("2d");
  var W = canvas.width,
    H = canvas.height;
  var running = false,
    paused = false;
  var score = 0,
    lives = 3,
    level = 1;
  var player = { x: W / 2, y: H - 50, w: 36, h: 24, speed: 5 };
  var bullets = [],
    enemies = [],
    particles = [];
  var keys = {};
  var fireCd = 0,
    spawnT = 0;

  function reset() {
    score = 0;
    lives = 3;
    level = 1;
    player.x = W / 2;
    bullets = [];
    enemies = [];
    particles = [];
    fireCd = 0;
    spawnT = 0;
    updateHud();
  }
  function updateHud() {
    document.getElementById("score").textContent = score;
    document.getElementById("lives").textContent = lives;
    document.getElementById("level").textContent = level;
  }
  function burst(x, y, color) {
    for (var i = 0; i < 10; i++) {
      particles.push({
        x: x,
        y: y,
        vx: (Math.random() - 0.5) * 4,
        vy: (Math.random() - 0.5) * 4,
        life: 30 + Math.random() * 20,
        color: color,
      });
    }
  }
  function fire() {
    if (fireCd > 0 || !running || paused) return;
    bullets.push({ x: player.x, y: player.y - 12, vy: -8 });
    fireCd = 12;
  }
  function spawnEnemy() {
    var type = Math.random() < 0.2 ? 2 : 1;
    enemies.push({
      x: 30 + Math.random() * (W - 60),
      y: -20,
      w: type === 2 ? 34 : 26,
      h: type === 2 ? 28 : 22,
      vy: 1.2 + level * 0.25 + Math.random() * 0.8,
      hp: type,
      type: type,
    });
  }

  function update() {
    if (!running || paused) return;
    if (keys.ArrowLeft || keys.a || keys.A || keys._left)
      player.x -= player.speed;
    if (keys.ArrowRight || keys.d || keys.D || keys._right)
      player.x += player.speed;
    if (keys[" "] || keys._fire) fire();
    player.x = Math.max(player.w / 2, Math.min(W - player.w / 2, player.x));
    if (fireCd > 0) fireCd--;

    spawnT--;
    if (spawnT <= 0) {
      spawnEnemy();
      spawnT = Math.max(18, 45 - level * 3);
    }

    bullets.forEach(function (b) {
      b.y += b.vy;
    });
    bullets = bullets.filter(function (b) {
      return b.y > -10;
    });

    enemies.forEach(function (e) {
      e.y += e.vy;
    });
    for (var i = enemies.length - 1; i >= 0; i--) {
      var e = enemies[i];
      if (e.y > H + 20) {
        enemies.splice(i, 1);
        lives--;
        updateHud();
        if (lives <= 0) gameOver();
        continue;
      }
      // hit player
      if (
        Math.abs(e.x - player.x) < (e.w + player.w) / 2 &&
        Math.abs(e.y - player.y) < (e.h + player.h) / 2
      ) {
        burst(e.x, e.y, "#ff007a");
        enemies.splice(i, 1);
        lives--;
        updateHud();
        if (lives <= 0) gameOver();
        continue;
      }
      for (var j = bullets.length - 1; j >= 0; j--) {
        var b = bullets[j];
        if (Math.abs(b.x - e.x) < e.w / 2 && Math.abs(b.y - e.y) < e.h / 2) {
          bullets.splice(j, 1);
          e.hp--;
          burst(e.x, e.y, e.type === 2 ? "#ff007a" : "#00ffd1");
          if (e.hp <= 0) {
            enemies.splice(i, 1);
            score += e.type === 2 ? 30 : 10;
            if (score > 0 && score % 150 === 0) level++;
            updateHud();
          }
          break;
        }
      }
    }

    particles.forEach(function (p) {
      p.x += p.vx;
      p.y += p.vy;
      p.life--;
    });
    particles = particles.filter(function (p) {
      return p.life > 0;
    });
  }

  function draw() {
    ctx.fillStyle = "#070b16";
    ctx.fillRect(0, 0, W, H);
    // stars
    ctx.fillStyle = "rgba(0,255,209,0.25)";
    for (var i = 0; i < 40; i++) {
      var sx = (i * 97) % W;
      var sy = (i * 53 + Date.now() / 30) % H;
      ctx.fillRect(sx, sy, 2, 2);
    }
    // player
    ctx.save();
    ctx.translate(player.x, player.y);
    ctx.fillStyle = "#00ffd1";
    ctx.shadowColor = "#00ffd1";
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.moveTo(0, -player.h / 2);
    ctx.lineTo(player.w / 2, player.h / 2);
    ctx.lineTo(0, player.h / 4);
    ctx.lineTo(-player.w / 2, player.h / 2);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // bullets
    ctx.fillStyle = "#ff007a";
    ctx.shadowColor = "#ff007a";
    ctx.shadowBlur = 8;
    bullets.forEach(function (b) {
      ctx.fillRect(b.x - 2, b.y - 8, 4, 12);
    });

    // enemies
    enemies.forEach(function (e) {
      ctx.shadowColor = e.type === 2 ? "#ff007a" : "#00ffd1";
      ctx.shadowBlur = 10;
      ctx.fillStyle = e.type === 2 ? "#ff007a" : "#00ffd1";
      ctx.fillRect(e.x - e.w / 2, e.y - e.h / 2, e.w, e.h);
      ctx.fillStyle = "#050814";
      ctx.fillRect(e.x - 4, e.y - 3, 8, 6);
    });

    particles.forEach(function (p) {
      ctx.globalAlpha = p.life / 40;
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x, p.y, 3, 3);
      ctx.globalAlpha = 1;
    });

    if (paused && running) {
      ctx.fillStyle = "rgba(5,8,15,0.55)";
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = "#00ffd1";
      ctx.font = "bold 28px Orbitron";
      ctx.textAlign = "center";
      ctx.fillText("PAUSA", W / 2, H / 2);
    }
  }

  function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
  }
  function gameOver() {
    running = false;
    document.getElementById("overlay").classList.remove("hidden");
    document.getElementById("ov-title").textContent = "GAME OVER";
    document.getElementById("ov-msg").textContent =
      "Score: " + score + " · Nivel " + level;
    document.getElementById("btn-start").textContent = "REINTENTAR";
  }
  function start() {
    reset();
    running = true;
    paused = false;
    document.getElementById("overlay").classList.add("hidden");
  }

  document.addEventListener("keydown", function (e) {
    keys[e.key] = true;
    if (e.key === "p" || e.key === "P" || e.key === "Escape") {
      if (running) paused = !paused;
    }
    if (e.key === " ") e.preventDefault();
  });
  document.addEventListener("keyup", function (e) {
    keys[e.key] = false;
  });

  function bindHold(id, key) {
    var el = document.getElementById(id);
    var on = function (e) {
      e.preventDefault();
      keys[key] = true;
    };
    var off = function (e) {
      e.preventDefault();
      keys[key] = false;
    };
    el.addEventListener("touchstart", on, { passive: false });
    el.addEventListener("touchend", off);
    el.addEventListener("mousedown", on);
    el.addEventListener("mouseup", off);
    el.addEventListener("mouseleave", off);
  }
  bindHold("btn-left", "_left");
  bindHold("btn-right", "_right");
  bindHold("btn-fire", "_fire");

  document.getElementById("btn-start").onclick = start;
  document.getElementById("btn-pause").onclick = function () {
    if (running) paused = !paused;
  };

  // resize canvas display
  function fit() {
    var wrap = canvas.parentElement;
    var maxW = Math.min(480, wrap.clientWidth);
    canvas.style.width = maxW + "px";
  }
  addEventListener("resize", fit);
  fit();
  loop();
})();
