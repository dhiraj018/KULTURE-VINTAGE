// Catalog inventory representing KULTURE VINTAGE drops
const catalog = [
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

let cart = [];
let selectedSizes = {};

// Rendering engine
function renderCatalog(items) {
  const grid = document.getElementById('product-grid');
  if (!grid) return;
  grid.innerHTML = '';

  items.forEach(p => {
    if (!selectedSizes[p.id]) {
      selectedSizes[p.id] = p.sizes[0];
    }

    const card = document.createElement('div');
    card.className = 'product-card';
    card.innerHTML = `
      <span class="card-badge">${p.badge}</span>
      <div class="card-image-wrap">
        <img src="${p.image}" alt="${p.title}" loading="lazy" />
      </div>
      <div class="card-info">
        <span class="card-category">${p.category}</span>
        <h4 class="card-title">${p.title}</h4>
        <div class="price-row">
          <span class="current-price">₹${p.price}</span>
          <span class="orig-price">₹${p.originalPrice}</span>
        </div>
        <div class="size-select-row">
          ${p.sizes.map(s => `
            <button class="size-chip ${selectedSizes[p.id] === s ? 'active' : ''}" 
                    onclick="selectSize('${p.id}', '${s}')">${s}</button>
          `).join('')}
        </div>
        <button class="add-btn" onclick="addToCart('${p.id}')">ADD TO BAG</button>
      </div>
    `;
    grid.appendChild(card);
  });
}

function selectSize(productId, size) {
  selectedSizes[productId] = size;
  renderCatalog(catalog);
}

function addToCart(productId) {
  const item = catalog.find(p => p.id === productId);
  const chosenSize = selectedSizes[productId] || item.sizes[0];
  
  cart.push({
    ...item,
    chosenSize
  });

  updateCartUI();
  toggleCart(true);
}

function updateCartUI() {
  const countEl = document.getElementById('cart-count');
  if (countEl) countEl.innerText = cart.length;

  const container = document.getElementById('cart-items');
  if (!container) return;
  container.innerHTML = '';

  let subtotal = 0;

  cart.forEach((item, index) => {
    subtotal += item.price;
    const el = document.createElement('div');
    el.className = 'cart-item';
    el.innerHTML = `
      <div>
        <p style="font-size:13px; font-weight:700;">${item.title}</p>
        <span style="font-size:11px; color:#94a3b8;">Size: ${item.chosenSize} | ₹${item.price}</span>
      </div>
      <button onclick="removeFromCart(${index})" style="background:none; border:none; color:#e11d48; cursor:pointer;">✕</button>
    `;
    container.appendChild(el);
  });

  const subtotalEl = document.getElementById('cart-subtotal');
  if (subtotalEl) subtotalEl.innerText = `₹${subtotal}`;
}

function removeFromCart(index) {
  cart.splice(index, 1);
  updateCartUI();
}

function toggleCart(forceOpen = false) {
  const drawer = document.getElementById('cart-drawer');
  const backdrop = document.getElementById('backdrop');

  if (!drawer || !backdrop) return;

  if (forceOpen || !drawer.classList.contains('open')) {
    drawer.classList.add('open');
    backdrop.classList.add('open');
  } else {
    drawer.classList.remove('open');
    backdrop.classList.remove('open');
  }
}

function filterCatalog(cat) {
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.classList.toggle('active', btn.innerText === cat);
  });

  if (cat === 'All') {
    renderCatalog(catalog);
  } else {
    renderCatalog(catalog.filter(p => p.category.toLowerCase().includes(cat.toLowerCase())));
  }
}