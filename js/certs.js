(function () {
  "use strict";
  
  const CERTIFICATES = [
    {
      id: "sena-adso",
      name: "Tecnólogo en Análisis y Desarrollo de Software",
      issuer: "SENA",
      year: "2025",
      desc: "Formación tecnológica con énfasis en análisis, desarrollo web, bases de datos, Java y arquitectura de software.",
      icon: "fa-award",
      file: "../certs/Certificado_Tecnologo_adso.jpg", // <-- tu PDF o JPG aquí
    },
    {
      id: "platzy-basic",
      name: "Platzy - Curso Básico",
      issuer: "Platzy",
      year: "2023",
      desc: "Programa Basico. 29+ horas, lógica, React y soft skills.",
      icon: "fa-code",
      file: "../certs/Certificado_Programación_Basica.jpg",
    },
    {
      id: "Python-Fundamentals",
      name: "Python Fundamentals",
      issuer: "Python",
      year: "2025",
      desc: "Fundamento de Python. 96+ horas, Programación Orientada a Objetos.",
      icon: "fa-code",
      file: "../certs/Certificado_Python.jpg",
    },
  ];
  // =======================================================

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

    grid.innerHTML = CERTIFICATES.map(
      (c) => `
      <article class="cert-card" data-id="${esc(c.id)}">
        <div class="cert-card__top">
          <div class="cert-card__icon"><i class="fas ${esc(c.icon)}" aria-hidden="true"></i></div>
          <div class="cert-card__body">
            <span class="cert-card__issuer"><span class="cert-card__dot"></span>${esc(c.issuer)}</span>
            <h3 class="cert-card__name">${esc(c.name)}</h3>
            <p class="cert-card__desc">${esc(c.desc)}</p>
          </div>
        </div>
        <div class="cert-card__foot">
          <span class="cert-card__year">${esc(c.year)}</span>
          <button type="button" class="cert-card__view" data-act="view">
            Ver credencial <i class="fas fa-external-link-alt"></i>
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

    // encodeURI corrige espacios por si olvidas renombrar
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
    $("cx-title").textContent = cert.name || "";
    $("cx-issuer").textContent = (cert.issuer || "").toUpperCase();
    $("cx-year").textContent = cert.year || "";
    $("cx-desc").textContent = cert.desc || "";

    const iconEl = $("cx-icon")?.querySelector("i");
    if (iconEl) iconEl.className = `fas ${cert.icon || "fa-certificate"}`;

    const path = cert.file || "";
    showFile(path);

    const openBtn = $("cx-open");
    const dlBtn = $("cx-download");
    if (openBtn) openBtn.href = encodeURI(path);
    if (dlBtn) {
      dlBtn.href = encodeURI(path);
      dlBtn.setAttribute("download", path.split("/").pop() || "certificado");
    }

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

    // Click en cualquier card abre modal
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
