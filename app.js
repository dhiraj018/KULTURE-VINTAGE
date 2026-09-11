const DEFAULT_CONFIG = {
  brandName: "KULTURE VINTAGE",
  phone: "919322575059", 
  tagline: "PAIN TO PURPOSE",
  branches: "CAMP • VIMAN NAGAR • PCMC • KOTHRUD | PAN-INDIA DISPATCH 📦",
  logoUrl: "https://lh3.googleusercontent.com/d/1P6zo6GL9E0lgYaH7W9V3SaOvd0EQ5fzS",
  adminSecretPin: "9999"
};

// Global Data State
let globalSettings = DEFAULT_CONFIG;
let crmData = [];
let orderLogs = [];

// Push to Firebase Actions
function getStoreSettings() { return globalSettings; }
function saveStoreSettings(settings) { window.STORE_DOC.set({ settings: settings }, { merge: true }); }
function getCRMData() { return crmData; }
function saveCRMData(data) { window.STORE_DOC.set({ crm: data }, { merge: true }); }
function getOrderLogs() { return orderLogs; }
function saveOrderLogs(data) { window.STORE_DOC.set({ orders: data }, { merge: true }); }

// REAL-TIME FIREBASE SYNC ENGINE
window.STORE_DOC.onSnapshot((doc) => {
  if (doc.exists) {
    const data = doc.data();
    
    if (data.settings) {
      globalSettings = data.settings;
      applyStoreSettings(); 
    }
    if (data.catalog) {
      currentCatalog = data.catalog; 
      if (typeof renderCatalogGrid === "function") renderCatalogGrid();
    }
    if (data.crm) crmData = data.crm;
    if (data.orders) orderLogs = data.orders;

    // Refresh admin tables if currently viewing them
    if (document.getElementById("admin-view")?.style.display === "block") {
      renderAdminTables();
    }
  } else {
    // Database is empty (first boot), so seed it
    window.STORE_DOC.set({
      settings: DEFAULT_CONFIG,
      catalog: typeof INITIAL_CATALOG !== "undefined" ? INITIAL_CATALOG : [],
      crm: [],
      orders: []
    });
  }
});

function applyStoreSettings() {
  const cfg = globalSettings;
  const logoImg = document.getElementById("brand-logo");
  if (logoImg && cfg.logoUrl) { logoImg.src = cfg.logoUrl; logoImg.style.display = "block"; }
  const taglineEl = document.getElementById("display-brand-tagline");
  if (taglineEl) taglineEl.innerText = cfg.tagline;
  const topBanner = document.getElementById("top-announcement-bar");
  if (topBanner) topBanner.innerText = cfg.branches;

  const inputLogo = document.getElementById("setting-logo-url");
  if (inputLogo) inputLogo.value = cfg.logoUrl.startsWith("data:") ? "" : cfg.logoUrl;
  const inputPhone = document.getElementById("setting-phone");
  if (inputPhone) inputPhone.value = cfg.phone;
  const inputTagline = document.getElementById("setting-tagline");
  if (inputTagline) inputTagline.value = cfg.tagline;
  const inputBranches = document.getElementById("setting-branches");
  if (inputBranches) inputBranches.value = cfg.branches;
}

function getCurrentUser() { return JSON.parse(localStorage.getItem("kv_user") || "null"); }
function setCurrentUser(user) {
  if (user) localStorage.setItem("kv_user", JSON.stringify(user));
  else localStorage.removeItem("kv_user");
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

    const roleBadge = document.getElementById("profile-display-role");
    if (user.role === "admin") {
      roleBadge.innerText = "STORE MANAGER";
      roleBadge.className = "user-role-badge tag-vip";
      if (adminPanelBtn) adminPanelBtn.style.display = "inline-block";
    } else {
      roleBadge.innerText = (user.tier || "REGULAR").toUpperCase() + " BUYER";
      roleBadge.className = "user-role-badge tag-regular";
      if (adminPanelBtn) adminPanelBtn.style.display = "none";
    }
  } else {
    if (authTrigger) authTrigger.innerText = "SIGN IN";
    if (loggedOutView) loggedOutView.style.display = "block";
    if (loggedInView) loggedInView.style.display = "none";
    if (adminPanelBtn) adminPanelBtn.style.display = "none";
  }
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
    if (!document.getElementById("cart-drawer").classList.contains("open")) backdrop.classList.remove("open");
  }
}

