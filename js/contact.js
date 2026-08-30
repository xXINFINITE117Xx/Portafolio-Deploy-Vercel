document.addEventListener("DOMContentLoaded", () => {
  // ====== CONFIG EMAILJS - TUS DATOS REALES ======
  const PUBLIC_KEY = "2huM6p7GTbcU0piHC";
  const SERVICE_ID = "service_9afijun";
  const TEMPLATE_ID = "template_5qs75zl";
  // ===============================================
  if (typeof emailjs !== "undefined" && PUBLIC_KEY) {
    try {
      emailjs.init(PUBLIC_KEY);
      console.log("EmailJS inicializado OK");
    } catch (e) {
      console.error("Error init EmailJS:", e);
    }
  } else {
    console.warn("EmailJS no cargado. Revisa el CDN en <head>");
  }

  const form = document.getElementById("contact-form");
  const statusEl = document.getElementById("form-status");
  const submitBtn = document.getElementById("submit-btn");

  if (!form) return;

  const fields = {
    name: {
      el: form.querySelector("#name"),
      validate: (v) => v.trim().length >= 2,
    },
    email: {
      el: form.querySelector("#email"),
      validate: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()),
    },
    subject: {
      el: form.querySelector("#subject"),
      validate: (v) => v.trim().length >= 3,
    },
    message: {
      el: form.querySelector("#message"),
      validate: (v) => v.trim().length >= 10,
    },
  };

  Object.values(fields).forEach(({ el, validate }) => {
    if (!el) return;
    el.addEventListener("blur", () => {
      const group = el.closest(".form-group");
      if (!validate(el.value)) {
        group.classList.add("has-error");
        el.classList.add("error");
      } else {
        group.classList.remove("has-error");
        el.classList.remove("error");
      }
    });
    el.addEventListener("input", () => {
      if (el.classList.contains("error") && validate(el.value)) {
        el.closest(".form-group").classList.remove("has-error");
        el.classList.remove("error");
      }
    });
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    let valid = true;
    Object.values(fields).forEach(({ el, validate }) => {
      if (!el) return;
      if (!validate(el.value)) {
        el.closest(".form-group").classList.add("has-error");
        el.classList.add("error");
        valid = false;
      }
    });

    if (!valid) {
      showStatus("Por favor corrige los campos marcados.", "error");
      return;
    }

    // Si EmailJS no está cargado, modo demo
    if (typeof emailjs === "undefined") {
      showStatus("EmailJS no cargado. Revisa tu conexión.", "error");
      return;
    }

    submitBtn.disabled = true;
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';

    try {
      // sendForm lee los name="name", "email", etc de tu form
      const result = await emailjs.sendForm(SERVICE_ID, TEMPLATE_ID, form);
      console.log("EmailJS OK:", result.status, result.text);
      showStatus(
        "¡Mensaje enviado correctamente! Te responderé pronto.",
        "success",
      );
      form.reset();
    } catch (err) {
      console.error("EmailJS error:", err);
      // Mensaje más útil según error
      if (err.text && err.text.includes("template")) {
        showStatus(
          "Error: Revisa que el TEMPLATE_ID coincida con EmailJS.",
          "error",
        );
      } else if (err.text && err.text.includes("service")) {
        showStatus(
          "Error: Revisa que el SERVICE_ID coincida con EmailJS.",
          "error",
        );
      } else {
        showStatus(
          "Hubo un error al enviar. Escríbeme directo a davidgaonahenao@gmail.com",
          "error",
        );
      }
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalText;
    }
  });

  function showStatus(msg, type) {
    if (!statusEl) return;
    statusEl.textContent = msg;
    statusEl.className = "form-status " + type + " visible";
    // Scroll al status en móvil
    statusEl.scrollIntoView({ behavior: "smooth", block: "nearest" });
    setTimeout(() => {
      statusEl.className = "form-status";
      statusEl.textContent = "";
    }, 6000);
  }
});
