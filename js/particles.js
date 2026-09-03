(function () {
  const canvas = document.getElementById("particles-canvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  let particles = [];
  let comets = [];
  let mouse = { x: null, y: null, radius: 180, isActive: false };
  let animationId;
  let time = 0;

  const isMobile = window.innerWidth < 768;
  const PARTICLE_COUNT = Math.min(
    isMobile ? 45 : 110,
    Math.floor(
      (window.innerWidth * window.innerHeight) / (isMobile ? 20000 : 9000),
    ),
  );

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  class Particle {
    constructor() {
      this.reset(true);
    }

    reset(initial = false) {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.z = Math.random() * 2 + 0.5; // profundidad para parallax
      this.baseSize = Math.random() * 2.5 + 0.5;
      this.size = this.baseSize;
      this.speedX = (Math.random() - 0.5) * 0.8;
      this.speedY = (Math.random() - 0.5) * 0.8;

      const r = Math.random();
      if (r > 0.6) {
        this.color = "0, 255, 209"; // cyan
        this.glow = "0, 255, 209";
      } else if (r > 0.3) {
        this.color = "255, 0, 122"; // pink
        this.glow = "255, 0, 122";
      } else {
        this.color = "123, 97, 255"; // purple
        this.glow = "180, 120, 255";
      }

      this.opacity = Math.random() * 0.6 + 0.3;
      this.pulseSpeed = Math.random() * 0.03 + 0.01;
      this.pulseOffset = Math.random() * Math.PI * 10;
      this.driftX = (Math.random() - 0.5) * 0.015;
      this.driftY = (Math.random() - 0.5) * 0.015;
    }

    update() {
      this.x += this.speedX + Math.sin(time * 0.3 + this.pulseOffset) * 0.3;
      this.y += this.speedY + Math.cos(time * 0.3 + this.pulseOffset) * 0.3;

      // Respiración continua
      const pulse = Math.sin(time * this.pulseSpeed * 60 + this.pulseOffset);
      this.size = (this.baseSize * (1 + pulse * 0.5)) / this.z;
      this.currentOpacity = this.opacity + pulse * 0.25;

      // Movimiento orgánico infinito
      this.speedX += this.driftX;
      this.speedY += this.driftY;
      this.speedX = Math.max(-1.2, Math.min(1.2, this.speedX));
      this.speedY = Math.max(-1.2, Math.min(1.2, this.speedY));

      // Rebote elástico en bordes (nunca desaparece)
      if (this.x < 0) {
        this.x = 0;
        this.speedX *= -1;
      }
      if (this.x > canvas.width) {
        this.x = canvas.width;
        this.speedX *= -1;
      }
      if (this.y < 0) {
        this.y = 0;
        this.speedY *= -1;
      }
      if (this.y > canvas.height) {
        this.y = canvas.height;
        this.speedY *= -1;
      }

      // Interacción mouse - siempre activo, sin congelar
      if (mouse.isActive) {
        const dx = this.x - mouse.x;
        const dy = this.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < mouse.radius) {
          const force = (mouse.radius - dist) / mouse.radius;
          if (dist < mouse.radius * 0.35) {
            this.x += (dx / dist) * force * 3;
            this.y += (dy / dist) * force * 3;
            this.size = this.baseSize * (2.2 / this.z);
          } else {
            this.x -= (dx / dist) * force * 0.6;
            this.y -= (dy / dist) * force * 0.6;
          }
        }
      }
    }

    draw() {
      // Halo
      const gradient = ctx.createRadialGradient(
        this.x,
        this.y,
        0,
        this.x,
        this.y,
        this.size * 4,
      );
      gradient.addColorStop(0, `rgba(${this.glow}, ${this.currentOpacity})`);
      gradient.addColorStop(
        0.3,
        `rgba(${this.glow}, ${this.currentOpacity * 0.15})`,
      );
      gradient.addColorStop(1, `rgba(${this.glow}, 0)`);

      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size * 4, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();

      // Núcleo
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${this.color}, ${this.currentOpacity})`;
      ctx.fill();

      // Brillo central blanco (efecto lente)
      if (this.size > 1.5) {
        ctx.beginPath();
        ctx.arc(
          this.x - this.size * 0.2,
          this.y - this.size * 0.2,
          this.size * 0.3,
          0,
          Math.PI * 2,
        );
        ctx.fillStyle = `rgba(255,255,255, ${this.currentOpacity * 0.8})`;
        ctx.fill();
      }
    }
  }

  // COMETAS CYBERPUNK
  class Comet {
    constructor() {
      this.reset();
    }
    reset() {
      this.x = -50;
      this.y = Math.random() * canvas.height * 0.6;
      this.speedX = Math.random() * 3 + 2.5;
      this.speedY = (Math.random() - 0.5) * 0.5;
      this.size = Math.random() * 1.5 + 1;
      this.opacity = 0;
      this.life = 0;
      this.maxLife = Math.random() * 200 + 200;
      this.active = Math.random() > 0.7;
    }
    update() {
      if (!this.active) {
        if (Math.random() > 0.998) this.active = true;
        return;
      }
      this.life++;
      this.x += this.speedX;
      this.y += this.speedY;

      if (this.life < 30) this.opacity = this.life / 30;
      else if (this.life > this.maxLife - 30)
        this.opacity = (this.maxLife - this.life) / 30;
      else this.opacity = 1;

      if (this.x > canvas.width + 100 || this.life > this.maxLife) {
        this.reset();
      }
    }
    draw() {
      if (!this.active || this.opacity <= 0) return;
      const trail = 12;
      for (let i = 0; i < trail; i++) {
        const alpha = this.opacity * (1 - i / trail) * 0.15;
        ctx.beginPath();
        ctx.arc(
          this.x - i * this.speedX * 0.6,
          this.y - i * this.speedY * 0.6,
          this.size * (1 - i * 0.05),
          0,
          Math.PI * 2,
        );
        ctx.fillStyle = `rgba(0, 255, 209, ${alpha})`;
        ctx.fill();
      }
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255, ${this.opacity})`;
      ctx.fill();
    }
  }

  function init() {
    particles = [];
    comets = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) particles.push(new Particle());
    for (let i = 0; i < (isMobile ? 1 : 3); i++) comets.push(new Comet());
  }

  function connect() {
    const maxDist = isMobile ? 110 : 160;
    ctx.lineCap = "round";

    for (let i = 0; i < particles.length; i++) {
      // Conexión partículas-partículas
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < maxDist) {
          const opacity = Math.pow(1 - dist / maxDist, 2) * 0.22;
          const mixed = particles[i].color !== particles[j].color;
          ctx.strokeStyle = mixed
            ? `rgba(150, 100, 255, ${opacity})`
            : `rgba(${particles[i].color}, ${opacity})`;
          ctx.lineWidth = opacity * 1.8;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          const mx = (particles[i].x + particles[j].x) / 2;
          const my = (particles[i].y + particles[j].y) / 2;
          const off = Math.sin(time + i * 0.5) * 4;
          ctx.quadraticCurveTo(
            mx + off,
            my + off,
            particles[j].x,
            particles[j].y,
          );
          ctx.stroke();
        }
      }
      // Conexión al mouse - efecto red neural
      if (mouse.isActive) {
        const dx = particles[i].x - mouse.x;
        const dy = particles[i].y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < mouse.radius) {
          const opacity = (1 - dist / mouse.radius) * 0.45;
          ctx.strokeStyle = `rgba(${particles[i].color}, ${opacity})`;
          ctx.lineWidth = 0.9;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.stroke();

          // Anillo alrededor del mouse
          if (i % 8 === 0) {
            ctx.beginPath();
            ctx.arc(mouse.x, mouse.y, dist, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(${particles[i].color}, ${opacity * 0.08})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
    }
  }

  function animate() {
    time += 0.016;
    // Rastro sutil para que nunca se vea congelado, siempre con movimiento
    ctx.fillStyle = "rgba(10, 15, 27, 0.14)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    particles.forEach((p) => {
      p.update();
      p.draw();
    });
    comets.forEach((c) => {
      c.update();
      c.draw();
    });
    connect();

    animationId = requestAnimationFrame(animate);
  }

  // Resize con debounce
  let resizeTimeout;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      resize();
      init();
    }, 150);
  });

  window.addEventListener("mousemove", (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    mouse.isActive = true;
  });

  window.addEventListener("mouseleave", () => {
    mouse.isActive = false;
  });

  window.addEventListener(
    "touchmove",
    (e) => {
      if (e.touches[0]) {
        mouse.x = e.touches[0].clientX;
        mouse.y = e.touches[0].clientY;
        mouse.isActive = true;
      }
    },
    { passive: true },
  );

  window.addEventListener("touchend", () => {
    mouse.isActive = false;
  });

  resize();
  init();
  animate();
})();