function toggleAdminView(showAdmin) {
  const storeView = document.getElementById("storefront-view");
  const heroView = document.querySelector(".hero");
  const adminView = document.getElementById("admin-view");
  if (showAdmin) {
    storeView.style.display = "none"; heroView.style.display = "none"; adminView.style.display = "block";
    applyStoreSettings(); renderAdminTables();
  } else {
    storeView.style.display = "block"; heroView.style.display = "block"; adminView.style.display = "none";
  }
}

function renderAdminTables() {
  const customers = getCRMData();
  const orders = getOrderLogs();
  const catalog = currentCatalog || [];

  document.getElementById("stat-revenue").innerText = `₹${orders.reduce((sum, o) => sum + Number(o.total), 0).toLocaleString('en-IN')}`;
  document.getElementById("stat-orders").innerText = orders.length;
  document.getElementById("stat-customers").innerText = customers.length;
  document.getElementById("stat-inventory").innerText = catalog.length;

  const custTable = document.getElementById("customer-table-body");
  custTable.innerHTML = "";
  customers.forEach((c, idx) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><strong>${c.name}</strong></td><td>${c.phone}</td><td style="max-width:200px;">${c.address || 'N/A'}</td>
      <td>${c.ordersCount || 0}</td><td>₹${(c.totalSpent || 0).toLocaleString('en-IN')}</td>
      <td><span class="tag-badge ${c.tier === 'vip' ? 'tag-vip' : c.tier === 'flagged' ? 'tag-flagged' : 'tag-regular'}">${(c.tier || 'regular').toUpperCase()}</span></td>
      <td>
        <button class="action-row-btn" onclick="toggleCustomerTier(${idx}, 'vip')">VIP</button>
        <button class="action-row-btn" onclick="toggleCustomerTier(${idx}, 'flagged')">Flag</button>
        <button class="action-row-btn" onclick="toggleCustomerTier(${idx}, 'regular')">Reset</button>
      </td>`;
    custTable.appendChild(tr);
  });

  const ordersTable = document.getElementById("orders-table-body");
  ordersTable.innerHTML = "";
  orders.forEach((o, idx) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><strong>${o.id}</strong></td><td>${o.customer}<br><small style="color:var(--text-dim);">${o.phone}</small></td>
      <td>${o.items}</td><td>₹${o.total}</td><td><span class="tag-badge tag-regular">${o.status}</span></td>
      <td>
        <button class="action-row-btn" onclick="updateOrderStatus(${idx}, 'Dispatched')">Dispatch</button>
        <button class="action-row-btn" onclick="updateOrderStatus(${idx}, 'Delivered')">Done</button>
      </td>`;
    ordersTable.appendChild(tr);
  });
}

window.toggleCustomerTier = function(index, newTier) {
  const customers = getCRMData(); customers[index].tier = newTier; saveCRMData(customers);
};
window.updateOrderStatus = function(index, newStatus) {
  const orders = getOrderLogs(); orders[index].status = newStatus; saveOrderLogs(orders);
};

function checkoutViaWhatsApp() {
  if (cart.length === 0) return alert("Your bag is empty.");
  const name = document.getElementById("cust-name").value.trim();
  const phone = document.getElementById("cust-phone").value.trim();
  const address = document.getElementById("cust-address").value.trim();

  if (!name || !phone || !address) return alert("Please enter name, WhatsApp number, and address.");

  const cfg = getStoreSettings();
  const customers = getCRMData();
  if (customers.find(c => c.phone === phone && c.tier === "flagged")) alert("Notice: Order subject to physical verification.");

  const orderID = "KV-" + Math.floor(100000 + Math.random() * 900000);
  let total = 0;
  const itemsTextList = cart.map(i => { total += Number(i.price); return `• ${i.title} [Size: ${i.chosenSize}] - ₹${i.price}`; }).join("\n");

  let existingCust = customers.find(c => c.phone === phone);
  if (existingCust) {
    existingCust.ordersCount = (existingCust.ordersCount || 0) + 1;
    existingCust.totalSpent = (existingCust.totalSpent || 0) + total;
    existingCust.address = address; existingCust.name = name;
  } else {
    customers.push({ name, phone, pin: "0000", address, ordersCount: 1, totalSpent: total, tier: "regular" });
  }
  saveCRMData(customers);

  const orders = getOrderLogs();
  orders.unshift({ id: orderID, customer: name, phone, items: cart.map(i => `${i.title} (${i.chosenSize})`).join(", "), total, status: "Pending" });
  saveOrderLogs(orders);

  cart = []; updateCartUI(); toggleCartDrawer(false);
  const message = `⚡ *NEW ORDER: ${orderID}*\n-----------------------------\n*Customer Details:*\n• Name: ${name}\n• WhatsApp: ${phone}\n• Delivery Address: ${address}\n\n*Ordered Drops:*\n${itemsTextList}\n\n*Order Total:* ₹${total}\n*Fulfillment Hub:* ${cfg.branches}\n-----------------------------\nPlease confirm order tracking and provide payment details!`;
  window.open(`https://wa.me/${cfg.phone}?text=${encodeURIComponent(message)}`, '_blank');
}

