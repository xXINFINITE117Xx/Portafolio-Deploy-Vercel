// js/ambient.js - v5 FINAL - Fix real del bug de silencio
// Unifica sound.js + ambient - respeta recarga - sin repetición
(function () {
  "use strict";

  let ambientCtx = null;
  let ambientMaster = null;
  let voices = [];
  let lfoTimer = null;
  let shimmerTimer = null;
  let isAmbientOn = false;
  let hasInteracted = false;

  // --- Estado único - la misma key que tu sound.js ---
  let enabled = localStorage.getItem("portfolio_sound") === "1";

  function getAmbientCtx() {
    if (ambientCtx) return ambientCtx;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ambientCtx = new AC();
    ambientMaster = ambientCtx.createGain();
    ambientMaster.gain.value = 0;
    const comp = ambientCtx.createDynamicsCompressor();
    comp.threshold.value = -22;
    comp.ratio.value = 2.5;
    ambientMaster.connect(comp);
    comp.connect(ambientCtx.destination);
    return ambientCtx;
  }

  // --- Sonidos UI (copia exacta de tu sound.js para no romper) ---
  let uiCtx = null;
  let lastHover = 0;
  function getUiCtx() {
    if (!uiCtx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      uiCtx = new AC();
    }
    if (uiCtx.state === "suspended") uiCtx.resume();
    return uiCtx;
  }
  function playClick() {
    if (!enabled) return;
    const ac = getUiCtx();
    if (!ac) return;
    const t = ac.currentTime;
    const bufferSize = ac.sampleRate * 0.04;
    const buffer = ac.createBuffer(1, bufferSize, ac.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++)
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.15));
    const noise = ac.createBufferSource();
    noise.buffer = buffer;
    const nf = ac.createBiquadFilter();
    nf.type = "bandpass";
    nf.frequency.value = 2500;
    nf.Q.value = 1.2;
    const ng = ac.createGain();
    ng.gain.setValueAtTime(0.35, t);
    ng.gain.exponentialRampToValueAtTime(0.001, t + 0.04);
    noise.connect(nf);
    nf.connect(ng);
    ng.connect(ac.destination);
    noise.start(t);
    noise.stop(t + 0.05);
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
  function playGlitch() {
    if (!enabled) return;
    const now = performance.now();
    if (now - lastHover < 80) return;
    lastHover = now;
    const ac = getUiCtx();
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

  // --- Ambient evolutivo ---
  function createVoice(baseFreq, vol) {
    const o1 = ambientCtx.createOscillator(),
      o2 = ambientCtx.createOscillator(),
      o3 = ambientCtx.createOscillator();
    const gain = ambientCtx.createGain(),
      filter = ambientCtx.createBiquadFilter();
    const lfo = ambientCtx.createOscillator(),
      lfoGain = ambientCtx.createGain();
    o1.type = "sine";
    o2.type = "triangle";
    o3.type = "sine";
    o1.frequency.value = baseFreq;
    o2.frequency.value = baseFreq * 1.0057;
    o3.frequency.value = baseFreq * 0.4983;
    lfo.type = "sine";
    lfo.frequency.value = 0.012 + Math.random() * 0.06;
    lfoGain.gain.value = baseFreq * 0.011;
    lfo.connect(lfoGain);
    lfoGain.connect(o1.frequency);
    lfoGain.connect(o2.frequency);
    filter.type = "lowpass";
    filter.frequency.value = 750 + Math.random() * 600;
    filter.Q.value = 0.5;
    gain.gain.value = 0;
    o1.connect(filter);
    o2.connect(filter);
    o3.connect(filter);
    filter.connect(gain);
    gain.connect(ambientMaster);
    o1.start();
    o2.start();
    o3.start();
    lfo.start();
    return {
      o1,
      o2,
      o3,
      lfo,
      gain,
      filter,
      baseFreq,
      baseVol: vol,
      baseFilter: filter.frequency.value,
    };
  }
  function spawnShimmer() {
    if (!ambientCtx || !isAmbientOn) return;
    const osc = ambientCtx.createOscillator(),
      g = ambientCtx.createGain(),
      f = ambientCtx.createBiquadFilter();
    const freq = 850 + Math.random() * 1600;
    osc.type = "sine";
    osc.frequency.value = freq;
    f.type = "bandpass";
    f.frequency.value = freq;
    f.Q.value = 11 + Math.random() * 5;
    g.gain.value = 0;
    osc.connect(f);
    f.connect(g);
    g.connect(ambientMaster);
    osc.start();
    const now = ambientCtx.currentTime;
    g.gain.linearRampToValueAtTime(0, now);
    g.gain.linearRampToValueAtTime(
      0.025 + Math.random() * 0.035,
      now + 0.6 + Math.random(),
    );
    g.gain.linearRampToValueAtTime(0, now + 2.5 + Math.random() * 1.5);
    setTimeout(() => {
      try {
        osc.stop();
      } catch {}
    }, 6000);
  }
  function playAmbient() {
    if (isAmbientOn) return;
    if (!getAmbientCtx()) return;
    if (ambientCtx.state === "suspended") ambientCtx.resume();
    voices = [
      createVoice(65.41, 0.15),
      createVoice(98.0, 0.11),
      createVoice(155.56, 0.075),
      createVoice(220.0, 0.04),
    ];
    const now = ambientCtx.currentTime;
    voices.forEach((v, i) =>
      v.gain.gain.linearRampToValueAtTime(v.baseVol, now + 1.2 + i * 0.35),
    );
    ambientMaster.gain.linearRampToValueAtTime(0.13, now + 3);
    lfoTimer = setInterval(() => {
      if (!isAmbientOn) return;
      voices.forEach((v) => {
        const drift = Math.sin(Date.now() * 0.00015 + v.baseFreq) * 320;
        v.filter.frequency.linearRampToValueAtTime(
          v.baseFilter + drift,
          ambientCtx.currentTime + 4.5,
        );
        const breath = 0.8 + Math.sin(Date.now() * 0.00022 + v.baseFreq) * 0.2;
        v.gain.gain.linearRampToValueAtTime(
          v.baseVol * breath,
          ambientCtx.currentTime + 3,
        );
      });
    }, 3200);
    shimmerTimer = setInterval(spawnShimmer, 1100 + Math.random() * 2000);
    isAmbientOn = true;
  }
  function stopAmbient() {
    if (!ambientCtx) {
      isAmbientOn = false;
      return;
    }
    clearInterval(lfoTimer);
    clearInterval(shimmerTimer);
    const now = ambientCtx.currentTime;
    if (ambientMaster) ambientMaster.gain.linearRampToValueAtTime(0, now + 0.6);
    voices.forEach((v) => {
      try {
        v.gain.gain.linearRampToValueAtTime(0, now + 0.5);
      } catch {}
    });
    setTimeout(() => {
      voices.forEach((v) => {
        try {
          v.o1.stop();
          v.o2.stop();
          v.o3.stop();
          v.lfo.stop();
        } catch {}
      });
      voices = [];
      isAmbientOn = false;
    }, 800);
  }

  // --- Control único del botón ---
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

  function setEnabled(on) {
    enabled = !!on;
    localStorage.setItem("portfolio_sound", enabled ? "1" : "0");
    updateUI();
    if (enabled) {
      getUiCtx();
      getAmbientCtx();
      playClick();
      if (hasInteracted) playAmbient();
    } else {
      stopAmbient();
    }
    // Actualiza el objeto global de tu sound.js para que no se desincronice
    if (window.PortfolioSound) window.PortfolioSound._enabled = enabled;
  }

  function bind() {
    const btn = document.getElementById("sound-toggle");
    if (!btn) return;

    // FIX DEL BUG: Clona el botón para matar los listeners viejos de sound.js que causaban que no se silenciara
    const clone = btn.cloneNode(true);
    btn.parentNode.replaceChild(clone, btn);
    const finalBtn = document.getElementById("sound-toggle");

    finalBtn.addEventListener("click", () => {
      hasInteracted = true;
      setEnabled(!enabled);
    });

    // Hover glitch
    const selector =
      "a, button,.filter-btn,.skill-card,.service-card,.project-card,.faq-question,.cert-card,.ctrl-btn";
    document.querySelectorAll(selector).forEach((el) => {
      el.addEventListener("mouseenter", playGlitch, { passive: true });
    });
    document.addEventListener(
      "click",
      (e) => {
        if (!enabled) return;
        if (e.target.closest("a, button,.filter-btn,.ctrl-btn,.faq-question"))
          playClick();
      },
      true,
    );

    // Respeta recarga
    updateUI();
    if (enabled) {
      // Chrome bloquea autoplay, espera primera interacción
      const unlock = () => {
        hasInteracted = true;
        if (enabled) playAmbient();
        window.removeEventListener("click", unlock);
        window.removeEventListener("keydown", unlock);
        window.removeEventListener("touchstart", unlock);
      };
      window.addEventListener("click", unlock, { once: true });
      window.addEventListener("keydown", unlock, { once: true });
      window.addEventListener("touchstart", unlock, { once: true });
    }
  }

  // Espera a que tu sound.js haya cargado y luego toma el control
  function init() {
    // Si sound.js ya definió PortfolioSound, sincroniza enabled con él
    if (
      window.PortfolioSound &&
      typeof window.PortfolioSound.enabled !== "undefined"
    ) {
      enabled = window.PortfolioSound.enabled;
    }
    bind();
    // Sobrescribe el objeto global para que todo apunte a nuestra lógica
    window.PortfolioSound = {
      playClick,
      playGlitch,
      setEnabled,
      get enabled() {
        return enabled;
      },
      _enabled: enabled,
      mute: () => setEnabled(false),
      unmute: () => setEnabled(true),
    };
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
