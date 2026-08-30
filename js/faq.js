document.addEventListener("DOMContentLoaded", () => {
  const items = document.querySelectorAll(".faq-item");
  if (!items.length) return;

  items.forEach((item) => {
    const btn = item.querySelector(".faq-question");
    if (!btn) return;

    btn.addEventListener("click", () => {
      const isActive = item.classList.contains("active");

      // Cerrar todos
      items.forEach((other) => {
        other.classList.remove("active");
        const otherBtn = other.querySelector(".faq-question");
        if (otherBtn) otherBtn.setAttribute("aria-expanded", "false");
      });

      // Abrir el actual si no estaba activo
      if (!isActive) {
        item.classList.add("active");
        btn.setAttribute("aria-expanded", "true");
      }
    });
  });
});
