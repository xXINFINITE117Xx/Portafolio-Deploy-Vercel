// ============================================================
// script.js — David Gaona Portfolio
// Migrado automáticamente desde bloques <script> inline de index.html
// ============================================================

// ------------------------------------------------------------
// 1. Modal de detalles de proyectos (abrir / cerrar)
// ------------------------------------------------------------
const viewDetailsButtons = document.querySelectorAll(".view-details");
const modals = document.querySelectorAll(".modal");
const closeModalButtons = document.querySelectorAll(".close-modal");

// Función para cerrar todos los modals
function closeAllModals() {
  modals.forEach((modal) => {
    modal.style.display = "none";
  });
  document.body.style.overflow = "auto";
}

// Abrir modal
viewDetailsButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const modalId = button.parentElement.getAttribute("data-modal");
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.style.display = "block";
      document.body.style.overflow = "hidden";
      // Enfocar el botón de cierre para accesibilidad
      const closeButton = modal.querySelector(".close-modal");
      if (closeButton) closeButton.focus();
    }
  });
});

// Cerrar modal con botón
closeModalButtons.forEach((button) => {
  button.addEventListener("click", () => {
    closeAllModals();
  });
});

// Cerrar modal al hacer clic fuera
modals.forEach((modal) => {
  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      closeAllModals();
    }
  });
});

// Cerrar modal con tecla Esc
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    closeAllModals();
  }
});

// ------------------------------------------------------------
// 2. Filtrado de proyectos (botones All / Games / Web Apps)
// ------------------------------------------------------------
// Seleccionar botones de filtro y tarjetas de proyecto
const filterButtons = document.querySelectorAll(".filter-btn");
const projectCards = document.querySelectorAll(".container-card");

// Función para filtrar proyectos
function filterProjects(category) {
  projectCards.forEach((card) => {
    const cardCategory = card.getAttribute("data-category");
    if (category === "all" || cardCategory === category) {
      card.style.display = "block";
    } else {
      card.style.display = "none";
    }
  });
}

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    filterButtons.forEach((btn) => btn.classList.remove("active"));
    button.classList.add("active");
    const category = button.getAttribute("data-filter");
    filterProjects(category);
  });
  // Añadir accesibilidad con teclado
  button.setAttribute("tabindex", "0");
  button.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      button.click();
    }
  });
});

// Mostrar todos los proyectos al cargar la página
window.addEventListener("load", () => {
  filterProjects("all");
});

// ------------------------------------------------------------
// 3. Click en posts del blog (placeholder alert)
// ------------------------------------------------------------
const blogPosts = document.querySelectorAll(".blog-post");
blogPosts.forEach((post) => {
  post.addEventListener("click", () => {
    alert(
      "This would open the full blog post: " +
        post.querySelector("h4").textContent,
    );
  });
});

// ------------------------------------------------------------
// 4. Formulario de suscripción (newsletter) vía EmailJS
// ------------------------------------------------------------
document.addEventListener("DOMContentLoaded", function () {
  const subscriptionForm = document.querySelector(".subscription-form");
  if (subscriptionForm) {
    subscriptionForm.addEventListener("submit", function (e) {
      e.preventDefault();

      const email = document.getElementById("subscription-email").value.trim();

      if (!email) {
        showNotification("Por favor, ingresa tu correo electrónico.", true);
        return;
      }

      emailjs
        .send("service_9afijun", "template_pe3ta9h", { email: email })
        .then(
          () => {
            showNotification("¡Suscripción exitosa! Revisa tu correo.");
            subscriptionForm.reset();
          },
          (error) => {
            showNotification("Error al suscribirse: " + error.text, true);
            console.log("Error detallado:", error);
          },
        );
    });
  }
});

// ------------------------------------------------------------
// 5. Variables CSS de scroll (--scroll / --scroll-slow)
// ------------------------------------------------------------
window.addEventListener("scroll", () => {
  const scrollPosition = window.scrollY;
  document.body.style.setProperty("--scroll", scrollPosition + "px");
  document.body.style.setProperty("--scroll-slow", scrollPosition * 0.5 + "px");
});

// ------------------------------------------------------------
// 6. Scroll suave para enlaces ancla (FIX: 'anchor' no estaba definido, se corrigió envolviendo en querySelectorAll)
// ------------------------------------------------------------
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault();
    const targetId = this.getAttribute("href").substring(1);
    console.log("Target ID:", targetId); // Agrega esta línea
    const targetElement = document.getElementById(targetId);
    if (targetElement) {
      const headerOffset =
        document.querySelector("header.portfolio").offsetHeight;
      const elementPosition = targetElement.offsetTop; // Usamos offsetTop para una posición absoluta
      const offsetPosition = elementPosition - headerOffset;

      window.scrollTo({
        top: offsetPosition >= 0 ? offsetPosition : 0, // Evita desplazamientos negativos
        behavior: "smooth",
      });
    }
  });
});

