/**
 * KULTURE VINTAGE - Admin Suite, Dynamic Settings & WhatsApp Gateway
 */

const DEFAULT_CONFIG = {
  brandName: "KULTURE VINTAGE",
  phone: "919876543210", // Updated permanently via Admin HQ
  tagline: "PAIN TO PURPOSE",
  branches: "CAMP • VIMAN NAGAR • PCMC • KOTHRUD | PAN-INDIA DISPATCH 📦",
  logoUrl: "https://images.unsplash.com/photo-1555529771-835f59fc5efe?w=100&auto=format&fit=crop&q=80",
  adminSecretPin: "9999" // Master Admin PIN
};

// LocalStorage Persistent Settings Engine
function getStoreSettings() {
  const saved = localStorage.getItem("kv_store_settings");
  if (!saved) {
    localStorage.setItem("kv_store_settings", JSON.stringify(DEFAULT_CONFIG));
    return DEFAULT_CONFIG;
  }
  return JSON.parse(saved);
}

function saveStoreSettings(settings) {
  localStorage.setItem("kv_store_settings", JSON.stringify(settings));
  applyStoreSettings();
}

function applyStoreSettings() {
  const cfg = getStoreSettings();

  const logoImg = document.getElementById("brand-logo");
  if (logoImg && cfg.logoUrl) {
    logoImg.src = cfg.logoUrl;
    logoImg.style.display = "block";
  }

  const taglineEl = document.getElementById("display-brand-tagline");
  if (taglineEl) taglineEl.innerText = cfg.tagline;

  const topBanner = document.getElementById("top-announcement-bar");
  if (topBanner) topBanner.innerText = cfg.branches;

  // Pre-fill Admin customizer inputs
  const inputLogo = document.getElementById("setting-logo-url");
  const inputPhone = document.getElementById("setting-phone");
  const inputTagline = document.getElementById("setting-tagline");
  const inputBranches = document.getElementById("setting-branches");

  if (inputLogo) inputLogo.value = cfg.logoUrl.startsWith("data:") ? "" : cfg.logoUrl;
  if (inputPhone) inputPhone.value = cfg.phone;
  if (inputTagline) inputTagline.value = cfg.tagline;
  if (inputBranches) inputBranches.value = cfg.branches;
}

// CRM Data Storage
function getCRMData() {
  const defaultCustomers = [
    { name: "Aarav Deshmukh", phone: "9822011223", pin: "1234", address: "Koregaon Park, Lane 7, Pune 411001", ordersCount: 4, totalSpent: 6290, tier: "vip" },
    { name: "Siddharth Joshi", phone: "9890123456", pin: "4321", address: "FC Road, Deccan, Pune 411004", ordersCount: 1, totalSpent: 1199, tier: "regular" },
    { name: "Unknown User", phone: "9000000000", pin: "0000", address: "Viman Nagar, Pune", ordersCount: 0, totalSpent: 0, tier: "flagged" }
  ];
  return JSON.parse(localStorage.getItem("kv_crm_users") || JSON.stringify(defaultCustomers));
}

function saveCRMData(data) {
  localStorage.setItem("kv_crm_users", JSON.stringify(data));
}

function getOrderLogs() {
  const defaultOrders = [
    { id: "KV-782910", customer: "Aarav Deshmukh", phone: "9822011223", items: "Ribbed Henley (M), Waffle Pullover (L)", total: 2448, status: "Dispatched" }
  ];
  return JSON.parse(localStorage.getItem("kv_order_logs") || JSON.stringify(defaultOrders));
}

function saveOrderLogs(data) {
  localStorage.setItem("kv_order_logs", JSON.stringify(data));
}

// User & Role State
function getCurrentUser() {
  return JSON.parse(localStorage.getItem("kv_user") || "null");
}

function setCurrentUser(user) {
  if (user) {
    localStorage.setItem("kv_user", JSON.stringify(user));
  } else {
    localStorage.removeItem("kv_user");
  }
  syncAuthUI();
}

