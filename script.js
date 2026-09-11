/**
 * KULTURE VINTAGE - Core Catalog & Bag Engine
 */

const INITIAL_CATALOG = [
  {
    id: "KV-001",
    title: "Ribbed Henley Long Sleeve - Slate Grey",
    category: "Henleys",
    price: 1199,
    originalPrice: 1699,
    sizes: ["M", "L", "XL"],
    image: "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=600&auto=format&fit=crop&q=80",
    badge: "Trending"
  },
  {
    id: "KV-002",
    title: "Skeleton Ribcage Knit Sweater - Phantom Black",
    category: "Knitwear",
    price: 1799,
    originalPrice: 2499,
    sizes: ["Free Size", "Oversized"],
    image: "https://images.unsplash.com/photo-1578587018452-892bacefd3f2?w=600&auto=format&fit=crop&q=80",
    badge: "Limited Drop"
  },
  {
    id: "KV-003",
    title: "Vintage Wash Boxy Workwear Shirt - Crimson",
    category: "Shirts",
    price: 1399,
    originalPrice: 1999,
    sizes: ["S", "M", "L", "XL"],
    image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&auto=format&fit=crop&q=80",
    badge: "Staff Pick"
  },
  {
    id: "KV-004",
    title: "'Hear No Warning' Gothic Graphic Longsleeve",
    category: "Longsleeve",
    price: 1299,
    originalPrice: 1799,
    sizes: ["M", "L", "XL", "XXL"],
    image: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=600&auto=format&fit=crop&q=80",
    badge: "Bestseller"
  },
  {
    id: "KV-005",
    title: "Waffle Knit Thermal Pullover - Heather Chalk",
    category: "Waffle Knit",
    price: 1249,
    originalPrice: 1699,
    sizes: ["M", "L", "XL"],
    image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600&auto=format&fit=crop&q=80",
    badge: "New"
  },
  {
    id: "KV-006",
    title: "Heavyweight Plain Crew Drop - Maroon Wash",
    category: "Oversized",
    price: 899,
    originalPrice: 1299,
    sizes: ["S", "M", "L", "XL"],
    image: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600&auto=format&fit=crop&q=80",
    badge: "Essential"
  }
];

function getActiveCatalog() {
  const saved = localStorage.getItem("kv_catalog");
  if (!saved) {
    localStorage.setItem("kv_catalog", JSON.stringify(INITIAL_CATALOG));
    return INITIAL_CATALOG;
  }
  return JSON.parse(saved);
}

function saveCatalog(items) {
  localStorage.setItem("kv_catalog", JSON.stringify(items));
}

let currentCatalog = getActiveCatalog();
let cart = JSON.parse(localStorage.getItem("kv_cart") || "[]");
let selectedSizes = {};
let activeCategory = "All";

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
    if (!selectedSizes[p.id]) {
      selectedSizes[p.id] = p.sizes && p.sizes.length > 0 ? p.sizes[0] : "Free Size";
    }

    const card = document.createElement("div");
    card.className = "product-card";

    const deleteBtnHtml = isAdmin 
      ? `<button class="card-delete-icon" data-delete-id="${p.id}" title="Remove piece">✕</button>` 
      : "";

    card.innerHTML = `
      <span class="card-badge">${p.badge || "Vault"}</span>
      ${deleteBtnHtml}
      <div class="card-image-wrap">
        <img src="${p.image}" alt="${p.title}" loading="lazy" />
      </div>
      <div class="card-info">
        <span class="card-category">${p.category}</span>
        <h4 class="card-title">${p.title}</h4>
        <div class="price-row">
          <span class="current-price">₹${p.price}</span>
          <span class="orig-price">₹${p.originalPrice || p.price + 400}</span>
        </div>
        <div class="size-select-row">
          ${p.sizes.map(s => `
            <button type="button" class="size-chip ${selectedSizes[p.id] === s ? 'active' : ''}" data-product="${p.id}" data-size="${s}">${s}</button>
          `).join('')}
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
    if (!document.getElementById("auth-modal").classList.contains("open")) {
      backdrop.classList.remove("open");
    }
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
      const pid = e.target.getAttribute("data-product");
      const size = e.target.getAttribute("data-size");
      selectedSizes[pid] = size;
      renderCatalogGrid();
      return;
    }

    if (e.target.hasAttribute("data-add-id")) {
      const pid = e.target.getAttribute("data-add-id");
      const product = currentCatalog.find(p => p.id === pid);
      if (product) {
        const chosenSize = selectedSizes[pid] || product.sizes[0] || "Free Size";
        cart.push({ ...product, chosenSize });
        updateCartUI();
        toggleCartDrawer(true);
      }
      return;
    }

    if (e.target.classList.contains("cart-remove-btn")) {
      const idx = parseInt(e.target.getAttribute("data-remove-index"), 10);
      cart.splice(idx, 1);
      updateCartUI();
      return;
    }

    if (e.target.classList.contains("card-delete-icon")) {
      const pid = e.target.getAttribute("data-delete-id");
      if (confirm(`Remove this drop (${pid}) from store inventory?`)) {
        currentCatalog = currentCatalog.filter(p => p.id !== pid);
        saveCatalog(currentCatalog);
        renderCatalogGrid();
        if (typeof renderAdminTables === "function") renderAdminTables();
      }
      return;
    }
  });

  const cartTrigger = document.getElementById("cart-trigger-btn");
  const cartClose = document.getElementById("cart-close-btn");
  if (cartTrigger) cartTrigger.addEventListener("click", () => toggleCartDrawer(true));
  if (cartClose) cartClose.addEventListener("click", () => toggleCartDrawer(false));
});