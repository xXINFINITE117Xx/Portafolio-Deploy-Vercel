/**
 * Task Manager Pro — LocalStorage + filtros + prioridades
 */
(function () {
  "use strict";

  const STORAGE_KEY = "taskManagerPro_v1";

  const state = {
    tasks: loadTasks(),
    status: "all",
    category: "all",
    priority: "all",
    query: "",
  };

  const els = {
    form: document.getElementById("task-form"),
    title: document.getElementById("task-title"),
    category: document.getElementById("task-category"),
    priority: document.getElementById("task-priority"),
    due: document.getElementById("task-due"),
    list: document.getElementById("task-list"),
    empty: document.getElementById("empty-state"),
    search: document.getElementById("search-tasks"),
    filterCat: document.getElementById("filter-category"),
    filterPri: document.getElementById("filter-priority"),
    statTotal: document.getElementById("stat-total"),
    statDone: document.getElementById("stat-done"),
    statPending: document.getElementById("stat-pending"),
    toast: document.getElementById("toast"),
  };

  function loadTasks() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  function saveTasks() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.tasks));
  }

  function uid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  }

  function showToast(msg) {
    els.toast.textContent = msg;
    els.toast.classList.remove("hidden");
    requestAnimationFrame(() => els.toast.classList.add("show"));
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => {
      els.toast.classList.remove("show");
      setTimeout(() => els.toast.classList.add("hidden"), 280);
    }, 2000);
  }

  function updateStats() {
    const total = state.tasks.length;
    const done = state.tasks.filter((t) => t.done).length;
    els.statTotal.textContent = total;
    els.statDone.textContent = done;
    els.statPending.textContent = total - done;
  }

  function isOverdue(task) {
    if (!task.due || task.done) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(task.due + "T00:00:00");
    return due < today;
  }

  function formatDue(due) {
    if (!due) return "";
    const d = new Date(due + "T00:00:00");
    return d.toLocaleDateString("es", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  function filtered() {
    return state.tasks.filter((t) => {
      if (state.status === "pending" && t.done) return false;
      if (state.status === "done" && !t.done) return false;
      if (state.category !== "all" && t.category !== state.category)
        return false;
      if (state.priority !== "all" && t.priority !== state.priority)
        return false;
      if (state.query) {
        const q = state.query.toLowerCase();
        if (!t.title.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }

  function priorityOrder(p) {
    return { high: 0, medium: 1, low: 2 }[p] ?? 3;
  }

  function render() {
    updateStats();
    let list = filtered();

    // Orden: pendientes primero, luego prioridad, luego fecha
    list = list.slice().sort((a, b) => {
      if (a.done !== b.done) return a.done ? 1 : -1;
      const po = priorityOrder(a.priority) - priorityOrder(b.priority);
      if (po !== 0) return po;
      if (a.due && b.due) return a.due.localeCompare(b.due);
      if (a.due) return -1;
      if (b.due) return 1;
      return b.created - a.created;
    });

    if (!list.length) {
      els.list.innerHTML = "";
      els.empty.classList.remove("hidden");
      return;
    }
    els.empty.classList.add("hidden");

    els.list.innerHTML = list
      .map((t) => {
        const overdue = isOverdue(t);
        return `
        <article class="task-item ${t.done ? "done" : ""}" data-id="${t.id}">
          <button class="task-check" data-action="toggle" aria-label="${t.done ? "Marcar pendiente" : "Completar"}">
            <i class="fas fa-check"></i>
          </button>
          <div class="task-body">
            <div class="task-title-text">${escapeHtml(t.title)}</div>
            <div class="task-meta">
              <span class="pill cat-${t.category}">${t.category}</span>
              <span class="pill pri-${t.priority}">${labelPriority(t.priority)}</span>
              ${t.due ? `<span class="due-date ${overdue ? "overdue" : ""}"><i class="far fa-calendar"></i> ${formatDue(t.due)}${overdue ? " · vencida" : ""}</span>` : ""}
            </div>
          </div>
          <div class="task-actions">
            <button data-action="edit" title="Editar" aria-label="Editar"><i class="fas fa-pen"></i></button>
            <button class="btn-delete" data-action="delete" title="Eliminar" aria-label="Eliminar"><i class="fas fa-trash-alt"></i></button>
          </div>
        </article>`;
      })
      .join("");
  }

  function labelPriority(p) {
    return { high: "Alta", medium: "Media", low: "Baja" }[p] || p;
  }

  function escapeHtml(str) {
    const d = document.createElement("div");
    d.textContent = str;
    return d.innerHTML;
  }

  function addTask(title, category, priority, due) {
    state.tasks.unshift({
      id: uid(),
      title: title.trim(),
      category,
      priority,
      due: due || null,
      done: false,
      created: Date.now(),
    });
    saveTasks();
    render();
    showToast("Tarea añadida");
  }

  function toggleTask(id) {
    const t = state.tasks.find((x) => x.id === id);
    if (!t) return;
    t.done = !t.done;
    saveTasks();
    render();
  }

  function deleteTask(id) {
    state.tasks = state.tasks.filter((x) => x.id !== id);
    saveTasks();
    render();
    showToast("Tarea eliminada");
  }

  function startEdit(id) {
    const item = els.list.querySelector(`[data-id="${id}"]`);
    const task = state.tasks.find((x) => x.id === id);
    if (!item || !task) return;

    // Cerrar otros edits
    els.list.querySelectorAll(".task-item.editing").forEach((el) => {
      el.classList.remove("editing");
      const input = el.querySelector(".edit-input");
      if (input) input.remove();
    });

    item.classList.add("editing");
    const body = item.querySelector(".task-body");
    const input = document.createElement("input");
    input.className = "edit-input";
    input.value = task.title;
    input.maxLength = 120;
    body.insertBefore(input, body.firstChild);
    input.focus();
    input.select();

    const commit = () => {
      const val = input.value.trim();
      if (val && val !== task.title) {
        task.title = val;
        saveTasks();
        showToast("Tarea actualizada");
      }
      render();
    };

    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        commit();
      }
      if (e.key === "Escape") render();
    });
    input.addEventListener("blur", () => setTimeout(commit, 120));
  }

  // Form
  els.form.addEventListener("submit", (e) => {
    e.preventDefault();
    const title = els.title.value.trim();
    if (!title) return;
    addTask(title, els.category.value, els.priority.value, els.due.value);
    els.form.reset();
    els.priority.value = "medium";
    els.title.focus();
  });

  // List actions
  els.list.addEventListener("click", (e) => {
    const item = e.target.closest(".task-item");
    if (!item) return;
    const id = item.dataset.id;
    const action = e.target.closest("[data-action]")?.dataset.action;
    if (action === "toggle") toggleTask(id);
    if (action === "delete") deleteTask(id);
    if (action === "edit") startEdit(id);
  });

  // Filters
  document.getElementById("status-filters").addEventListener("click", (e) => {
    const tab = e.target.closest(".tab");
    if (!tab) return;
    document
      .querySelectorAll("#status-filters .tab")
      .forEach((t) => t.classList.remove("active"));
    tab.classList.add("active");
    state.status = tab.dataset.status;
    render();
  });

  els.filterCat.addEventListener("change", () => {
    state.category = els.filterCat.value;
    render();
  });

  els.filterPri.addEventListener("change", () => {
    state.priority = els.filterPri.value;
    render();
  });

  let searchT;
  els.search.addEventListener("input", () => {
    clearTimeout(searchT);
    searchT = setTimeout(() => {
      state.query = els.search.value.trim();
      render();
    }, 180);
  });

  document.getElementById("clear-done").addEventListener("click", () => {
    const before = state.tasks.length;
    state.tasks = state.tasks.filter((t) => !t.done);
    if (state.tasks.length === before) {
      showToast("No hay completadas");
      return;
    }
    saveTasks();
    render();
    showToast("Completadas eliminadas");
  });

  document.getElementById("clear-all").addEventListener("click", () => {
    if (!state.tasks.length) return;
    if (!confirm("¿Eliminar todas las tareas?")) return;
    state.tasks = [];
    saveTasks();
    render();
    showToast("Lista vacía");
  });

  // Seed demo si vacío (solo primera visita)
  if (!state.tasks.length && !localStorage.getItem(STORAGE_KEY + "_seeded")) {
    const today = new Date();
    const iso = (d) => d.toISOString().slice(0, 10);
    const next = new Date(today);
    next.setDate(next.getDate() + 2);
    state.tasks = [
      {
        id: uid(),
        title: "Revisar diseño del portafolio",
        category: "trabajo",
        priority: "high",
        due: iso(today),
        done: false,
        created: Date.now(),
      },
      {
        id: uid(),
        title: "Leer documentación de LocalStorage",
        category: "estudio",
        priority: "medium",
        due: iso(next),
        done: false,
        created: Date.now() - 1,
      },
      {
        id: uid(),
        title: "Entrenamiento 30 min",
        category: "salud",
        priority: "low",
        due: null,
        done: true,
        created: Date.now() - 2,
      },
    ];
    saveTasks();
    localStorage.setItem(STORAGE_KEY + "_seeded", "1");
  }

  render();
  els.title.focus();
})();
