document.addEventListener("DOMContentLoaded", () => {
  // ----- Preloader -----
  const preloader = document.getElementById("preloader");
  window.addEventListener("load", () => {
    setTimeout(() => {
      if (preloader) preloader.classList.add("hidden");
    }, 400);
  });
  // Fallback por si load ya ocurrió
  setTimeout(() => {
    if (preloader && !preloader.classList.contains("hidden")) {
      preloader.classList.add("hidden");
    }
  }, 2500);

  // ----- Navbar scroll -----
  const navbar = document.getElementById("navbar");
  const onScroll = () => {
    if (!navbar) return;
    if (window.scrollY > 50) {
      navbar.classList.add("scrolled");
    } else {
      navbar.classList.remove("scrolled");
    }
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // ----- Menú hamburguesa -----
  const hamburger = document.getElementById("hamburger");
  const navLinks = document.getElementById("nav-links");

  if (hamburger && navLinks) {
    hamburger.addEventListener("click", () => {
      const isOpen = navLinks.classList.toggle("open");
      hamburger.classList.toggle("active", isOpen);
      hamburger.setAttribute("aria-expanded", String(isOpen));
      hamburger.setAttribute(
        "aria-label",
        isOpen ? "Cerrar menú" : "Abrir menú",
      );
    });

    // Cerrar al hacer click en un link
    navLinks.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        navLinks.classList.remove("open");
        hamburger.classList.remove("active");
        hamburger.setAttribute("aria-expanded", "false");
      });
    });
  }

  // ----- Smooth scroll (refuerzo) -----
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", (e) => {
      const id = anchor.getAttribute("href");
      if (!id || id === "#") return;
      const target = document.querySelector(id);
      if (target) {
        e.preventDefault();
        const offset = 70;
        const top =
          target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: "smooth" });
      }
    });
  });

  // ----- Intersection Observer para fade-in -----
  const fadeEls = document.querySelectorAll(".fade-in");
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          // Animar barras de skills
          if (entry.target.classList.contains("skill-card")) {
            const bar = entry.target.querySelector(".skill-progress");
            const pct = entry.target.dataset.percent || "0";
            if (bar) bar.style.width = pct + "%";
          }
        }
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -40px 0px" },
  );
  fadeEls.forEach((el) => observer.observe(el));

  // ----- Cursor personalizado -----
  const cursor = document.getElementById("custom-cursor");
  if (
    cursor &&
    window.matchMedia("(hover: hover) and (pointer: fine)").matches
  ) {
    document.addEventListener("mousemove", (e) => {
      cursor.style.left = e.clientX + "px";
      cursor.style.top = e.clientY + "px";
    });

    const hoverTargets =
      "a, button, .filter-btn, .skill-card, .service-card, .project-card, .faq-question";
    document.querySelectorAll(hoverTargets).forEach((el) => {
      el.addEventListener("mouseenter", () => cursor.classList.add("hover"));
      el.addEventListener("mouseleave", () => cursor.classList.remove("hover"));
    });
  }

  // ----- Active nav link on scroll -----
  const sections = document.querySelectorAll("section[id]");
  const navAnchors = document.querySelectorAll(".nav-links a");

  window.addEventListener(
    "scroll",
    () => {
      let current = "";
      sections.forEach((section) => {
        const top = section.offsetTop - 100;
        if (window.scrollY >= top) {
          current = section.getAttribute("id") || "";
        }
      });
      navAnchors.forEach((a) => {
        a.classList.toggle("active", a.getAttribute("href") === "#" + current);
      });
    },
    { passive: true },
  );

  // ----- Easter egg: Konami code -----
  const konami = [
    "ArrowUp",
    "ArrowUp",
    "ArrowDown",
    "ArrowDown",
    "ArrowLeft",
    "ArrowRight",
    "ArrowLeft",
    "ArrowRight",
    "b",
    "a",
  ];
  let konamiIdx = 0;
  document.addEventListener("keydown", (e) => {
    if (e.key === konami[konamiIdx]) {
      konamiIdx++;
      if (konamiIdx === konami.length) {
        konamiIdx = 0;
        document.body.style.animation = "none";
        document.documentElement.style.setProperty("--accent-cyan", "#FFD700");
        document.documentElement.style.setProperty("--accent-pink", "#FF4500");
        alert("¡Modo secreto activado! 🎮✨");
      }
    } else {
      konamiIdx = 0;
    }
  });
});
