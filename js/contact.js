/**
 * contact.js — Formulario de contacto con EmailJS
 * Reemplaza TU_PUBLIC_KEY, TU_SERVICE_ID y TU_TEMPLATE_ID con tus valores reales.
 */

document.addEventListener("DOMContentLoaded", () => {
    // Inicializar EmailJS (placeholder — sustituir por tu Public Key)
    const PUBLIC_KEY = "TU_PUBLIC_KEY";
    const SERVICE_ID = "TU_SERVICE_ID";
    const TEMPLATE_ID = "TU_TEMPLATE_ID";

    if (typeof emailjs !== "undefined" && PUBLIC_KEY !== "TU_PUBLIC_KEY") {
        emailjs.init(PUBLIC_KEY);
    }

    const form = document.getElementById("contact-form");
    const statusEl = document.getElementById("form-status");
    const submitBtn = document.getElementById("submit-btn");

    if (!form) return;

    // Validación en tiempo real
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

    form.addEventListener("submit", async(e) => {
        e.preventDefault();

        // Validar todos
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

        // Si no hay EmailJS configurado, simular éxito (demo)
        if (PUBLIC_KEY === "TU_PUBLIC_KEY" || typeof emailjs === "undefined") {
            submitBtn.disabled = true;
            submitBtn.innerHTML =
                '<i class="fas fa-spinner fa-spin"></i> Enviando...';
            setTimeout(() => {
                showStatus(
                    "¡Mensaje enviado correctamente! (modo demo — configura EmailJS para producción)",
                    "success",
                );
                form.reset();
                submitBtn.disabled = false;
                submitBtn.innerHTML =
                    '<i class="fas fa-paper-plane"></i> Enviar Mensaje';
            }, 1200);
            return;
        }

        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';

        try {
            await emailjs.sendForm(SERVICE_ID, TEMPLATE_ID, form);
            showStatus(
                "¡Mensaje enviado correctamente! Te responderé pronto.",
                "success",
            );
            form.reset();
        } catch (err) {
            console.error("EmailJS error:", err);
            showStatus(
                "Hubo un error al enviar. Intenta de nuevo o escríbeme directamente.",
                "error",
            );
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Enviar Mensaje';
        }
    });

    function showStatus(msg, type) {
        if (!statusEl) return;
        statusEl.textContent = msg;
        statusEl.className = "form-status " + type;
        setTimeout(() => {
            statusEl.className = "form-status";
            statusEl.textContent = "";
        }, 6000);
    }
});