document.addEventListener("DOMContentLoaded", () => {
  syncAuthUI();
  document.getElementById("auth-trigger-btn")?.addEventListener("click", () => toggleAuthModal(true));
  document.getElementById("auth-close-btn")?.addEventListener("click", () => toggleAuthModal(false));
  document.getElementById("admin-panel-btn")?.addEventListener("click", () => toggleAdminView(true));
  document.getElementById("admin-exit-btn")?.addEventListener("click", () => toggleAdminView(false));
  document.getElementById("brand-home-btn")?.addEventListener("click", () => toggleAdminView(false));
  document.getElementById("backdrop")?.addEventListener("click", () => { toggleCartDrawer(false); toggleAuthModal(false); });
  
  document.getElementById("whatsapp-inquiry-btn")?.addEventListener("click", () => {
    window.open(`https://wa.me/${getStoreSettings().phone}?text=${encodeURIComponent("Hello KULTURE VINTAGE team! ⚡ I'm browsing your vault drops online and have an inquiry.")}`, '_blank');
  });

  const settingsForm = document.getElementById("brand-settings-form");
  if (settingsForm) {
    settingsForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const current = getStoreSettings();
      const urlInput = document.getElementById("setting-logo-url").value.trim();
      const fileInput = document.getElementById("setting-logo-file");
      const phoneClean = document.getElementById("setting-phone").value.trim().replace(/[^0-9]/g, '');

      function finalizeSave(logoData) {
        saveStoreSettings({
          ...current, logoUrl: logoData, phone: phoneClean,
          tagline: document.getElementById("setting-tagline").value.trim(),
          branches: document.getElementById("setting-branches").value.trim()
        });
        alert("✅ Brand settings pushed to Cloud Database! All customer screens will instantly update.");
      }

      if (fileInput.files && fileInput.files[0]) {
        const reader = new FileReader();
        reader.onload = function(event) { finalizeSave(event.target.result); };
        reader.readAsDataURL(fileInput.files[0]);
      } else if (urlInput) {
        finalizeSave(urlInput);
      } else { finalizeSave(current.logoUrl); }
    });
  }

  document.getElementById("login-submit-btn")?.addEventListener("click", () => {
    const name = document.getElementById("login-name").value.trim();
    const phone = document.getElementById("login-phone").value.trim();
    const pin = document.getElementById("login-pin").value.trim();
    
    if (!pin) return alert("Security PIN is mandatory.");
    if (pin === getStoreSettings().adminSecretPin) {
      setCurrentUser({ name: name || "Store Admin", phone: phone || "Official", role: "admin" });
      toggleAuthModal(false);
      return alert("Authenticated as STORE MANAGER.");
    }
    if (!name || !phone) return alert("Please enter name and WhatsApp number.");

    const customers = getCRMData();
    const existing = customers.find(c => c.phone === phone);
    if (existing) {
      if (existing.pin && existing.pin !== pin) return alert("Incorrect PIN.");
      existing.name = name; saveCRMData(customers);
      setCurrentUser({ name: existing.name, phone: existing.phone, role: "customer", tier: existing.tier || "regular" });
    } else {
      customers.push({ name, phone, pin, ordersCount: 0, totalSpent: 0, tier: "regular" });
      saveCRMData(customers);
      setCurrentUser({ name, phone, role: "customer", tier: "regular" });
    }
    toggleAuthModal(false);
  });

  document.getElementById("logout-btn")?.addEventListener("click", () => { setCurrentUser(null); toggleAdminView(false); toggleAuthModal(false); });
  document.getElementById("checkout-btn")?.addEventListener("click", checkoutViaWhatsApp);

  document.getElementById("add-product-form")?.addEventListener("submit", (e) => {
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
    saveCatalog(currentCatalog); // Pushes to Firebase instantly
    document.getElementById("add-product-form").reset();
    alert(`Drop '${newDrop.title}' pushed live!`);
  });
});
