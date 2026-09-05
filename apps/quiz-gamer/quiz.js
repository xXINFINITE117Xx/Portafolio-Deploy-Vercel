(function () {
  "use strict";

  var QUESTIONS = [
    {
      cat: "JS",
      q: "¿Qué tipo de dato devuelve typeof null en JavaScript?",
      a: ['"null"', '"object"', '"undefined"', '"number"'],
      c: 1,
    },
    {
      cat: "JS",
      q: "¿Cuál es la forma correcta de declarar una constante?",
      a: ["const x = 1", "let x = 1", "var x = 1", "constant x = 1"],
      c: 0,
    },
    {
      cat: "JS",
      q: "¿Qué método convierte un JSON string a objeto?",
      a: ["JSON.stringify", "JSON.parse", "JSON.toObject", "JSON.convert"],
      c: 1,
    },
    {
      cat: "HTML",
      q: "¿Qué etiqueta se usa para el contenido principal de la página?",
      a: ["<section>", "<main>", "<content>", "<body>"],
      c: 1,
    },
    {
      cat: "HTML",
      q: "¿Cuál es el atributo correcto para textos alternativos en imágenes?",
      a: ["title", "alt", "src", "label"],
      c: 1,
    },
    {
      cat: "HTML",
      q: '¿Qué significa la "S" en HTML5 semántico <nav>?',
      a: [
        "Es solo estilo",
        "Define navegación",
        "Es obligatorio en body",
        "Reemplaza a <div>",
      ],
      c: 1,
    },
    {
      cat: "CSS",
      q: "¿Qué propiedad controla el espacio interno de un elemento?",
      a: ["margin", "padding", "gap", "spacing"],
      c: 1,
    },
    {
      cat: "CSS",
      q: "¿Cuál es un valor válido de position?",
      a: ["center", "absolute", "float", "flex"],
      c: 1,
    },
    {
      cat: "CSS",
      q: "¿Qué unidad es relativa al tamaño de fuente del elemento?",
      a: ["px", "vh", "em", "%"],
      c: 2,
    },
    {
      cat: "JS",
      q: "¿Qué hace Array.prototype.map?",
      a: [
        "Modifica el array original",
        "Devuelve un nuevo array transformado",
        "Filtra elementos",
        "Ordena el array",
      ],
      c: 1,
    },
    {
      cat: "JS",
      q: '¿Cuál es el resultado de "2" + 2 en JS?',
      a: ["4", '"22"', "NaN", "Error"],
      c: 1,
    },
    {
      cat: "CSS",
      q: "¿Qué display usa el eje principal con flex-direction:row?",
      a: ["Vertical", "Horizontal", "Diagonal", "Grid"],
      c: 1,
    },
    {
      cat: "HTML",
      q: "¿Para qué sirve el atributo defer en <script>?",
      a: [
        "Bloquea el parseo",
        "Ejecuta tras parsear el HTML",
        "Elimina el script",
        "Solo en módulos",
      ],
      c: 1,
    },
    {
      cat: "JS",
      q: "¿Qué keyword detiene un bucle por completo?",
      a: ["stop", "exit", "break", "return"],
      c: 2,
    },
    {
      cat: "CSS",
      q: "¿Qué selector tiene mayor especificidad?",
      a: [".clase", "#id", "div", "*"],
      c: 1,
    },
  ];

  var TIME_PER_Q = 15;
  var TOTAL_Q = 10;
  var MAX_LIVES = 3;
  var RANK_KEY = "quizGamerRank_v1";

  var screenStart = document.getElementById("screen-start");
  var screenPlay = document.getElementById("screen-play");
  var screenEnd = document.getElementById("screen-end");
  var livesEl = document.getElementById("lives");
  var qNumEl = document.getElementById("q-num");
  var timerEl = document.getElementById("timer");
  var scoreEl = document.getElementById("score");
  var progressBar = document.getElementById("progress-bar");
  var categoryEl = document.getElementById("category");
  var questionEl = document.getElementById("question");
  var answersEl = document.getElementById("answers");
  var playerInput = document.getElementById("player-name");
  var rankList = document.getElementById("rank-list");

  var state = {
    deck: [],
    index: 0,
    score: 0,
    lives: MAX_LIVES,
    timeLeft: TIME_PER_Q,
    timerId: null,
    locked: false,
    player: "Player",
  };

  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i];
      a[i] = a[j];
      a[j] = t;
    }
    return a;
  }

  function show(screen) {
    screenStart.classList.add("hidden");
    screenPlay.classList.add("hidden");
    screenEnd.classList.add("hidden");
    screen.classList.remove("hidden");
  }

  function renderLives() {
    var s = "";
    for (var i = 0; i < MAX_LIVES; i++) s += i < state.lives ? "♥ " : "♡ ";
    livesEl.textContent = s.trim();
  }

  function loadRank() {
    try {
      return JSON.parse(localStorage.getItem(RANK_KEY) || "[]");
    } catch (e) {
      return [];
    }
  }

  function saveRank(entry) {
    var list = loadRank();
    list.push(entry);
    list.sort(function (a, b) {
      return b.score - a.score || a.time - b.time;
    });
    list = list.slice(0, 8);
    localStorage.setItem(RANK_KEY, JSON.stringify(list));
    renderRank();
  }

  function renderRank() {
    var list = loadRank();
    if (!list.length) {
      rankList.innerHTML = '<li class="empty">Sin récords aún</li>';
      return;
    }
    rankList.innerHTML = list
      .map(function (r, i) {
        return (
          "<li><strong>" +
          escapeHtml(r.name) +
          "</strong> — " +
          r.score +
          " pts</li>"
        );
      })
      .join("");
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function startQuiz() {
    state.player =
      (playerInput.value || "Player").trim().slice(0, 16) || "Player";
    state.deck = shuffle(QUESTIONS).slice(0, TOTAL_Q);
    state.index = 0;
    state.score = 0;
    state.lives = MAX_LIVES;
    state.locked = false;
    scoreEl.textContent = "0";
    renderLives();
    show(screenPlay);
    nextQuestion();
  }

  function clearTimer() {
    if (state.timerId) {
      clearInterval(state.timerId);
      state.timerId = null;
    }
  }

  function nextQuestion() {
    clearTimer();
    state.locked = false;
    if (state.index >= state.deck.length || state.lives <= 0) {
      endQuiz();
      return;
    }
    var item = state.deck[state.index];
    qNumEl.textContent = String(state.index + 1);
    progressBar.style.width = ((state.index + 1) / TOTAL_Q) * 100 + "%";
    categoryEl.textContent = item.cat;
    questionEl.textContent = item.q;
    answersEl.innerHTML = "";
    item.a.forEach(function (text, i) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "answer";
      btn.textContent = text;
      btn.addEventListener("click", function () {
        selectAnswer(i);
      });
      answersEl.appendChild(btn);
    });
    state.timeLeft = TIME_PER_Q;
    timerEl.textContent = String(state.timeLeft);
    timerEl.classList.remove("urgent");
    state.timerId = setInterval(function () {
      state.timeLeft--;
      timerEl.textContent = String(Math.max(0, state.timeLeft));
      if (state.timeLeft <= 5) timerEl.classList.add("urgent");
      if (state.timeLeft <= 0) {
        clearTimer();
        selectAnswer(-1);
      }
    }, 1000);
  }

  function selectAnswer(idx) {
    if (state.locked) return;
    state.locked = true;
    clearTimer();
    var item = state.deck[state.index];
    var buttons = answersEl.querySelectorAll(".answer");
    buttons.forEach(function (b, i) {
      b.disabled = true;
      if (i === item.c) b.classList.add("correct");
      if (idx === i && i !== item.c) b.classList.add("wrong");
    });

    if (idx === item.c) {
      var bonus = Math.max(5, state.timeLeft * 2);
      state.score += 100 + bonus;
      scoreEl.textContent = String(state.score);
    } else {
      state.lives--;
      renderLives();
    }

    setTimeout(function () {
      state.index++;
      nextQuestion();
    }, 900);
  }

  function endQuiz() {
    clearTimer();
    show(screenEnd);
    var perfect = state.lives > 0 && state.index >= state.deck.length;
    document.getElementById("end-title").textContent =
      state.lives <= 0 && state.index < TOTAL_Q ? "GAME OVER" : "¡COMPLETADO!";
    document.getElementById("end-score").textContent = String(state.score);
    document.getElementById("end-msg").textContent =
      state.lives <= 0
        ? "Te quedaste sin vidas. ¡Inténtalo de nuevo!"
        : "Buen trabajo, " + state.player + ". Ranking actualizado.";
    saveRank({ name: state.player, score: state.score, time: Date.now() });
  }

  document.getElementById("btn-start").addEventListener("click", startQuiz);
  document.getElementById("btn-retry").addEventListener("click", function () {
    show(screenStart);
    renderRank();
  });

  // Partículas simples
  (function () {
    var c = document.getElementById("particles");
    if (!c) return;
    var ctx = c.getContext("2d");
    var ps = [];
    function resize() {
      c.width = innerWidth;
      c.height = innerHeight;
    }
    function init() {
      ps = [];
      for (var i = 0; i < 30; i++) {
        ps.push({
          x: Math.random() * c.width,
          y: Math.random() * c.height,
          r: Math.random() * 2 + 0.5,
          vx: (Math.random() - 0.5) * 0.4,
          vy: (Math.random() - 0.5) * 0.4,
          col:
            Math.random() > 0.5
              ? "rgba(0,255,209,0.6)"
              : "rgba(255,0,122,0.55)",
        });
      }
    }
    function loop() {
      ctx.clearRect(0, 0, c.width, c.height);
      ps.forEach(function (p) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > c.width) p.vx *= -1;
        if (p.y < 0 || p.y > c.height) p.vy *= -1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.col;
        ctx.fill();
      });
      requestAnimationFrame(loop);
    }
    resize();
    init();
    loop();
    addEventListener("resize", function () {
      resize();
      init();
    });
  })();

  renderRank();
})();
