/**
 * ambient.js — v7 GALAXY SOFT
 * Ambient espacial suave, lento y no repetitivo + UI click/glitch.
 * Volumen bajo · evolución aleatoria · sensación relajante de galaxia.
 */
(function () {
  "use strict";

  var STORAGE_KEY = "portfolio_sound";
  var enabled = localStorage.getItem(STORAGE_KEY) === "1";
  var hasInteracted = false;

  var uiCtx = null;
  var ambientCtx = null;
  var ambientMaster = null;
  var reverbBus = null;
  var isAmbientOn = false;
  var voices = [];
  var timers = [];
  var lastHover = 0;

  // Volumen maestro bajo (relajante)
  var MASTER_TARGET = 0.18;

  function getUiCtx() {
    if (!uiCtx) {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      uiCtx = new AC();
    }
    if (uiCtx.state === "suspended") uiCtx.resume().catch(function () {});
    return uiCtx;
  }

  function getAmbientCtx() {
    if (ambientCtx) return ambientCtx;
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ambientCtx = new AC();

    ambientMaster = ambientCtx.createGain();
    ambientMaster.gain.value = 0;

    var comp = ambientCtx.createDynamicsCompressor();
    comp.threshold.value = -32;
    comp.knee.value = 20;
    comp.ratio.value = 1.8;
    comp.attack.value = 0.08;
    comp.release.value = 0.5;

    // Reverb espacial suave (pocos delays, poca realimentación)
    reverbBus = ambientCtx.createGain();
    reverbBus.gain.value = 0.32;
    [0.27, 0.43, 0.61].forEach(function (d, i) {
      var delay = ambientCtx.createDelay(1.0);
      delay.delayTime.value = d;
      var fb = ambientCtx.createGain();
      fb.gain.value = 0.18 - i * 0.04;
      var lp = ambientCtx.createBiquadFilter();
      lp.type = "lowpass";
      lp.frequency.value = 1600 - i * 280;
      delay.connect(fb);
      fb.connect(lp);
      lp.connect(delay);
      reverbBus.connect(delay);
      delay.connect(ambientMaster);
    });

    ambientMaster.connect(comp);
    comp.connect(ambientCtx.destination);
    return ambientCtx;
  }

  // ——— UI sounds (suaves) ———
  function playClick() {
    if (!enabled) return;
    var ac = getUiCtx();
    if (!ac) return;
    var t = ac.currentTime;
    var bufferSize = Math.floor(ac.sampleRate * 0.03);
    var buffer = ac.createBuffer(1, bufferSize, ac.sampleRate);
    var data = buffer.getChannelData(0);
    for (var i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.18));
    }
    var noise = ac.createBufferSource();
    noise.buffer = buffer;
    var nf = ac.createBiquadFilter();
    nf.type = "bandpass";
    nf.frequency.value = 2200;
    nf.Q.value = 1.1;
    var ng = ac.createGain();
    ng.gain.setValueAtTime(0.22, t);
    ng.gain.exponentialRampToValueAtTime(0.001, t + 0.035);
    noise.connect(nf);
    nf.connect(ng);
    ng.connect(ac.destination);
    noise.start(t);
    noise.stop(t + 0.04);

    var osc = ac.createOscillator();
    var gain = ac.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(160 + Math.random() * 30, t);
    osc.frequency.exponentialRampToValueAtTime(55, t + 0.04);
    gain.gain.setValueAtTime(0.07, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
    osc.connect(gain);
    gain.connect(ac.destination);
    osc.start(t);
    osc.stop(t + 0.055);
  }

  function playGlitch() {
    if (!enabled) return;
    var now = performance.now();
    if (now - lastHover < 100) return;
    lastHover = now;
    var ac = getUiCtx();
    if (!ac) return;
    var t = ac.currentTime;
    var osc = ac.createOscillator();
    var gain = ac.createGain();
    var filter = ac.createBiquadFilter();
    osc.type = "sine";
    var f = 500 + Math.random() * 600;
    osc.frequency.setValueAtTime(f, t);
    osc.frequency.linearRampToValueAtTime(f * 0.7, t + 0.05);
    filter.type = "highpass";
    filter.frequency.value = 500;
    gain.gain.setValueAtTime(0.022, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.06);
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ac.destination);
    osc.start(t);
    osc.stop(t + 0.065);
  }

  // ——— Capas de galaxia (volumen bajo) ———

  function createDeepDrone(freq, vol) {
    var o1 = ambientCtx.createOscillator();
    var o2 = ambientCtx.createOscillator();
    var o3 = ambientCtx.createOscillator();
    var gain = ambientCtx.createGain();
    var filter = ambientCtx.createBiquadFilter();
    var lfo = ambientCtx.createOscillator();
    var lfoGain = ambientCtx.createGain();

    o1.type = "sine";
    o2.type = "sine";
    o3.type = "sine";
    o1.frequency.value = freq;
    o2.frequency.value = freq * 1.0015;
    o3.frequency.value = freq * 0.5;

    lfo.type = "sine";
    lfo.frequency.value = 0.006 + Math.random() * 0.012;
    lfoGain.gain.value = freq * 0.004;
    lfo.connect(lfoGain);
    lfoGain.connect(o1.frequency);
    lfoGain.connect(o2.frequency);

    filter.type = "lowpass";
    filter.frequency.value = 220 + Math.random() * 100;
    filter.Q.value = 0.3;

    gain.gain.value = 0;
    o1.connect(filter);
    o2.connect(filter);
    o3.connect(filter);
    filter.connect(gain);
    gain.connect(ambientMaster);
    gain.connect(reverbBus);

    o1.start();
    o2.start();
    o3.start();
    lfo.start();

    return {
      nodes: [o1, o2, o3, lfo],
      gain: gain,
      filter: filter,
      baseVol: vol,
      baseFilter: filter.frequency.value,
      kind: "drone",
      phase: Math.random() * Math.PI * 2,
    };
  }

  function createNebulaPad(freq, vol) {
    var oscillators = [];
    var gain = ambientCtx.createGain();
    var filter = ambientCtx.createBiquadFilter();
    var lfo = ambientCtx.createOscillator();
    var lfoGain = ambientCtx.createGain();

    [1, 1.5].forEach(function (r, i) {
      var o = ambientCtx.createOscillator();
      o.type = "sine";
      o.frequency.value = freq * r * (1 + (Math.random() - 0.5) * 0.002);
      o.connect(filter);
      o.start();
      oscillators.push(o);
    });

    lfo.type = "sine";
    lfo.frequency.value = 0.01 + Math.random() * 0.025;
    lfoGain.gain.value = 50 + Math.random() * 40;
    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);
    lfo.start();
    oscillators.push(lfo);

    filter.type = "lowpass";
    filter.frequency.value = 700 + Math.random() * 400;
    filter.Q.value = 0.5;

    gain.gain.value = 0;
    filter.connect(gain);
    gain.connect(ambientMaster);
    gain.connect(reverbBus);

    return {
      nodes: oscillators,
      gain: gain,
      filter: filter,
      baseVol: vol,
      baseFilter: filter.frequency.value,
      kind: "nebula",
      phase: Math.random() * Math.PI * 2,
    };
  }

  function createCosmicDust() {
    var bufferSize = ambientCtx.sampleRate * 6;
    var buffer = ambientCtx.createBuffer(1, bufferSize, ambientCtx.sampleRate);
    var data = buffer.getChannelData(0);
    var last = 0;
    for (var i = 0; i < bufferSize; i++) {
      var white = Math.random() * 2 - 1;
      last = (last + 0.015 * white) / 1.015;
      data[i] = last * 1.8;
    }
    var src = ambientCtx.createBufferSource();
    src.buffer = buffer;
    src.loop = true;

    var filter = ambientCtx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = 380;
    filter.Q.value = 0.5;

    var gain = ambientCtx.createGain();
    gain.gain.value = 0;

    src.connect(filter);
    filter.connect(gain);
    gain.connect(ambientMaster);
    src.start();

    return {
      nodes: [src],
      gain: gain,
      filter: filter,
      baseVol: 0.012,
      baseFilter: 380,
      kind: "dust",
      phase: 0,
    };
  }

  // Destellos raros y suaves (no cada 2s → más orgánicos)
  function spawnStarShimmer() {
    if (!ambientCtx || !isAmbientOn || !enabled) return;
    // 40% de probabilidad de no hacer nada (rompe el patrón)
    if (Math.random() < 0.4) return;

    var starFreqs = [659, 784, 988, 1175, 1319];
    var freq = starFreqs[(Math.random() * starFreqs.length) | 0];

    var osc = ambientCtx.createOscillator();
    var g = ambientCtx.createGain();
    var ftr = ambientCtx.createBiquadFilter();
    osc.type = "sine";
    osc.frequency.value = freq * (1 + (Math.random() - 0.5) * 0.008);
    ftr.type = "bandpass";
    ftr.frequency.value = freq;
    ftr.Q.value = 6 + Math.random() * 4;
    g.gain.value = 0;
    osc.connect(ftr);
    ftr.connect(g);
    g.connect(ambientMaster);
    g.connect(reverbBus);
    osc.start();

    var now = ambientCtx.currentTime;
    var peak = 0.008 + Math.random() * 0.01;
    var dur = 3.5 + Math.random() * 3;
    g.gain.setValueAtTime(0.0001, now);
    g.gain.exponentialRampToValueAtTime(peak, now + 1.2 + Math.random());
    g.gain.exponentialRampToValueAtTime(0.0001, now + dur);

    setTimeout(
      function () {
        try {
          osc.stop();
        } catch (e) {}
      },
      (dur + 0.8) * 1000,
    );
  }

  function playAmbient() {
    if (isAmbientOn || !enabled) return;
    if (!getAmbientCtx()) return;
    if (ambientCtx.state === "suspended") {
      ambientCtx.resume().catch(function () {});
    }

    // Menos capas, más espacio entre frecuencias → menos fatiga
    voices = [
      createDeepDrone(55.0, 0.09), // A1
      createDeepDrone(82.41, 0.06), // E2
      createNebulaPad(164.81, 0.028), // E3
      createCosmicDust(),
    ];

    var now = ambientCtx.currentTime;
    voices.forEach(function (v, i) {
      v.gain.gain.cancelScheduledValues(now);
      v.gain.gain.setValueAtTime(0.0001, now);
      v.gain.gain.exponentialRampToValueAtTime(v.baseVol, now + 3.5 + i * 0.8);
    });

    ambientMaster.gain.cancelScheduledValues(now);
    ambientMaster.gain.setValueAtTime(0.0001, now);
    ambientMaster.gain.linearRampToValueAtTime(MASTER_TARGET, now + 6);

    // Evolución muy lenta y con fases distintas por voz (anti-repetición)
    var evolve = setInterval(function () {
      if (!isAmbientOn || !ambientCtx) return;
      var t = ambientCtx.currentTime;
      var time = Date.now() * 0.00005;
      voices.forEach(function (v, idx) {
        var ph = v.phase + time * (0.7 + idx * 0.23);
        if (v.kind === "dust") {
          v.filter.frequency.linearRampToValueAtTime(
            300 + Math.sin(ph) * 80,
            t + 8,
          );
          return;
        }
        var drift = Math.sin(ph) * 120;
        v.filter.frequency.linearRampToValueAtTime(
          Math.max(100, (v.baseFilter || 300) + drift),
          t + 8,
        );
        // Respiración asimétrica (no un seno perfecto)
        var breath =
          0.75 + Math.sin(ph * 0.85) * 0.12 + Math.sin(ph * 1.7) * 0.08;
        v.gain.gain.linearRampToValueAtTime(v.baseVol * breath, t + 6);
      });
    }, 5200);
    timers.push(evolve);

    // Shimmers irregulares (5–12 s)
    function scheduleShimmer() {
      if (!isAmbientOn) return;
      spawnStarShimmer();
      var next = 5000 + Math.random() * 7000;
      var id = setTimeout(scheduleShimmer, next);
      timers.push(id);
    }
    timers.push(setTimeout(scheduleShimmer, 4000 + Math.random() * 3000));

    isAmbientOn = true;
  }

  function stopAmbient() {
    timers.forEach(function (id) {
      clearInterval(id);
      clearTimeout(id);
    });
    timers = [];

    if (!ambientCtx) {
      isAmbientOn = false;
      return;
    }

    var now = ambientCtx.currentTime;
    if (ambientMaster) {
      ambientMaster.gain.cancelScheduledValues(now);
      ambientMaster.gain.setValueAtTime(
        Math.max(0.0001, ambientMaster.gain.value),
        now,
      );
      ambientMaster.gain.linearRampToValueAtTime(0.0001, now + 1.8);
    }
    voices.forEach(function (v) {
      try {
        v.gain.gain.cancelScheduledValues(now);
        v.gain.gain.setValueAtTime(Math.max(0.0001, v.gain.gain.value), now);
        v.gain.gain.linearRampToValueAtTime(0.0001, now + 1.5);
      } catch (e) {}
    });

    setTimeout(function () {
      voices.forEach(function (v) {
        (v.nodes || []).forEach(function (n) {
          try {
            if (n.stop) n.stop();
          } catch (e) {}
        });
      });
      voices = [];
      isAmbientOn = false;
    }, 2000);
  }

  function updateUI() {
    var btn = document.getElementById("sound-toggle");
    var icon = document.getElementById("sound-icon");
    if (!btn || !icon) return;
    btn.setAttribute("aria-pressed", enabled ? "true" : "false");
    btn.classList.toggle("active", enabled);
    icon.className = enabled ? "fas fa-volume-up" : "fas fa-volume-mute";
    btn.setAttribute(
      "aria-label",
      enabled ? "Desactivar sonidos" : "Activar sonidos",
    );
    btn.title = enabled ? "Sonido ON · Galaxia" : "Sonido OFF";
  }

  function setEnabled(on) {
    enabled = !!on;
    try {
      localStorage.setItem(STORAGE_KEY, enabled ? "1" : "0");
    } catch (e) {}
    updateUI();

    if (enabled) {
      getUiCtx();
      getAmbientCtx();
      playClick();
      if (hasInteracted) playAmbient();
    } else {
      stopAmbient();
    }
  }

  function bind() {
    var btn = document.getElementById("sound-toggle");
    if (btn) {
      var clone = btn.cloneNode(true);
      btn.parentNode.replaceChild(clone, btn);
      var finalBtn = document.getElementById("sound-toggle");
      finalBtn.addEventListener("click", function () {
        hasInteracted = true;
        setEnabled(!enabled);
      });
    }

    var selector =
      "a, button, .filter-btn, .skill-card, .service-card, .project-card, .faq-question, .cert-card, .ctrl-btn";
    document.querySelectorAll(selector).forEach(function (el) {
      el.addEventListener("mouseenter", playGlitch, { passive: true });
    });

    document.addEventListener(
      "click",
      function (e) {
        if (!enabled) return;
        if (
          e.target.closest("a, button, .filter-btn, .ctrl-btn, .faq-question")
        ) {
          playClick();
        }
      },
      true,
    );

    updateUI();

    if (enabled) {
      var unlock = function () {
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

  function init() {
    try {
      if (localStorage.getItem("portfolio-sound") === "1") {
        enabled = true;
        localStorage.setItem(STORAGE_KEY, "1");
      }
    } catch (e) {}

    bind();

    window.PortfolioSound = {
      playClick: playClick,
      playGlitch: playGlitch,
      setEnabled: setEnabled,
      playAmbient: playAmbient,
      stopAmbient: stopAmbient,
      get enabled() {
        return enabled;
      },
      mute: function () {
        setEnabled(false);
      },
      unmute: function () {
        setEnabled(true);
      },
    };
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