// ------------------------------------------------------------
// 7. Animación de contadores en la sección de estadísticas
// ------------------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
  const statsSection = document.querySelector(".stats");
  const statNumbers = document.querySelectorAll(".stat-number");

  const animateNumber = (element, target) => {
    let start = 0;
    const duration = 2000; // Duración de la animación en milisegundos
    const increment = target / (duration / 60); // Incremento por frame (60 FPS)

    const updateNumber = () => {
      start += increment;
      if (start >= target) {
        element.textContent = target;
        return;
      }
      element.textContent = Math.ceil(start);
      requestAnimationFrame(updateNumber);
    };

    updateNumber();
  };

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          statNumbers.forEach((number) => {
            const target = parseInt(number.getAttribute("data-target"));
            animateNumber(number, target);
          });
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.3 },
  );

  observer.observe(statsSection);
});

// ------------------------------------------------------------
// 8. Scroll suave para los enlaces del menú principal
// ------------------------------------------------------------
// Scroll suave para los enlaces del menú
document.addEventListener("DOMContentLoaded", () => {
  const menuLinks = document.querySelectorAll(".menu a");

  menuLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const targetId = link.getAttribute("href").substring(1);
      const targetElement = document.getElementById(targetId);

      if (targetElement) {
        window.scrollTo({
          top: targetElement.offsetTop - 80,
          behavior: "smooth",
        });
        // Cerrar el menú hamburguesa después del scroll en rangos específicos
        const hamburger = document.querySelector(".hamburger");
        const menu = document.querySelector(".menu");
        const body = document.body;
        const screenWidth = window.innerWidth;
        if (hamburger && menu && screenWidth >= 352 && screenWidth <= 768) {
          hamburger.classList.remove("active");
          menu.classList.remove("active");
          body.classList.remove("menu-active");
        }
      }
    });
  });
});

// ------------------------------------------------------------
// 9. Acordeón de la sección FAQ
// ------------------------------------------------------------
// Funcionalidad del acordeón para la sección FAQ
document.addEventListener("DOMContentLoaded", () => {
  const faqQuestions = document.querySelectorAll(".faq-question");

  faqQuestions.forEach((question) => {
    question.addEventListener("click", () => {
      const faqItem = question.parentElement;
      const answer = question.nextElementSibling;
      const isOpen = faqItem.classList.contains("active");

      // Cerrar todas las otras preguntas abiertas
      document.querySelectorAll(".faq-item").forEach((item) => {
        if (item !== faqItem) {
          item.classList.remove("active");
          const otherAnswer = item.querySelector(".faq-answer");
          const otherQuestion = item.querySelector(".faq-question");
          otherAnswer.style.maxHeight = null;
          otherQuestion.setAttribute("aria-expanded", "false");
        }
      });

      // Abrir o cerrar la pregunta actual
      if (!isOpen) {
        faqItem.classList.add("active");
        answer.style.maxHeight = answer.scrollHeight + "px";
        question.setAttribute("aria-expanded", "true");
      } else {
        faqItem.classList.remove("active");
        answer.style.maxHeight = null;
        question.setAttribute("aria-expanded", "false");
      }
    });
  });
});

// ------------------------------------------------------------
// 10. Loader de carga inicial
// ------------------------------------------------------------
window.addEventListener("load", () => {
  setTimeout(() => {
    document.body.classList.add("loaded");
    setTimeout(() => {
      const loader = document.querySelector(".loader");
      if (loader) loader.remove();
    }, 800); // Match transition duration
  }, 3000); // Ensure animation completes (matches progress animation duration)
});

// ------------------------------------------------------------
// 11. Botón 'Volver arriba'
// ------------------------------------------------------------
// Controlar el botón de "Volver Arriba"
document.addEventListener("DOMContentLoaded", () => {
  const backToTopButton = document.querySelector(".back-to-top");

  // Mostrar u ocultar el botón según el scroll
  window.addEventListener("scroll", () => {
    if (window.scrollY > 300) {
      // Mostrar después de 300px de scroll
      backToTopButton.classList.add("visible");
    } else {
      backToTopButton.classList.remove("visible");
    }
  });

  // Desplazamiento suave al hacer clic
  backToTopButton.addEventListener("click", () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  });
});

