(function () {
  "use strict";

  const CERTIFICATES = [
    {
      id: "sena-adso",
      name: {
        es: "Tecnólogo en Análisis y Desarrollo de Software",
        en: "Technologist in Software Analysis and Development",
      },
      issuer: "SENA",
      year: "2025",
      desc: {
        es: "Formación tecnológica con énfasis en análisis, desarrollo web, bases de datos, Java y arquitectura de software.",
        en: "Technological training focused on analysis, web development, databases, Java and software architecture.",
      },
      icon: "fa-award",
      file: "../certs/Certificado_Tecnologo_adso.jpg",
    },
    {
      id: "platzy-basic",
      name: {
        es: "Platzy - Curso Básico",
        en: "Platzy - Basic Course",
      },
      issuer: "Platzy",
      year: "2023",
      desc: {
        es: "Programa Básico. 29+ horas, lógica, React y soft skills.",
        en: "Basic Program. 29+ hours, logic, React and soft skills.",
      },
      icon: "fa-code",
      file: "../certs/Certificado_Programación_Basica.jpg",
    },
    {
      id: "Python-Fundamentals",
      name: {
        es: "Fundamentos de Python",
        en: "Python Fundamentals",
      },
      issuer: "Python",
      year: "2025",
      desc: {
        es: "Fundamento de Python. 96+ horas, Programación Orientada a Objetos.",
        en: "Python fundamentals. 96+ hours, Object Oriented Programming.",
      },
      icon: "fa-code",
      file: "../certs/Certificado_Python.jpg",
    },
  ];

  // ========== SISTEMA DE TRADUCCIÓN ==========
  const UI_TEXTS = {
    es: {
      view: "Ver credencial",
      close: "Cerrar",
      download: "Descargar",
      openNew: "Abrir en pestaña nueva",
    },
    en: {
      view: "View credential",
      close: "Close",
      download: "Download",
      openNew: "Open in new tab",
    },
  };

  function getLang() {
    return (
      localStorage.getItem("lang") || document.documentElement.lang || "es"
    );
  }

  function t(obj) {
    // Si es objeto {es, en} devuelve según idioma, si es string lo devuelve tal cual
    const lang = getLang();
    if (typeof obj === "object" && obj !== null) {
      return obj[lang] || obj.es || "";
    }
    return obj;
  }
  // ===========================================

  let current = null;
  const $ = (id) => document.getElementById(id);
  const esc = (s) => {
    const d = document.createElement("div");
    d.textContent = s == null ? "" : String(s);
    return d.innerHTML;
  };
  const fileKind = (path) => {
    const p = (path || "").toLowerCase().split("?")[0].split("#")[0];
    if (p.endsWith(".pdf")) return "pdf";
    return "image";
  };

  function render() {
    const grid = $("certs-grid");
    if (!grid) return;
    const lang = getLang();

    grid.innerHTML = CERTIFICATES.map(
      (c) => `
      <article class="cert-card" data-id="${esc(c.id)}">
        <div class="cert-card__top">
          <div class="cert-card__icon"><i class="fas ${esc(c.icon)}" aria-hidden="true"></i></div>
          <div class="cert-card__body">
            <span class="cert-card__issuer"><span class="cert-card__dot"></span>${esc(c.issuer)}</span>
            <h3 class="cert-card__name">${esc(t(c.name))}</h3>
            <p class="cert-card__desc">${esc(t(c.desc))}</p>
          </div>
        </div>
        <div class="cert-card__foot">
          <span class="cert-card__year">${esc(c.year)}</span>
          <button type="button" class="cert-card__view" data-act="view">
            ${esc(UI_TEXTS[lang].view)} <i class="fas fa-external-link-alt"></i>
          </button>
        </div>
      </article>
    `,
    ).join("");
  }

  function findCert(id) {
    return CERTIFICATES.find((c) => c.id === id) || null;
  }

  function resetPreview() {
    const img = $("cx-img");
    const pdf = $("cx-pdf");
    const empty = $("cx-empty");
    if (!img || !pdf || !empty) return;
    img.hidden = true;
    pdf.hidden = true;
    empty.hidden = true;
    img.removeAttribute("src");
    pdf.removeAttribute("src");
    img.onerror = null;
  }

  function showFile(path) {
    resetPreview();
    const kind = fileKind(path);
    const img = $("cx-img");
    const pdf = $("cx-pdf");
    const empty = $("cx-empty");
    const safePath = encodeURI(path);

    if (kind === "pdf") {
      pdf.src = safePath;
      pdf.hidden = false;
      return;
    }
    img.hidden = false;
    img.src = safePath;
    img.onerror = () => {
      img.hidden = true;
      empty.hidden = false;
    };
  }

  function openModal(cert) {
    current = cert;
    const lang = getLang();
    $("cx-title").textContent = t(cert.name) || "";
    $("cx-issuer").textContent = (cert.issuer || "").toUpperCase();
    $("cx-year").textContent = cert.year || "";
    $("cx-desc").textContent = t(cert.desc) || "";

    const iconEl = $("cx-icon")?.querySelector("i");
    if (iconEl) iconEl.className = `fas ${cert.icon || "fa-certificate"}`;

    const path = cert.file || "";
    showFile(path);

    const openBtn = $("cx-open");
    const dlBtn = $("cx-download");
    const closeBtn = $("cx-close");
    const doneBtn = $("cx-done");

    if (openBtn) {
      openBtn.href = encodeURI(path);
      openBtn.innerHTML = `${UI_TEXTS[lang].openNew} <i class="fas fa-external-link-alt"></i>`;
    }
    if (dlBtn) {
      dlBtn.href = encodeURI(path);
      dlBtn.setAttribute("download", path.split("/").pop() || "certificado");
      dlBtn.innerHTML = `<i class="fas fa-download"></i> ${UI_TEXTS[lang].download}`;
    }
    if (closeBtn) closeBtn.setAttribute("aria-label", UI_TEXTS[lang].close);
    if (doneBtn) doneBtn.textContent = UI_TEXTS[lang].close;

    $("cert-overlay").hidden = false;
    document.body.classList.add("cx-lock");
  }

  function closeModal() {
    const ov = $("cert-overlay");
    if (!ov) return;
    ov.hidden = true;
    resetPreview();
    current = null;
    document.body.classList.remove("cx-lock");
  }

  function bind() {
    const grid = $("certs-grid");
    if (!grid) return;

    grid.addEventListener("click", (e) => {
      const card = e.target.closest(".cert-card[data-id]");
      if (!card) return;
      const cert = findCert(card.getAttribute("data-id"));
      if (cert) openModal(cert);
    });

    $("cx-close")?.addEventListener("click", closeModal);
    $("cx-done")?.addEventListener("click", closeModal);
    $("cert-overlay")?.addEventListener("click", (e) => {
      if (e.target.id === "cert-overlay") closeModal();
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeModal();
    });

    // ESCUCHA EL CAMBIO DE IDIOMA
    window.addEventListener("langChange", render);
    document.getElementById("lang-toggle")?.addEventListener("click", () => {
      setTimeout(render, 50); // re-renderiza después de cambiar idioma
    });
  }

  function init() {
    if (!$("certs-grid")) return;
    render();
    bind();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