function syncAuthUI() {
  const user = getCurrentUser();
  const authTrigger = document.getElementById("auth-trigger-btn");
  const adminPanelBtn = document.getElementById("admin-panel-btn");
  const loggedOutView = document.getElementById("auth-logged-out-view");
  const loggedInView = document.getElementById("auth-logged-in-view");

  if (user) {
    if (authTrigger) authTrigger.innerText = user.name.split(" ")[0].toUpperCase();
    if (loggedOutView) loggedOutView.style.display = "none";
    if (loggedInView) loggedInView.style.display = "block";

    document.getElementById("profile-display-name").innerText = user.name;
    document.getElementById("profile-display-phone").innerText = user.phone || "";
    document.getElementById("profile-display-address").innerText = user.address || "";

    const roleBadge = document.getElementById("profile-display-role");
    if (user.role === "admin") {
      roleBadge.innerText = "STORE MANAGER (ADMIN)";
      roleBadge.className = "user-role-badge tag-vip";
      if (adminPanelBtn) adminPanelBtn.style.display = "inline-block";
    } else {
      roleBadge.innerText = (user.tier || "REGULAR").toUpperCase() + " BUYER";
      roleBadge.className = "user-role-badge tag-regular";
      if (adminPanelBtn) adminPanelBtn.style.display = "none";
    }

    if (document.getElementById("cust-name")) document.getElementById("cust-name").value = user.name;
    if (document.getElementById("cust-phone")) document.getElementById("cust-phone").value = user.phone;
    if (document.getElementById("cust-address")) document.getElementById("cust-address").value = user.address;
  } else {
    if (authTrigger) authTrigger.innerText = "SIGN IN";
    if (loggedOutView) loggedOutView.style.display = "block";
    if (loggedInView) loggedInView.style.display = "none";
    if (adminPanelBtn) adminPanelBtn.style.display = "none";
  }

  if (typeof renderCatalogGrid === "function") renderCatalogGrid();
}

function toggleAuthModal(openState) {
  const modal = document.getElementById("auth-modal");
  const backdrop = document.getElementById("backdrop");
  if (!modal || !backdrop) return;

  const shouldOpen = openState !== undefined ? openState : !modal.classList.contains("open");
  if (shouldOpen) {
    modal.classList.add("open");
    backdrop.classList.add("open");
  } else {
    modal.classList.remove("open");
    if (!document.getElementById("cart-drawer").classList.contains("open")) {
      backdrop.classList.remove("open");
    }
  }
}

function toggleAdminView(showAdmin) {
  const storeView = document.getElementById("storefront-view");
  const heroView = document.querySelector(".hero");
  const adminView = document.getElementById("admin-view");

  if (showAdmin) {
    storeView.style.display = "none";
    heroView.style.display = "none";
    adminView.style.display = "block";
    applyStoreSettings();
    renderAdminTables();
  } else {
    storeView.style.display = "block";
    heroView.style.display = "block";
    adminView.style.display = "none";
  }
}

function renderAdminTables() {
  const customers = getCRMData();
  const orders = getOrderLogs();
  const catalog = (typeof currentCatalog !== "undefined") ? currentCatalog : [];

  const totalRev = orders.reduce((sum, o) => sum + Number(o.total), 0);
  document.getElementById("stat-revenue").innerText = `₹${totalRev.toLocaleString('en-IN')}`;
  document.getElementById("stat-orders").innerText = orders.length;
  document.getElementById("stat-customers").innerText = customers.length;
  document.getElementById("stat-inventory").innerText = catalog.length;

  const custTable = document.getElementById("customer-table-body");
  custTable.innerHTML = "";
  customers.forEach((c, idx) => {
    let tagClass = "tag-regular";
    if (c.tier === "vip") tagClass = "tag-vip";
    if (c.tier === "flagged") tagClass = "tag-flagged";

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><strong>${c.name}</strong></td>
      <td>${c.phone}</td>
      <td style="max-width:200px;">${c.address || 'Not specified'}</td>
      <td>${c.ordersCount || 0}</td>
      <td>₹${(c.totalSpent || 0).toLocaleString('en-IN')}</td>
      <td><span class="tag-badge ${tagClass}">${(c.tier || 'regular').toUpperCase()}</span></td>
      <td>
        <button class="action-row-btn" onclick="toggleCustomerTier(${idx}, 'vip')">VIP</button>
        <button class="action-row-btn" onclick="toggleCustomerTier(${idx}, 'flagged')">Flag</button>
        <button class="action-row-btn" onclick="toggleCustomerTier(${idx}, 'regular')">Reset</button>
      </td>
    `;
    custTable.appendChild(tr);
  });

  const ordersTable = document.getElementById("orders-table-body");
  ordersTable.innerHTML = "";
  orders.forEach((o, idx) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><strong>${o.id}</strong></td>
      <td>${o.customer}<br><small style="color:var(--text-dim);">${o.phone}</small></td>
      <td>${o.items}</td>
      <td>₹${o.total}</td>
      <td><span class="tag-badge tag-regular">${o.status}</span></td>
      <td>
        <button class="action-row-btn" onclick="updateOrderStatus(${idx}, 'Dispatched')">Dispatch</button>
        <button class="action-row-btn" onclick="updateOrderStatus(${idx}, 'Delivered')">Done</button>
      </td>
    `;
    ordersTable.appendChild(tr);
  });
}