// ------------------------------------------------------------
// 12. Menú hamburguesa (mobile)
// ------------------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
  const hamburger = document.querySelector(".hamburger");
  const menu = document.querySelector(".menu");
  const body = document.body;

  hamburger.addEventListener("click", () => {
    const expanded = hamburger.getAttribute("aria-expanded") === "true";
    hamburger.setAttribute("aria-expanded", !expanded);
    hamburger.classList.toggle("active");
    menu.classList.toggle("active");
    body.classList.toggle("menu-active");
  });

  document.querySelectorAll(".menu a").forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const targetId = link.getAttribute("href").substring(1);
      const targetElement = document.getElementById(targetId);

      if (targetElement) {
        window.scrollTo({
          top: targetElement.offsetTop - 80,
          behavior: "smooth",
        });
        const screenWidth = window.innerWidth;
        if (screenWidth >= 352 && screenWidth <= 768) {
          hamburger.setAttribute("aria-expanded", "false");
          hamburger.classList.remove("active");
          menu.classList.remove("active");
          body.classList.remove("menu-active");
        }
      }
    });
  });

  document.addEventListener("click", (e) => {
    if (
      !menu.contains(e.target) &&
      !hamburger.contains(e.target) &&
      menu.classList.contains("active")
    ) {
      hamburger.setAttribute("aria-expanded", "false");
      hamburger.classList.remove("active");
      menu.classList.remove("active");
      body.classList.remove("menu-active");
    }
  });
});

// ------------------------------------------------------------
// 13. Efecto de partículas en el fondo (canvas)
// ------------------------------------------------------------
// Efecto de partículas en el fondo
document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("particle-canvas");
  const ctx = canvas.getContext("2d");

  // Ajustar el tamaño del canvas al tamaño de la ventana
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  // Redimensionar el canvas cuando la ventana cambie de tamaño
  window.addEventListener("resize", () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  });

  // Configuración de partículas
  const particlesArray = [];
  const numberOfParticles = 100; // Ajusta según el rendimiento

  class Particle {
    constructor() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.size = Math.random() * 3 + 1; // Tamaño entre 1 y 4
      this.speedX = Math.random() * 1 - 0.5; // Velocidad horizontal
      this.speedY = Math.random() * 1 - 0.5; // Velocidad vertical
      this.color = Math.random() > 0.5 ? "#00FFD1" : "#FF007A"; // Cian o rosa
    }

    update() {
      this.x += this.speedX;
      this.y += this.speedY;

      // Rebotar en los bordes
      if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
      if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;
    }

    draw() {
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Crear las partículas
  for (let i = 0; i < numberOfParticles; i++) {
    particlesArray.push(new Particle());
  }

  // Función para conectar partículas cercanas con líneas
  function connectParticles() {
    const maxDistance = 100; // Distancia máxima para conectar partículas
    for (let a = 0; a < particlesArray.length; a++) {
      for (let b = a + 1; b < particlesArray.length; b++) {
        const dx = particlesArray[a].x - particlesArray[b].x;
        const dy = particlesArray[a].y - particlesArray[b].y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < maxDistance) {
          ctx.strokeStyle = `rgba(${particlesArray[a].color === "#00FFD1" ? "0, 255, 209" : "255, 0, 122"}, ${1 - distance / maxDistance})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(particlesArray[a].x, particlesArray[a].y);
          ctx.lineTo(particlesArray[b].x, particlesArray[b].y);
          ctx.stroke();
        }
      }
    }
  }

  // Animar las partículas
  function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < particlesArray.length; i++) {
      particlesArray[i].update();
      particlesArray[i].draw();
    }

    connectParticles();
    requestAnimationFrame(animateParticles);
  }

  animateParticles();
});

// ------------------------------------------------------------
// 14. Inicialización de EmailJS y envío del formulario de contacto
// ------------------------------------------------------------
document.addEventListener("DOMContentLoaded", function () {
  // Inicializar EmailJS con el Public Key
  emailjs.init("2huM6p7GTbcU0piHC"); // Reemplaza con el Public Key correcto

  const form = document.querySelector(".contact-form");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();

      const fullName = document.getElementById("full-name").value.trim();
      const email = document.getElementById("email-address").value.trim();
      const message = document.getElementById("message").value.trim();

      if (!fullName || !email || !message) {
        showNotification(
          "Por favor, completa los campos obligatorios: Nombre, Email y Mensaje.",
          true,
        );
        return;
      }

      emailjs.sendForm("service_9afijun", "template_5qs75zl", this).then(
        () => {
          showNotification("¡Mensaje enviado con éxito!");
          this.reset();
        },
        (error) => {
          showNotification("Error al enviar el mensaje: " + error.text, true);
          console.log("Error detallado:", error);
        },
      );
    });
  } else {
    console.error("No se encontró el formulario con clase .contact-form");
  }
});

function showNotification(message, isError = false) {
  const notification = document.createElement("div");
  notification.className = `notification ${isError ? "error" : ""}`;
  notification.textContent = message;
  document.body.appendChild(notification);
  setTimeout(() => notification.remove(), 5000);
}
