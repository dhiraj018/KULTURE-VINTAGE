const INITIAL_CATALOG = [
  { id: "KV-001", title: "Ribbed Henley Long Sleeve - Slate Grey", category: "Henleys", price: 1199, originalPrice: 1699, sizes: ["M", "L", "XL"], image: "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=600&auto=format&fit=crop&q=80", badge: "Trending" },
  { id: "KV-002", title: "Skeleton Ribcage Knit Sweater - Phantom Black", category: "Knitwear", price: 1799, originalPrice: 2499, sizes: ["Free Size", "Oversized"], image: "https://images.unsplash.com/photo-1578587018452-892bacefd3f2?w=600&auto=format&fit=crop&q=80", badge: "Limited Drop" }
];

let currentCatalog = INITIAL_CATALOG; // Starts with defaults, instantly overwritten by Firebase
let cart = JSON.parse(localStorage.getItem("kv_cart") || "[]");
let selectedSizes = {};
let activeCategory = "All";

// Push new products directly to Firebase instead of local storage
function saveCatalog(items) {
  window.STORE_DOC.set({ catalog: items }, { merge: true });
}

function renderCatalogGrid() {
  const grid = document.getElementById("product-grid");
  if (!grid) return;
  grid.innerHTML = "";

  const currentUser = JSON.parse(localStorage.getItem("kv_user") || "null");
  const isAdmin = currentUser && currentUser.role === "admin";

  const filteredItems = activeCategory === "All"
    ? currentCatalog
    : currentCatalog.filter(p => p.category.toLowerCase().includes(activeCategory.toLowerCase()));

  if (filteredItems.length === 0) {
    grid.innerHTML = `<p style="color:var(--text-dim); grid-column: 1/-1; text-align:center; padding: 40px 0;">No drops currently in this category.</p>`;
    return;
  }

  filteredItems.forEach(p => {
    if (!selectedSizes[p.id]) selectedSizes[p.id] = p.sizes[0] || "Free Size";

    const card = document.createElement("div");
    card.className = "product-card";
    const deleteBtnHtml = isAdmin ? `<button class="card-delete-icon" data-delete-id="${p.id}" title="Remove piece">✕</button>` : "";

    card.innerHTML = `
      <span class="card-badge">${p.badge || "Vault"}</span>
      ${deleteBtnHtml}
      <div class="card-image-wrap"><img src="${p.image}" alt="${p.title}" loading="lazy" /></div>
      <div class="card-info">
        <span class="card-category">${p.category}</span>
        <h4 class="card-title">${p.title}</h4>
        <div class="price-row">
          <span class="current-price">₹${p.price}</span>
          <span class="orig-price">₹${p.originalPrice || p.price + 400}</span>
        </div>
        <div class="size-select-row">
          ${p.sizes.map(s => `<button type="button" class="size-chip ${selectedSizes[p.id] === s ? 'active' : ''}" data-product="${p.id}" data-size="${s}">${s}</button>`).join('')}
        </div>
        <button type="button" class="add-btn" data-add-id="${p.id}">ADD TO BAG</button>
      </div>
    `;
    grid.appendChild(card);
  });
}

function updateCartUI() {
  const countEl = document.getElementById("cart-count");
  if (countEl) countEl.innerText = cart.length;

  const container = document.getElementById("cart-items");
  if (!container) return;
  container.innerHTML = "";
  let subtotal = 0;

  if (cart.length === 0) {
    container.innerHTML = `<p style="color:var(--text-dim); text-align:center; margin-top: 40px;">Your bag is empty.</p>`;
  } else {
    cart.forEach((item, index) => {
      subtotal += Number(item.price);
      const row = document.createElement("div");
      row.className = "cart-item";
      row.innerHTML = `
        <div>
          <p style="font-size:13px; font-weight:700;">${item.title}</p>
          <span style="font-size:11px; color:var(--text-dim);">Size: ${item.chosenSize} | ₹${item.price}</span>
        </div>
        <button type="button" class="cart-remove-btn" data-remove-index="${index}" style="background:none; border:none; color:var(--accent); cursor:pointer; font-weight:700;">✕</button>
      `;
      container.appendChild(row);
    });
  }
  const subtotalEl = document.getElementById("cart-subtotal");
  if (subtotalEl) subtotalEl.innerText = `₹${subtotal}`;
  localStorage.setItem("kv_cart", JSON.stringify(cart));
}

function toggleCartDrawer(openState) {
  const drawer = document.getElementById("cart-drawer");
  const backdrop = document.getElementById("backdrop");
  if (!drawer || !backdrop) return;
  const shouldOpen = openState !== undefined ? openState : !drawer.classList.contains("open");
  if (shouldOpen) {
    drawer.classList.add("open");
    backdrop.classList.add("open");
  } else {
    drawer.classList.remove("open");
    if (!document.getElementById("auth-modal").classList.contains("open")) backdrop.classList.remove("open");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  renderCatalogGrid();
  updateCartUI();

  const filterButtons = document.querySelectorAll(".filter-btn");
  filterButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      filterButtons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      activeCategory = btn.getAttribute("data-category");
      renderCatalogGrid();
    });
  });

  document.addEventListener("click", (e) => {
    if (e.target.classList.contains("size-chip")) {
      selectedSizes[e.target.getAttribute("data-product")] = e.target.getAttribute("data-size");
      renderCatalogGrid();
      return;
    }
    if (e.target.hasAttribute("data-add-id")) {
      const pid = e.target.getAttribute("data-add-id");
      const product = currentCatalog.find(p => p.id === pid);
      if (product) {
        cart.push({ ...product, chosenSize: selectedSizes[pid] || product.sizes[0] || "Free Size" });
        updateCartUI();
        toggleCartDrawer(true);
      }
      return;
    }
    if (e.target.classList.contains("cart-remove-btn")) {
      cart.splice(parseInt(e.target.getAttribute("data-remove-index"), 10), 1);
      updateCartUI();
      return;
    }
    if (e.target.classList.contains("card-delete-icon")) {
      if (confirm(`Remove this drop from cloud inventory?`)) {
        currentCatalog = currentCatalog.filter(p => p.id !== e.target.getAttribute("data-delete-id"));
        saveCatalog(currentCatalog); // Pushes deletion to Firebase instantly
      }
      return;
    }
  });

  document.getElementById("cart-trigger-btn")?.addEventListener("click", () => toggleCartDrawer(true));
  document.getElementById("cart-close-btn")?.addEventListener("click", () => toggleCartDrawer(false));
});
