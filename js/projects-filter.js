/**
 * projects-filter.js — Filtrado de proyectos con animación
 */

document.addEventListener("DOMContentLoaded", () => {
    const filterBtns = document.querySelectorAll(".filter-btn");
    const cards = document.querySelectorAll(".project-card");

    if (!filterBtns.length || !cards.length) return;

    filterBtns.forEach((btn) => {
        btn.addEventListener("click", () => {
            // Estado activo
            filterBtns.forEach((b) => b.classList.remove("active"));
            btn.classList.add("active");

            const filter = btn.dataset.filter;

            cards.forEach((card) => {
                const category = card.dataset.category;
                const match = filter === "todos" || category === filter;

                if (match) {
                    card.classList.remove("hidden");
                    // Pequeño delay para animación
                    requestAnimationFrame(() => {
                        card.style.opacity = "1";
                        card.style.transform = "scale(1)";
                    });
                } else {
                    card.style.opacity = "0";
                    card.style.transform = "scale(0.9)";
                    setTimeout(() => {
                        card.classList.add("hidden");
                    }, 300);
                }
            });
        });
    });
});