(function () {
  "use strict";

  let enabled = localStorage.getItem("portfolio_sound") === "1";
  let ctx = null;
  let lastHover = 0;

  function getCtx() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
    }
    if (ctx.state === "suspended") ctx.resume();
    return ctx;
  }

  /** Click tipo teclado mecánico */
  function playClick() {
    if (!enabled) return;
    const ac = getCtx();
    if (!ac) return;

    const t = ac.currentTime;
    // Ruido corto
    const bufferSize = ac.sampleRate * 0.04;
    const buffer = ac.createBuffer(1, bufferSize, ac.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.15));
    }
    const noise = ac.createBufferSource();
    noise.buffer = buffer;
    const noiseFilter = ac.createBiquadFilter();
    noiseFilter.type = "bandpass";
    noiseFilter.frequency.value = 2500;
    noiseFilter.Q.value = 1.2;
    const noiseGain = ac.createGain();
    noiseGain.gain.setValueAtTime(0.35, t);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);
    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(ac.destination);
    noise.start(t);
    noise.stop(t + 0.05);

    // Tono percusivo
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = "square";
    osc.frequency.setValueAtTime(180 + Math.random() * 40, t);
    osc.frequency.exponentialRampToValueAtTime(60, t + 0.03);
    gain.gain.setValueAtTime(0.12, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
    osc.connect(gain);
    gain.connect(ac.destination);
    osc.start(t);
    osc.stop(t + 0.06);
  }

  /** Glitch sutil al hover */
  function playGlitch() {
    if (!enabled) return;
    const now = performance.now();
    if (now - lastHover < 80) return; // throttle
    lastHover = now;

    const ac = getCtx();
    if (!ac) return;
    const t = ac.currentTime;

    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = "sawtooth";
    const f = 400 + Math.random() * 800;
    osc.frequency.setValueAtTime(f, t);
    osc.frequency.linearRampToValueAtTime(f * (0.5 + Math.random()), t + 0.04);
    gain.gain.setValueAtTime(0.04, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
    const filter = ac.createBiquadFilter();
    filter.type = "highpass";
    filter.frequency.value = 600;
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ac.destination);
    osc.start(t);
    osc.stop(t + 0.055);
  }

  function setEnabled(on) {
    enabled = !!on;
    localStorage.setItem("portfolio_sound", enabled ? "1" : "0");
    updateUI();
    if (enabled) {
      getCtx();
      playClick();
    }
  }

  function updateUI() {
    const btn = document.getElementById("sound-toggle");
    const icon = document.getElementById("sound-icon");
    if (!btn || !icon) return;
    btn.setAttribute("aria-pressed", enabled ? "true" : "false");
    btn.classList.toggle("active", enabled);
    icon.className = enabled ? "fas fa-volume-up" : "fas fa-volume-mute";
    btn.setAttribute(
      "aria-label",
      enabled ? "Desactivar sonidos" : "Activar sonidos",
    );
    btn.title = enabled ? "Sonido ON" : "Sonido OFF";
  }

  function bindHovers() {
    const selector =
      "a, button, .filter-btn, .skill-card, .service-card, .project-card, .faq-question, .cert-card, .ctrl-btn";
    document.querySelectorAll(selector).forEach((el) => {
      el.addEventListener("mouseenter", playGlitch, { passive: true });
    });
    document.addEventListener(
      "click",
      (e) => {
        if (!enabled) return;
        if (
          e.target.closest("a, button, .filter-btn, .ctrl-btn, .faq-question")
        ) {
          playClick();
        }
      },
      true,
    );
  }

  document.addEventListener("DOMContentLoaded", () => {
    updateUI();
    const btn = document.getElementById("sound-toggle");
    if (btn) {
      btn.addEventListener("click", () => setEnabled(!enabled));
    }
    bindHovers();
  });

  window.PortfolioSound = {
    playClick,
    playGlitch,
    setEnabled,
    get enabled() {
      return enabled;
    },
  };
})();
