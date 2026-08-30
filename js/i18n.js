/**
 * i18n.js — Switch ES / EN con persistencia en localStorage
 */
(function () {
  "use strict";

  var STORAGE_KEY = "portfolio_lang";

  var DICT = {
    es: {
      preloader: "CARGANDO...",
      "nav.home": "Inicio",
      "nav.projects": "Proyectos",
      "nav.experience": "Experiencia",
      "nav.skills": "Habilidades",
      "nav.services": "Servicios",
      "nav.certs": "Certificados",
      "nav.stats": "Estadísticas",
      "nav.faq": "FAQ",
      "nav.contact": "Contacto",
      "hero.bio":
        "Soy un apasionado entusiasta de la tecnología especializado en desarrollo web, Diseño gráfico y soluciones digitales. Me encanta aprender de nuevas tecnologías y aplicar mis habilidades para crear proyectos innovadores.",
      "hero.cta": "Ver Proyectos",
      "download.cv": "Descargar CV",
      "projects.title": "Proyectos",
      "projects.sub": "Algunos de mis trabajos y experimentos",
      "projects.all": "Todos",
      "projects.games": "Juegos",
      "projects.apps": "Aplicaciones Web",
      "descriptión.cyber":
        "Infinite runner cyberpunk. Salta obstáculos neón, acumula distancia y supera tu récord.",
      "play.btn": "Jugar",
      "view.demo.btn": "Ver demo",
      "descriptión.space":
        "Clásico reinventado con estética neón, power-ups, barreras destructibles y múltiples niveles.",
      "descriptión.puzzle":
        "Puzzle deslizante neón. Elige dificultad 3×3, 4×4 o 5×5 y completa el tablero.",
      "descriptión.dashboard":
        "Panel de control con visualización de datos en tiempo real y gráficos interactivos.",
      "descriptión.ecommerce":
        "Interfaz de tienda online moderna con carrito, filtros y diseño mobile-first.",
      "descriptión.taskmanager":
        "Gestor de tareas con categorías, prioridades y sincronización offline.",
      "exp.title": "Experiencia",
      "exp.sena.title": "Servicio Nacional de Aprendizaje (SENA)",
      "exp.sena.desc":
        "Formación en desarrollo de software y soluciones digitales, aplicando metodologías ágiles, trabajo en equipo y buenas prácticas de ingeniería en proyectos orientados a necesidades reales.",
      "exp.sportfull.title": "SPORT FULL",
      "exp.sportfull.role": "Colaborador en el desarrollo del sistema",
      "exp.sportfull.desc":
        "Plataforma orientada a la gestión deportiva de fútbol. El sistema permite administrar canchas, crear y gestionar perfiles de jugadores, ofrecer planes VIP para clientes, publicar ofertas y coordinar eventos deportivos en un solo lugar.",
      "exp.personal.title": "Desarrollo independiente",
      "exp.personal.desc":
        "Construcción de aplicaciones web, juegos y dashboards (E-Commerce, Task Manager, Analytics) aplicando MySQL, PostMan, Java, React y APIs, con enfoque en experiencia de usuario y estética moderna.",
      "exp.sub": "Formación y proyectos reales en el SENA",
      "exp.sena.features1": "Desarrollo web",
      "exp.sena.features2": "Análisis de requisitos",
      "exp.sena.features3": "Trabajo colaborativo",
      "exp.sena.features4": "Entrega de proyectos",
      "exp.sena.date": "Formación técnica",
      "exp.sportfull.badge": "Proyecto colaborativo",
      "exp.sportfull.features1": "Gestión de canchas",
      "exp.sportfull.features2": "Perfiles de fútbol",
      "exp.sportfull.features3": "Clientes VIP",
      "exp.sportfull.features4": "Ofertas y promociones",
      "exp.sportfull.features5": "Eventos deportivos",
      "exp.sportfull.tag1": "Análisis",
      "exp.sportfull.tag2": "UI / flujo de usuario",
      "exp.sportfull.tag3": "Lógica de negocio",
      "exp.sportfull.tag4": "Colaboración en equipo",
      "exp.personal.desc":
        "Construcción de aplicaciones web, juegos y dashboards (E-Commerce, Task Manager, Analytics) aplicando MySQL, PostMan, Java, React y APIs, con enfoque en experiencia de usuario y estética moderna.",
      "exp.personal.badge": "Continuo",
      "exp.personal.date": "Proyectos personales",
      "exp.personal.tag1": "React",
      "exp.personal.tag2": "APIs",
      "exp.personal.tag3": "Java",
      "exp.personal.tag4": "PostMan / MySQL",
      "skills.title": "Habilidades",
      "skills.sub": "Tecnologías y herramientas que domino",
      "services.title": "Servicios",
      "services.sub": "Lo que puedo hacer por ti",
      "services.web.title": "Desarrollo Web",
      "services.web.desc":
        "Sitios y aplicaciones web modernas, rápidas y responsive con las mejores prácticas.",
      "web.features1": "Landing pages",
      "web.features2": "SPAs con React",
      "web.features3": "Integración de APIs",
      "web.features4": "Optimización SEO",
      "services.graphic.title": "Diseño Gráfico",
      "graphic.features1": "Logotipos e identidad",
      "graphic.features2": "Diseño UI/UX",
      "graphic.features3": "Banners y redes sociales",
      "graphic.features4": "Material publicitario",
      "services.graphic.desc":
        "Identidad visual, branding y piezas digitales con estética profesional.",
      "services.digital.title": "Soluciones Digitales",
      "services.digital.desc":
        "Automatizaciones, herramientas a medida y sistemas que resuelven problemas reales.",
      "digital.features1": "Automatizaciones",
      "digital.features2": "Herramientas a medida",
      "digital.features3": "Sistemas de gestión",
      "digital.features4": "Integraciones y APIs",
      "services.consulting.title": "Consultoría Tech",
      "services.consulting.desc":
        "Asesoría para elegir stack, arquitectura y mejores prácticas en tus proyectos.",
      "consulting.features1": "Arquitectura de software",
      "consulting.features2": "Code review",
      "consulting.features3": "Mentoría",
      "consulting.features4": "Planificación técnica",
      "certs.title": "Certificados",
      "certs.load.error":
        "No se pudo cargar el archivo. Verifica que existe en <code>certs/</code>",
      "certs.openTab": "Abrir en nueva pestaña",
      "certs.download": "Descargar",
      "certs.close": "Cerrar",
      "certs.sub": "Formación y credenciales de mi carrera",
      "certs.view": "Ver credencial",
      "certs.placeholder.issuer": "Institución",
      "certs.placeholder.name": "Nombre del certificado",
      "certs.placeholder.desc":
        "Descripción breve. Reemplaza este texto con tu certificado real.",
      "certs.sena.name": "Programa de formación técnica",
      "certs.sena.desc":
        "Certificado o título obtenido en el SENA. Completa los datos de tu carrera aquí.",
      "certs.add.title": "Agregar certificado",
      "certs.add.desc":
        "Duplica esta tarjeta en el HTML e inserta el nombre, institución, año y enlace de tu credencial.",
      "stats.title": "Estadísticas",
      "stats.sub": "Números que hablan",
      "stats.projects": "Proyectos Completados",
      "stats.clients": "Clientes Satisfechos",
      "stats.lines": "Líneas de Código",
      "stats.hours": "Horas de Trabajo",
      "faq.title": "Preguntas Frecuentes",
      "faq.question1": "¿Que tecnologias utilizas en tus proyectos?",
      "faq.answer1":
        "Utilizo tecnologías modernas y populares como HTML5, CSS3, JavaScript, TypeScript, Java,  React, Node.js y bases de datos como MySQL y MongoDB. También aplico buenas prácticas de desarrollo web y diseño responsive.",
      "faq.question2": "¿Cuánto tiempo tardas en completar un proyecto?",
      "faq.answer2":
        "El tiempo de desarrollo depende de la complejidad del proyecto. Tras una reunión inicial, puedo darte un estimado de plazos y entregables.",
      "faq.question3": "¿Ofreces mantenimiento después de la entrega?",
      "faq.answer3":
        "Sí. Ofrezco planes de mantenimiento mensuales que incluyen actualizaciones de seguridad, corrección de bugs menores y pequeños ajustes de contenido. También puedo capacitar a tu equipo para que gestione el sitio de forma autónoma.",
      "faq.question4": "¿Cómo funciona el proceso de presupuesto?",
      "faq.answer4":
        "Tras una reunión inicial para entender tus necesidades, elaboro una propuesta detallada con alcance, plazos y precio fijo (o por fases). No hay costos ocultos: todo queda por escrito antes de empezar.",
      "faq.question5": "¿Puedes trabajar con diseños ya existentes?",
      "faq.answer5":
        "Por supuesto. Puedo implementar diseños de Figma, Adobe XD o PSD con alta fidelidad, o rediseñar y modernizar sitios existentes manteniendo la identidad de marca.",
      "faq.question6": "¿Los sitios son responsive y optimizados para móviles?",
      "faq.answer6":
        "Absolutamente. Todos los proyectos se desarrollan con enfoque mobile-first. Se prueban en múltiples dispositivos y resoluciones para garantizar una experiencia fluida en cualquier pantalla.",
      "faq.sub": "Respuestas a las dudas más comunes",
      "contact.title": "Contacto",
      "contact.sub": "¿Tienes un proyecto en mente? ¡Hablemos!",
      "contact.name": "Nombre",
      "contact.name.error": "Por favor ingresa tu nombre",
      "contact.email": "Email",
      "contact.email.error": "Ingresa un email válido",
      "contact.subject": "Asunto",
      "contact.subject.error": "El asunto es obligatorio",
      "contact.message": "Mensaje",
      "contact.message.error": "Escribe un mensaje",
      "contact.location": "Ubicación",
      "contact.availability": "Disponibilidad",
      "contact.whatsapp": "WhatsApp",
      "contact.submit": "Enviar Mensaje",
    },
    en: {
      preloader: "LOADING...",
      "nav.home": "Home",
      "nav.projects": "Projects",
      "nav.experience": "Experience",
      "nav.skills": "Skills",
      "nav.services": "Services",
      "nav.certs": "Certificates",
      "nav.stats": "Stats",
      "nav.faq": "FAQ",
      "nav.contact": "Contact",
      "hero.bio":
        "I'm a passionate tech enthusiast specializing in web development, graphic design, and digital solutions. I love learning new technologies and applying my skills to create innovative projects.",
      "hero.cta": "View Projects",
      "download.cv": "Download CV",
      "projects.title": "Projects",
      "projects.sub": "Some of my work and experiments",
      "projects.all": "All",
      "projects.games": "Games",
      "projects.apps": "Web Apps",
      "descriptión.cyber":
        "Infinite runner cyberpunk. Jump over neon obstacles, accumulate distance, and beat your record.",
      "play.btn": "Play",
      "view.demo.btn": "View Demo",
      "descriptión.space":
        "Classic reinvented with neon aesthetics, power-ups, destructible barriers, and multiple levels.",
      "descriptión.puzzle":
        "Neon sliding puzzle. Choose difficulty 3×3, 4×4 or 5×5 and complete the board.",
      "descriptión.dashboard":
        "Control panel with real-time data visualization and interactive charts.",
      "descriptión.ecommerce":
        "Modern online store interface with cart, filters, and mobile-first design.",
      "descriptión.taskmanager":
        "Task manager with categories, priorities, and offline synchronization.",
      "exp.title": "Experience",
      "exp.sena.title": "National Learning Service (SENA)",
      "exp.sena.desc":
        "Training in software development and digital solutions, applying agile methodologies, teamwork, and engineering best practices in projects oriented to real needs.",
      "exp.sportfull.title": "SPORT FULL",
      "exp.sportfull.role": "Collaborator in system development",
      "exp.sportfull.desc":
        "Platform focused on football sports management. The system allows managing fields, creating and managing player profiles, offering VIP plans for clients, publishing offers, and coordinating sports events in one place.",
      "exp.sena.features1": "Web development",
      "exp.sena.features2": "Requirements analysis",
      "exp.sena.features3": "Collaborative work",
      "exp.sena.features4": "Project delivery",
      "exp.personal.title": "Independent Development",
      "exp.sena.date": "Technical training",
      "exp.sportfull.badge": "Collaborative project",
      "exp.sportfull.features1": "Field management",
      "exp.sportfull.features2": "Football profiles",
      "exp.sportfull.features3": "VIP clients",
      "exp.sportfull.features4": "Offers and promotions",
      "exp.sportfull.features5": "Sports events",
      "exp.sportfull.tag1": "Analysis",
      "exp.sportfull.tag2": "UI / user flow",
      "exp.sportfull.tag3": "Business logic",
      "exp.sportfull.tag4": "Team collaboration",
      "exp.personal.badge": "Ongoing",
      "exp.personal.desc":
        "Building web applications, games, and dashboards (E-Commerce, Task Manager, Analytics) using MySQL, PostMan, Java, React, and APIs, with a focus on user experience and modern aesthetics.",
      "exp.personal.date": "Personal projects",
      "exp.personal.tag1": "React",
      "exp.personal.tag2": "APIs",
      "exp.personal.tag3": "Java",
      "exp.personal.tag4": "PostMan / MySQL",
      "exp.sub": "Training and real projects at SENA",
      "contact.role": "Collaborator in system development",
      "contact.desc":
        "Platform focused on football sports management. The system allows managing fields, creating and managing player profiles, offering VIP plans for clients, publishing offers, and coordinating sports events in one place.",
      "skills.title": "Skills",
      "skills.sub": "Technologies and tools I work with",
      "services.title": "Services",
      "services.web.title": "Web Development",
      "services.web.desc":
        "Modern, fast, and responsive websites and web applications with the best practices.",
      "web.features1": "Landing pages",
      "web.features2": "SPAs with React",
      "web.features3": "API integration",
      "web.features4": "SEO optimization",
      "digital.features1": "Automations",
      "digital.features2": "Custom tools",
      "digital.features3": "Management systems",
      "digital.features4": "Integrations and APIs",
      "services.graphic.title": "Graphic Design",
      "services.graphic.desc":
        "Visual identity, branding, and digital assets with a professional aesthetic.",
      "graphic.features1": "Logos and branding",
      "graphic.features2": "UI/UX design",
      "graphic.features3": "Banners and social media",
      "graphic.features4": "Advertising materials",
      "services.digital.title": "Digital Solutions",
      "services.digital.desc":
        "Automations, custom tools, and systems that solve real problems.",
      "digital.features1": "Automations",
      "digital.features2": "Custom tools",
      "digital.features3": "Management systems",
      "digital.features4": "Integrations and APIs",
      "services.consulting.title": "Consulting",
      "services.consulting.desc":
        "Advice for choosing stack, architecture and best practices in your projects.",
      "consulting.features1": "Software architecture",
      "consulting.features2": "Code review",
      "consulting.features3": "Mentoring",
      "consulting.features4": "Technical planning",
      "services.sub": "What I can do for you",
      "certs.title": "Certificates",
      "certs.load.error":
        "Could not load the file. Check that it exists in <code>certs/</code>",
      "certs.openTab": "Open in new tab",
      "certs.download": "Download",
      "certs.close": "Close",
      "certs.sub": "Training and credentials from my career",
      "certs.view": "View credential",
      "certs.placeholder.issuer": "Institution",
      "certs.placeholder.name": "Certificate name",
      "certs.placeholder.desc":
        "Short description. Replace this text with your real certificate.",
      "certs.sena.name": "Technical training program",
      "certs.sena.desc":
        "Certificate or degree obtained at SENA. Fill in your career details here.",
      "certs.add.title": "Add certificate",
      "certs.add.desc":
        "Duplicate this card in the HTML and insert the name, institution, year and credential link.",
      "stats.title": "Stats",
      "stats.sub": "Numbers that speak",
      "stats.projects": "Completed Projects",
      "stats.clients": "Satisfied Clients",
      "stats.lines": "Lines of Code",
      "stats.hours": "Hours of Work",
      "faq.title": "FAQ",
      "faq.sub": "Answers to common questions",
      "faq.question1": "What technologies do you use in your projects?",
      "faq.answer1":
        "I use modern and popular technologies such as HTML5, CSS3, JavaScript, TypeScript, Java, React, Node.js and databases like MySQL and MongoDB. I also apply good web development practices and responsive design.",
      "faq.question2": "How long does it take to complete a project?",
      "faq.answer2":
        "It depends on the scope and complexity. A simple landing page can be completed in 1-2 weeks, while a full web application might take between 4 and 8 weeks. I always define clear milestones and communicate progress regularly.",
      "faq.question3": "Do you offer maintenance after delivery?",
      "faq.answer3":
        "Yes. I offer monthly maintenance plans that include security updates, minor bug fixes, and small content adjustments. I can also train your team to manage the site independently.",
      "faq.question4": "How does the budgeting process work?",
      "faq.answer4":
        "After an initial meeting to understand your needs, I create a detailed proposal with scope, timelines, and a fixed price (or phased pricing). There are no hidden costs: everything is documented before starting.",
      "faq.question5": "Can you work with existing designs?",
      "faq.answer5":
        "Of course. I can implement designs from Figma, Adobe XD, or PSD files with high fidelity, or redesign and modernize existing websites while maintaining their brand identity.",
      "faq.question6": "Are the websites responsive and optimized for mobile?",
      "faq.answer6":
        "Absolutely. All projects are developed with a mobile-first approach. They are tested on multiple devices and resolutions to ensure a smooth experience on any screen.",
      "contact.title": "Contact",
      "contact.sub": "Have a project in mind? Let’s talk!",
      "contact.name": "Name",
      "contact.name.error": "Please enter your name",
      "contact.email": "Email",
      "contact.email.error": "Enter a valid email",
      "contact.subject": "Subject",
      "contact.subject.error": "Subject is required",
      "contact.location": "Location",
      "contact.availability": "Availability",
      "contact.whatsapp": "WhatsApp",
      "contact.message": "Message",
      "contact.message.error": "Write a message",
      "contact.submit": "Send Message",
    },
  };

  var lang = "es";

  function normalizeLang(value) {
    if (!value) return "es";
    value = String(value).toLowerCase().trim();
    if (value === "en" || value.indexOf("en") === 0) return "en";
    return "es";
  }

  function getSavedLang() {
    try {
      return normalizeLang(localStorage.getItem(STORAGE_KEY));
    } catch (err) {
      return "es";
    }
  }

  function saveLang(code) {
    try {
      localStorage.setItem(STORAGE_KEY, code);
    } catch (err) {
      /* private mode / blocked storage */
    }
  }

  function apply(langCode) {
    lang = normalizeLang(langCode);
    saveLang(lang);

    if (document.documentElement) {
      document.documentElement.setAttribute("lang", lang);
      document.documentElement.setAttribute("data-lang", lang);
    }

    var dict = DICT[lang] || DICT.es;
    var nodes = document.querySelectorAll("[data-i18n]");
    for (var i = 0; i < nodes.length; i++) {
      var el = nodes[i];
      var key = el.getAttribute("data-i18n");
      if (key && Object.prototype.hasOwnProperty.call(dict, key)) {
        el.textContent = dict[key];
      }
    }

    var label = document.getElementById("lang-label");
    if (label) {
      label.textContent = lang.toUpperCase();
    }

    var btn = document.getElementById("lang-toggle");
    if (btn) {
      btn.setAttribute(
        "aria-label",
        lang === "es" ? "Switch to English" : "Cambiar a español",
      );
      btn.setAttribute(
        "title",
        lang === "es" ? "Español · click for EN" : "English · click for ES",
      );
      btn.setAttribute("data-lang", lang);
    }

    // Notificar a otros módulos si lo necesitan
    try {
      document.dispatchEvent(
        new CustomEvent("portfolio:langchange", { detail: { lang: lang } }),
      );
    } catch (err) {
      /* IE / entornos muy antiguos */
    }
  }

  function toggle() {
    apply(lang === "es" ? "en" : "es");
    if (window.PortfolioSound && window.PortfolioSound.enabled) {
      window.PortfolioSound.playClick();
    }
  }

  function bindToggle() {
    var btn = document.getElementById("lang-toggle");
    if (!btn || btn.getAttribute("data-i18n-bound") === "1") return;
    btn.setAttribute("data-i18n-bound", "1");
    btn.addEventListener("click", function (e) {
      e.preventDefault();
      toggle();
    });
  }

  function init() {
    // Leer SIEMPRE de localStorage en el init (no confiar solo en el valor del parseo)
    apply(getSavedLang());
    bindToggle();
  }

  // Inicialización robusta: cubre defer, DOM ya listo y recargas
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  // Refuerzo tras load por si algún script reescribe el DOM
  window.addEventListener("load", function () {
    apply(getSavedLang());
    bindToggle();
  });

  window.PortfolioI18n = {
    apply: apply,
    toggle: toggle,
    getLang: function () {
      return lang;
    },
    getSavedLang: getSavedLang,
  };
})();