window.toggleCustomerTier = function(index, newTier) {
  const customers = getCRMData();
  customers[index].tier = newTier;
  saveCRMData(customers);
  renderAdminTables();
};

window.updateOrderStatus = function(index, newStatus) {
  const orders = getOrderLogs();
  orders[index].status = newStatus;
  saveOrderLogs(orders);
  renderAdminTables();
};

// WhatsApp Order Checkout
function checkoutViaWhatsApp() {
  if (cart.length === 0) {
    alert("Your bag is empty.");
    return;
  }

  const name = document.getElementById("cust-name").value.trim();
  const phone = document.getElementById("cust-phone").value.trim();
  const address = document.getElementById("cust-address").value.trim();

  if (!name || !phone || !address) {
    alert("Please enter your name, WhatsApp number, and delivery address.");
    return;
  }

  const cfg = getStoreSettings();
  const customers = getCRMData();
  const flagged = customers.find(c => c.phone === phone && c.tier === "flagged");
  if (flagged) {
    alert("Notice: This account is flagged for prior non-pickup. Order is subject to physical verification.");
  }

  const orderID = "KV-" + Math.floor(100000 + Math.random() * 900000);
  let total = 0;
  
  const itemsTextList = cart.map(i => {
    total += Number(i.price);
    return `• ${i.title} [Size: ${i.chosenSize}] - ₹${i.price}`;
  }).join("\n");

  let existingCust = customers.find(c => c.phone === phone);
  if (existingCust) {
    existingCust.ordersCount = (existingCust.ordersCount || 0) + 1;
    existingCust.totalSpent = (existingCust.totalSpent || 0) + total;
    existingCust.address = address;
    existingCust.name = name;
  } else {
    customers.push({
      name,
      phone,
      pin: "0000",
      address,
      ordersCount: 1,
      totalSpent: total,
      tier: "regular"
    });
  }
  saveCRMData(customers);

  const orders = getOrderLogs();
  orders.unshift({
    id: orderID,
    customer: name,
    phone,
    items: cart.map(i => `${i.title} (${i.chosenSize})`).join(", "),
    total,
    status: "Pending"
  });
  saveOrderLogs(orders);

  cart = [];
  updateCartUI();
  toggleCartDrawer(false);

  const message = 
`⚡ *NEW ORDER: ${orderID}*
-----------------------------
*Customer Details:*
• Name: ${name}
• WhatsApp: ${phone}
• Delivery Address: ${address}

*Ordered Drops:*
${itemsTextList}

*Order Total:* ₹${total}
*Fulfillment Hub:* ${cfg.branches}
-----------------------------
Please confirm order tracking and provide payment details!`;

  const encoded = encodeURIComponent(message);
  window.open(`https://wa.me/${cfg.phone}?text=${encoded}`, '_blank');
}

// Floating WhatsApp Automated Inquiry
function openWhatsAppInquiry() {
  const cfg = getStoreSettings();
  const message = `Hello KULTURE VINTAGE team! ⚡ I'm browsing your vault drops online and have an inquiry regarding drop availability, sizing, and shipping.`;
  const encoded = encodeURIComponent(message);
  window.open(`https://wa.me/${cfg.phone}?text=${encoded}`, '_blank');
}

