/**
 * contact.js — Formulario de contacto con EmailJS real
 * Service: service_t78prda | Template: template_154qzxew85
 * Sonido de éxito: send-successfully.js → SendSuccessfully.play()
 */
(function () {
  "use strict";

  // ——— Credenciales EmailJS (cuenta del portafolio) ———
  var PUBLIC_KEY = "D54PLv11VRCg-_NR3";
  var SERVICE_ID = "service_t78prda";
  var TEMPLATE_ID = "template_154qzxew85";

  var emailjsReady = false;

  function initEmailJS() {
    if (typeof emailjs === "undefined") {
      console.warn("[Contact] EmailJS SDK no cargó");
      return false;
    }
    try {
      // API v4
      emailjs.init({ publicKey: PUBLIC_KEY });
      emailjsReady = true;
      return true;
    } catch (err) {
      try {
        emailjs.init(PUBLIC_KEY);
        emailjsReady = true;
        return true;
      } catch (e) {
        console.error("[Contact] No se pudo inicializar EmailJS", e);
        return false;
      }
    }
  }

  // Init as soon as possible (script may be deferred)
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initEmailJS);
  } else {
    initEmailJS();
  }

  var form = document.getElementById("contact-form");
  var statusEl = document.getElementById("form-status");
  var submitBtn = document.getElementById("submit-btn");
  var successOverlay = document.getElementById("mail-success");
  var successClose = document.getElementById("mail-success-close");

  var fields = form
    ? {
        name: {
          el: form.querySelector("#name"),
          validate: function (v) {
            return v.trim().length >= 2;
          },
        },
        email: {
          el: form.querySelector("#email"),
          validate: function (v) {
            return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
          },
        },
        subject: {
          el: form.querySelector("#subject"),
          validate: function (v) {
            return v.trim().length >= 3;
          },
        },
        message: {
          el: form.querySelector("#message"),
          validate: function (v) {
            return v.trim().length >= 10;
          },
        },
      }
    : {};

  function showStatus(msg, type) {
    if (!statusEl) return;
    statusEl.textContent = msg;
    statusEl.className = "form-status " + type;
    clearTimeout(showStatus._t);
    showStatus._t = setTimeout(function () {
      statusEl.className = "form-status";
      statusEl.textContent = "";
    }, 6000);
  }

  function playSuccessSound() {
    if (
      window.SendSuccessfully &&
      typeof SendSuccessfully.play === "function"
    ) {
      SendSuccessfully.play();
      return;
    }
    if (
      window.SendSuccessfully &&
      typeof SendSuccessfully.playSendSuccess === "function"
    ) {
      SendSuccessfully.playSendSuccess();
    }
  }

  function openSuccessModal() {
    if (!successOverlay) return;
    successOverlay.hidden = false;
    successOverlay.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    playSuccessSound();
    var modal = successOverlay.querySelector(".mail-success-modal");
    if (modal) {
      modal.style.animation = "none";
      void modal.offsetWidth;
      modal.style.animation = "";
    }
  }

  function closeSuccessModal() {
    if (!successOverlay) return;
    successOverlay.hidden = true;
    successOverlay.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  if (successClose) successClose.addEventListener("click", closeSuccessModal);
  if (successOverlay) {
    successOverlay.addEventListener("click", function (e) {
      if (e.target === successOverlay) closeSuccessModal();
    });
  }
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && successOverlay && !successOverlay.hidden) {
      closeSuccessModal();
    }
  });

  function validateField(key) {
    var f = fields[key];
    if (!f || !f.el) return true;
    var ok = f.validate(f.el.value);
    var group = f.el.closest(".form-group");
    if (group) group.classList.toggle("has-error", !ok);
    return ok;
  }

  function buildTemplateParams() {
    var name = (fields.name.el && fields.name.el.value.trim()) || "";
    var email = (fields.email.el && fields.email.el.value.trim()) || "";
    var subject = (fields.subject.el && fields.subject.el.value.trim()) || "";
    var message = (fields.message.el && fields.message.el.value.trim()) || "";

    // Varias claves por compatibilidad con plantillas EmailJS
    return {
      name: name,
      from_name: name,
      user_name: name,
      email: email,
      from_email: email,
      user_email: email,
      reply_to: email,
      subject: subject,
      title: subject,
      message: message,
      message_html: message,
    };
  }

  async function sendMail() {
    if (!emailjsReady) initEmailJS();
    if (typeof emailjs === "undefined") {
      throw new Error(
        "EmailJS no está disponible. Revisa la conexión o el script CDN.",
      );
    }

    var params = buildTemplateParams();

    // emailjs.send garantiza envío con parámetros explícitos al template
    return emailjs.send(SERVICE_ID, TEMPLATE_ID, params, {
      publicKey: PUBLIC_KEY,
    });
  }

  if (form) {
    Object.keys(fields).forEach(function (key) {
      var el = fields[key].el;
      if (!el) return;
      el.addEventListener("blur", function () {
        validateField(key);
      });
      el.addEventListener("input", function () {
        var group = el.closest(".form-group");
        if (group) group.classList.remove("has-error");
      });
    });

    form.addEventListener("submit", async function (e) {
      e.preventDefault();

      var valid = true;
      Object.keys(fields).forEach(function (key) {
        if (!validateField(key)) valid = false;
      });
      if (!valid) {
        showStatus("Revisa los campos marcados", "error");
        return;
      }

      var originalHtml = submitBtn ? submitBtn.innerHTML : "";
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML =
          '<i class="fas fa-spinner fa-spin"></i> Enviando...';
      }

      try {
        var result = await sendMail();
        console.log("[Contact] EmailJS OK", result);
        openSuccessModal();
        form.reset();
        Object.keys(fields).forEach(function (key) {
          var el = fields[key].el;
          if (el) {
            var group = el.closest(".form-group");
            if (group) group.classList.remove("has-error");
          }
        });
      } catch (err) {
        console.error("[Contact] Error al enviar", err);
        var msg =
          (err && (err.text || err.message)) ||
          "No se pudo enviar el mensaje. Intenta de nuevo más tarde.";
        showStatus(String(msg), "error");
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML =
            originalHtml || '<i class="fas fa-paper-plane"></i> Enviar Mensaje';
        }
      }
    });
  }

  /* ——— QR del portafolio ——— */
  function portfolioUrl() {
    var base =
      window.location.origin +
      window.location.pathname.replace(/index\.html$/i, "");
    return base.endsWith("/") ? base : base + "/";
  }

  function fallbackApi(frame, url) {
    frame.innerHTML = "";
    var img = document.createElement("img");
    img.alt = "Código QR del portafolio";
    img.width = 180;
    img.height = 180;
    img.loading = "lazy";
    img.src =
      "https://api.qrserver.com/v1/create-qr-code/?size=180x180&color=0A0F1B&bgcolor=00FFD1&data=" +
      encodeURIComponent(url);
    img.style.borderRadius = "12px";
    img.style.display = "block";
    frame.appendChild(img);
  }

  function renderQr() {
    var frame = document.getElementById("qr-frame");
    if (!frame) return;
    var url = portfolioUrl();

    if (typeof QRCode !== "undefined") {
      frame.innerHTML = "";
      var box = document.createElement("div");
      box.id = "qrcode-box";
      frame.appendChild(box);
      try {
        // eslint-disable-next-line no-new
        new QRCode(box, {
          text: url,
          width: 180,
          height: 180,
          colorDark: "#0A0F1B",
          colorLight: "#00FFD1",
          correctLevel: QRCode.CorrectLevel.M,
        });
      } catch (err) {
        console.warn("[QR] lib failed, API fallback", err);
        fallbackApi(frame, url);
      }
    } else {
      fallbackApi(frame, url);
    }
  }

  function downloadQr() {
    var frame = document.getElementById("qr-frame");
    if (!frame) return;
    var node = frame.querySelector("canvas, img");
    if (!node) return;
    var dataUrl = "";
    if (node.tagName === "CANVAS") {
      dataUrl = node.toDataURL("image/png");
    } else if (node.tagName === "IMG") {
      var c = document.createElement("canvas");
      c.width = 180;
      c.height = 180;
      var ctx = c.getContext("2d");
      try {
        ctx.drawImage(node, 0, 0, 180, 180);
        dataUrl = c.toDataURL("image/png");
      } catch (e) {
        window.open(node.src, "_blank");
        return;
      }
    }
    if (!dataUrl) return;
    var a = document.createElement("a");
    a.href = dataUrl;
    a.download = "portafolio-david-gaona-qr.png";
    a.click();
    if (window.PortfolioSound) PortfolioSound.playClick();
  }

  async function copyLink() {
    var url = portfolioUrl();
    try {
      await navigator.clipboard.writeText(url);
      var btn = document.getElementById("qr-copy");
      if (btn) {
        var span = btn.querySelector("span");
        var prev = span ? span.textContent : "";
        if (span) span.textContent = "¡Copiado!";
        setTimeout(function () {
          if (span) span.textContent = prev || "Copiar enlace";
        }, 1800);
      }
      playSuccessSound();
    } catch (e) {
      prompt("Copia este enlace:", url);
    }
  }

  function initQr() {
    renderQr();
    var dl = document.getElementById("qr-download");
    var cp = document.getElementById("qr-copy");
    if (dl) dl.addEventListener("click", downloadQr);
    if (cp) cp.addEventListener("click", copyLink);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      initEmailJS();
      initQr();
    });
  } else {
    setTimeout(function () {
      initEmailJS();
      initQr();
    }, 150);
  }
})();
