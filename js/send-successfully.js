/**
 * send-successfully.js — Sonido de éxito al enviar el formulario
 * INDEPENDIENTE del toggle ambient/sound: siempre suena al éxito del correo.
 */
(function () {
  "use strict";

  var ctx = null;

  function getCtx() {
    if (ctx) return ctx;
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    return ctx;
  }

  /**
   * Arpegio suave de éxito (siempre activo, no depende de PortfolioSound)
   */
  function playSendSuccess() {
    var ac = getCtx();
    if (!ac) return;

    if (ac.state === "suspended") {
      ac.resume().catch(function () {});
    }

    var t = ac.currentTime;
    var notes = [523.25, 659.25, 783.99, 1046.5]; // C5 E5 G5 C6

    notes.forEach(function (freq, i) {
      var osc = ac.createOscillator();
      var gain = ac.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      var start = t + i * 0.09;
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(0.14, start + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.3);
      osc.connect(gain);
      gain.connect(ac.destination);
      osc.start(start);
      osc.stop(start + 0.32);
    });

    var osc2 = ac.createOscillator();
    var g2 = ac.createGain();
    osc2.type = "triangle";
    osc2.frequency.setValueAtTime(1400, t + 0.34);
    osc2.frequency.exponentialRampToValueAtTime(2600, t + 0.55);
    g2.gain.setValueAtTime(0.05, t + 0.34);
    g2.gain.exponentialRampToValueAtTime(0.001, t + 0.58);
    osc2.connect(g2);
    g2.connect(ac.destination);
    osc2.start(t + 0.34);
    osc2.stop(t + 0.6);
  }

  window.SendSuccessfully = {
    play: playSendSuccess,
    playSendSuccess: playSendSuccess,
  };
})();