// Lifecycle Events
document.addEventListener("DOMContentLoaded", () => {
  applyStoreSettings();
  syncAuthUI();

  document.getElementById("auth-trigger-btn").addEventListener("click", () => toggleAuthModal(true));
  document.getElementById("auth-close-btn").addEventListener("click", () => toggleAuthModal(false));

  const adminBtn = document.getElementById("admin-panel-btn");
  if (adminBtn) adminBtn.addEventListener("click", () => toggleAdminView(true));

  const adminExit = document.getElementById("admin-exit-btn");
  if (adminExit) adminExit.addEventListener("click", () => toggleAdminView(false));

  const homeBtn = document.getElementById("brand-home-btn");
  if (homeBtn) homeBtn.addEventListener("click", () => toggleAdminView(false));

  document.getElementById("backdrop").addEventListener("click", () => {
    toggleCartDrawer(false);
    toggleAuthModal(false);
  });

  // Floating WhatsApp Inquiry Click
  const inquiryBtn = document.getElementById("whatsapp-inquiry-btn");
  if (inquiryBtn) {
    inquiryBtn.addEventListener("click", openWhatsAppInquiry);
  }

  // Live Settings Form Handler (Supports URL or File Upload)
  const settingsForm = document.getElementById("brand-settings-form");
  if (settingsForm) {
    settingsForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const current = getStoreSettings();
      const urlInput = document.getElementById("setting-logo-url").value.trim();
      const fileInput = document.getElementById("setting-logo-file");
      const phoneClean = document.getElementById("setting-phone").value.trim().replace(/[^0-9]/g, '');

      function finalizeSave(logoData) {
        const updated = {
          ...current,
          logoUrl: logoData,
          phone: phoneClean,
          tagline: document.getElementById("setting-tagline").value.trim(),
          branches: document.getElementById("setting-branches").value.trim()
        };
        saveStoreSettings(updated);
        alert("✅ Brand settings saved permanently! Logo and WhatsApp number updated store-wide.");
      }

      // If user uploaded a file from their device
      if (fileInput.files && fileInput.files[0]) {
        const reader = new FileReader();
        reader.onload = function (event) {
          finalizeSave(event.target.result); // Base64 stored permanently
        };
        reader.readAsDataURL(fileInput.files[0]);
      } else if (urlInput) {
        finalizeSave(urlInput);
      } else {
        finalizeSave(current.logoUrl);
      }
    });
  }

  // Strict Login & PIN Check
  document.getElementById("login-submit-btn").addEventListener("click", () => {
    const name = document.getElementById("login-name").value.trim();
    const phone = document.getElementById("login-phone").value.trim();
    const pin = document.getElementById("login-pin").value.trim();
    const address = document.getElementById("login-address").value.trim();

    if (!pin) {
      alert("Security PIN is mandatory. Please enter a 4-digit PIN.");
      return;
    }

    const cfg = getStoreSettings();

    if (pin === cfg.adminSecretPin) {
      setCurrentUser({
        name: name || "Store Admin",
        phone: phone || "Official",
        address: "Kulture Vintage HQ - Camp Branch",
        role: "admin"
      });
      alert("Authenticated as STORE MANAGER. Control Center unlocked.");
      toggleAuthModal(false);
      return;
    }

    if (!name || !phone) {
      alert("Please enter both your name and WhatsApp number.");
      return;
    }

    const customers = getCRMData();
    const existing = customers.find(c => c.phone === phone);

    if (existing) {
      if (existing.pin && existing.pin !== pin) {
        alert("Incorrect PIN for this WhatsApp number. Please try again.");
        return;
      }
      existing.name = name;
      if (address) existing.address = address;
      saveCRMData(customers);

      setCurrentUser({
        name: existing.name,
        phone: existing.phone,
        address: existing.address || address,
        role: "customer",
        tier: existing.tier || "regular"
      });
      alert(`Welcome back, ${name}!`);
    } else {
      const newCustomer = {
        name,
        phone,
        pin,
        address: address || "",
        ordersCount: 0,
        totalSpent: 0,
        tier: "regular"
      };
      customers.push(newCustomer);
      saveCRMData(customers);

      setCurrentUser({
        name,
        phone,
        address,
        role: "customer",
        tier: "regular"
      });
      alert(`Account registered successfully for ${name}!`);
    }

    toggleAuthModal(false);
  });

  document.getElementById("logout-btn").addEventListener("click", () => {
    setCurrentUser(null);
    toggleAdminView(false);
    toggleAuthModal(false);
  });

  document.getElementById("checkout-btn").addEventListener("click", checkoutViaWhatsApp);

  // Add Product Form Handler
  const addForm = document.getElementById("add-product-form");
  if (addForm) {
    addForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const newDrop = {
        id: "KV-" + Date.now().toString().slice(-4),
        title: document.getElementById("new-title").value.trim(),
        category: document.getElementById("new-category").value,
        price: Number(document.getElementById("new-price").value),
        originalPrice: Number(document.getElementById("new-orig-price").value),
        badge: document.getElementById("new-badge").value.trim() || "New Drop",
        sizes: document.getElementById("new-sizes").value.split(",").map(s => s.trim()),
        image: document.getElementById("new-img").value.trim()
      };

      currentCatalog.unshift(newDrop);
      saveCatalog(currentCatalog);
      renderCatalogGrid();
      renderAdminTables();
      addForm.reset();
      alert(`Drop '${newDrop.title}' successfully pushed live!`);
    });
  }
});