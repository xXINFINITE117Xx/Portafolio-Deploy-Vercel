/**
 * Neon Shop — E-Commerce UI Demo
 * Carrito, filtros, búsqueda, modal de producto
 */
(function () {
  "use strict";

  const PRODUCTS = [
    {
      id: 1,
      name: "Auriculares Neon X1",
      cat: "audio",
      price: 129.99,
      oldPrice: 159.99,
      icon: "🎧",
      badge: "sale",
      desc: "Sonido espacial 7.1 con iluminación RGB cian-rosa y cancelación activa de ruido.",
    },
    {
      id: 2,
      name: "Smartwatch Pulse",
      cat: "wearables",
      price: 199.0,
      oldPrice: null,
      icon: "⌚",
      badge: "new",
      desc: "Monitor cardíaco, GPS y pantalla AMOLED siempre activa. Autonomía de 7 días.",
    },
    {
      id: 3,
      name: "Teclado Mech Cyber",
      cat: "gaming",
      price: 89.5,
      oldPrice: 110,
      icon: "⌨️",
      badge: "sale",
      desc: "Switches hot-swap, keycaps PBT y barra de luz direccionable por software.",
    },
    {
      id: 4,
      name: "Mouse Pro Glide",
      cat: "gaming",
      price: 59.99,
      oldPrice: null,
      icon: "🖱️",
      badge: null,
      desc: "Sensor 26K DPI, peso ajustable y cable paracord de baja fricción.",
    },
    {
      id: 5,
      name: "Altavoz Orbital",
      cat: "audio",
      price: 79.0,
      oldPrice: null,
      icon: "🔊",
      badge: "new",
      desc: "360° de audio con graves profundos y emparejamiento Bluetooth 5.3.",
    },
    {
      id: 6,
      name: "Gafas AR Nova",
      cat: "wearables",
      price: 349.0,
      oldPrice: 399,
      icon: "🕶️",
      badge: "sale",
      desc: "Realidad aumentada ligera, notificaciones y navegación hands-free.",
    },
    {
      id: 7,
      name: "Hub USB-C Titan",
      cat: "tech",
      price: 45.0,
      oldPrice: null,
      icon: "🔌",
      badge: null,
      desc: "7 puertos, carga 100W PD y carcasa de aluminio aeroespacial.",
    },
    {
      id: 8,
      name: "SSD Neon 1TB",
      cat: "tech",
      price: 119.99,
      oldPrice: 149,
      icon: "💾",
      badge: "sale",
      desc: "NVMe Gen4 hasta 7000 MB/s con disipador RGB sincronizable.",
    },
    {
      id: 9,
      name: "Control Dual Wave",
      cat: "gaming",
      price: 69.99,
      oldPrice: null,
      icon: "🎮",
      badge: "new",
      desc: "Haptic feedback avanzado, gatillos adaptativos y 30h de batería.",
    },
    {
      id: 10,
      name: "Mic Stream Pro",
      cat: "audio",
      price: 99.0,
      oldPrice: null,
      icon: "🎙️",
      badge: null,
      desc: "Condensador cardioide, filtro pop integrado y montura anti-vibración.",
    },
    {
      id: 11,
      name: "Band Fitness Flex",
      cat: "wearables",
      price: 39.99,
      oldPrice: 49.99,
      icon: "📿",
      badge: "sale",
      desc: "Resistente al agua, sueño y SpO2. App con entrenamiento guiado.",
    },
    {
      id: 12,
      name: "Lámpara Desk Aura",
      cat: "tech",
      price: 54.5,
      oldPrice: null,
      icon: "💡",
      badge: null,
      desc: "Temperatura de color ajustable, modo foco y sincronización neón.",
    },
  ];

  const state = {
    category: "all",
    maxPrice: 500,
    sort: "featured",
    query: "",
    cart: loadCart(),
  };

  const els = {
    grid: document.getElementById("products-grid"),
    count: document.getElementById("results-count"),
    empty: document.getElementById("empty-state"),
    search: document.getElementById("search-input"),
    priceRange: document.getElementById("price-range"),
    priceValue: document.getElementById("price-value"),
    sort: document.getElementById("sort-select"),
    cartDrawer: document.getElementById("cart-drawer"),
    cartOverlay: document.getElementById("cart-overlay"),
    cartItems: document.getElementById("cart-items"),
    cartBadge: document.getElementById("cart-badge"),
    cartTotal: document.getElementById("cart-total"),
    checkoutBtn: document.getElementById("checkout-btn"),
    filters: document.getElementById("filters"),
    modalOverlay: document.getElementById("modal-overlay"),
    modalBody: document.getElementById("modal-body"),
    toast: document.getElementById("toast"),
    checkoutOverlay: document.getElementById("checkout-overlay"),
  };

  function loadCart() {
    try {
      return JSON.parse(localStorage.getItem("neonShopCart") || "[]");
    } catch {
      return [];
    }
  }

  function saveCart() {
    localStorage.setItem("neonShopCart", JSON.stringify(state.cart));
  }

  function filteredProducts() {
    let list = PRODUCTS.filter((p) => {
      if (state.category !== "all" && p.cat !== state.category) return false;
      if (p.price > state.maxPrice) return false;
      if (state.query) {
        const q = state.query.toLowerCase();
        if (!p.name.toLowerCase().includes(q) && !p.cat.includes(q))
          return false;
      }
      return true;
    });

    switch (state.sort) {
      case "price-asc":
        list.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        list.sort((a, b) => b.price - a.price);
        break;
      case "name":
        list.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        break;
    }
    return list;
  }

  function renderProducts() {
    const list = filteredProducts();
    els.count.textContent =
      list.length + (list.length === 1 ? " producto" : " productos");

    if (!list.length) {
      els.grid.innerHTML = "";
      els.empty.classList.remove("hidden");
      return;
    }
    els.empty.classList.add("hidden");

    els.grid.innerHTML = list
      .map(
        (p) => `
      <article class="product-card" data-id="${p.id}">
        <div class="product-media" data-action="detail">
          ${p.badge ? `<span class="badge ${p.badge}">${p.badge === "new" ? "Nuevo" : "Oferta"}</span>` : ""}
          <span aria-hidden="true">${p.icon}</span>
        </div>
        <div class="product-info">
          <span class="product-cat">${p.cat}</span>
          <h3 class="product-name" data-action="detail">${p.name}</h3>
          <div class="product-price-row">
            <span class="product-price">$${p.price.toFixed(2)}</span>
            ${p.oldPrice ? `<span class="product-old-price">$${p.oldPrice.toFixed(2)}</span>` : ""}
          </div>
          <button class="add-btn" data-action="add">Añadir al carrito</button>
        </div>
      </article>`,
      )
      .join("");
  }

  function cartCount() {
    return state.cart.reduce((n, i) => n + i.qty, 0);
  }

  function cartTotal() {
    return state.cart.reduce((sum, i) => {
      const p = PRODUCTS.find((x) => x.id === i.id);
      return sum + (p ? p.price * i.qty : 0);
    }, 0);
  }

  function renderCart() {
    els.cartBadge.textContent = cartCount();
    els.cartTotal.textContent = "$" + cartTotal().toFixed(2);
    els.checkoutBtn.disabled = state.cart.length === 0;

    if (!state.cart.length) {
      els.cartItems.innerHTML =
        '<p class="cart-empty">Tu carrito está vacío</p>';
      return;
    }

    els.cartItems.innerHTML = state.cart
      .map((item) => {
        const p = PRODUCTS.find((x) => x.id === item.id);
        if (!p) return "";
        return `
        <div class="cart-item" data-id="${p.id}">
          <div class="cart-item-icon">${p.icon}</div>
          <div>
            <div class="cart-item-name">${p.name}</div>
            <div class="cart-item-price">$${p.price.toFixed(2)}</div>
            <div class="qty-controls">
              <button class="qty-btn" data-action="dec" aria-label="Menos">−</button>
              <span class="qty-val">${item.qty}</span>
              <button class="qty-btn" data-action="inc" aria-label="Más">+</button>
            </div>
          </div>
          <button class="cart-item-remove" data-action="remove" aria-label="Eliminar">
            <i class="fas fa-trash-alt"></i>
          </button>
        </div>`;
      })
      .join("");
  }

  function addToCart(id) {
    const existing = state.cart.find((i) => i.id === id);
    if (existing) existing.qty++;
    else state.cart.push({ id, qty: 1 });
    saveCart();
    renderCart();
    showToast("Añadido al carrito");
  }

  function updateQty(id, delta) {
    const item = state.cart.find((i) => i.id === id);
    if (!item) return;
    item.qty += delta;
    if (item.qty <= 0) state.cart = state.cart.filter((i) => i.id !== id);
    saveCart();
    renderCart();
  }

  function removeFromCart(id) {
    state.cart = state.cart.filter((i) => i.id !== id);
    saveCart();
    renderCart();
  }

  function openCart() {
    els.cartDrawer.classList.add("open");
    els.cartOverlay.classList.add("open");
    els.cartDrawer.setAttribute("aria-hidden", "false");
  }

  function closeCart() {
    els.cartDrawer.classList.remove("open");
    els.cartOverlay.classList.remove("open");
    els.cartDrawer.setAttribute("aria-hidden", "true");
  }

  function openModal(id) {
    const p = PRODUCTS.find((x) => x.id === id);
    if (!p) return;
    els.modalBody.innerHTML = `
      <div class="modal-media"><span>${p.icon}</span></div>
      <div class="modal-details">
        <span class="product-cat">${p.cat}</span>
        <h2>${p.name}</h2>
        <p class="modal-desc">${p.desc}</p>
        <div class="modal-price">$${p.price.toFixed(2)}
          ${p.oldPrice ? `<span class="product-old-price" style="font-size:0.9rem;margin-left:0.5rem">$${p.oldPrice.toFixed(2)}</span>` : ""}
        </div>
        <button class="btn-primary btn-block" data-add-modal="${p.id}">Añadir al carrito</button>
      </div>`;
    els.modalOverlay.classList.remove("hidden");
  }

  function closeModal() {
    els.modalOverlay.classList.add("hidden");
  }

  function showToast(msg) {
    els.toast.textContent = msg;
    els.toast.classList.remove("hidden");
    requestAnimationFrame(() => els.toast.classList.add("show"));
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => {
      els.toast.classList.remove("show");
      setTimeout(() => els.toast.classList.add("hidden"), 300);
    }, 2000);
  }

  // Events
  els.grid.addEventListener("click", (e) => {
    const card = e.target.closest(".product-card");
    if (!card) return;
    const id = parseInt(card.dataset.id, 10);
    const action = e.target.closest("[data-action]")?.dataset.action;
    if (action === "add") addToCart(id);
    else if (action === "detail") openModal(id);
  });

  els.cartItems.addEventListener("click", (e) => {
    const row = e.target.closest(".cart-item");
    if (!row) return;
    const id = parseInt(row.dataset.id, 10);
    const action = e.target.closest("[data-action]")?.dataset.action;
    if (action === "inc") updateQty(id, 1);
    if (action === "dec") updateQty(id, -1);
    if (action === "remove") removeFromCart(id);
  });

  els.modalBody.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-add-modal]");
    if (btn) {
      addToCart(parseInt(btn.dataset.addModal, 10));
      closeModal();
      openCart();
    }
  });

  document.getElementById("cart-toggle").addEventListener("click", openCart);
  document.getElementById("cart-close").addEventListener("click", closeCart);
  els.cartOverlay.addEventListener("click", closeCart);

  document.getElementById("modal-close").addEventListener("click", closeModal);
  els.modalOverlay.addEventListener("click", (e) => {
    if (e.target === els.modalOverlay) closeModal();
  });

  document.getElementById("clear-cart").addEventListener("click", () => {
    state.cart = [];
    saveCart();
    renderCart();
    showToast("Carrito vacío");
  });

  els.checkoutBtn.addEventListener("click", () => {
    if (!state.cart.length) return;
    state.cart = [];
    saveCart();
    renderCart();
    closeCart();
    els.checkoutOverlay.classList.remove("hidden");
  });

  document.getElementById("checkout-done").addEventListener("click", () => {
    els.checkoutOverlay.classList.add("hidden");
  });

  // Filters
  document.getElementById("category-filters").addEventListener("click", (e) => {
    const chip = e.target.closest(".chip");
    if (!chip) return;
    document
      .querySelectorAll("#category-filters .chip")
      .forEach((c) => c.classList.remove("active"));
    chip.classList.add("active");
    state.category = chip.dataset.cat;
    renderProducts();
  });

  els.priceRange.addEventListener("input", () => {
    state.maxPrice = parseInt(els.priceRange.value, 10);
    els.priceValue.textContent = "$" + state.maxPrice;
    renderProducts();
  });

  els.sort.addEventListener("change", () => {
    state.sort = els.sort.value;
    renderProducts();
  });

  let searchTimer;
  els.search.addEventListener("input", () => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
      state.query = els.search.value.trim();
      renderProducts();
    }, 200);
  });

  function resetFilters() {
    state.category = "all";
    state.maxPrice = 500;
    state.sort = "featured";
    state.query = "";
    els.priceRange.value = 500;
    els.priceValue.textContent = "$500";
    els.sort.value = "featured";
    els.search.value = "";
    document.querySelectorAll("#category-filters .chip").forEach((c) => {
      c.classList.toggle("active", c.dataset.cat === "all");
    });
    renderProducts();
  }

  document
    .getElementById("reset-filters")
    .addEventListener("click", resetFilters);
  document
    .getElementById("empty-reset")
    .addEventListener("click", resetFilters);

  // Mobile filters
  document.getElementById("filter-toggle").addEventListener("click", () => {
    els.filters.classList.add("open");
    els.cartOverlay.classList.add("open");
  });
  document.getElementById("close-filters").addEventListener("click", () => {
    els.filters.classList.remove("open");
    if (!els.cartDrawer.classList.contains("open"))
      els.cartOverlay.classList.remove("open");
  });
  els.cartOverlay.addEventListener("click", () => {
    els.filters.classList.remove("open");
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeCart();
      closeModal();
      els.filters.classList.remove("open");
      els.checkoutOverlay.classList.add("hidden");
      els.cartOverlay.classList.remove("open");
    }
  });

  // Init
  renderProducts();
  renderCart();
})();
