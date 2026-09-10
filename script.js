document.addEventListener("DOMContentLoaded", () => {
  let products = [];
  let bag = JSON.parse(localStorage.getItem("fitcheck_bag")) || [];
  let currentUser = JSON.parse(localStorage.getItem("fitcheck_session")) || null;
  let activeCategory = "All";
  let activeSort = "default";
  const selectedSizes = {};
  const WHATSAPP_CONTACT = "919101925887";

  const get = (id) => document.getElementById(id);
  const productGrid = get("productGrid");
  const categoryTabs = get("categoryTabs");
  const sortSelect = get("sortSelect");

  const bagDrawer = get("bagDrawer");
  const bagOverlay = get("bagOverlay");
  const bagOpenBtn = get("bagOpenBtn");
  const bagCloseBtn = get("bagCloseBtn");
  const bagCount = get("bagCount");
  const drawerCount = get("drawerCount");
  const drawerItemsList = get("drawerItemsList");
  const drawerSubtotal = get("drawerSubtotal");
  const drawerVipRow = get("drawerVipRow");
  const drawerVipDiscount = get("drawerVipDiscount");
  const drawerFinalTotal = get("drawerFinalTotal");

  const openCheckoutBtn = get("openCheckoutBtn");
  const checkoutModal = get("checkoutModal");
  const checkoutCloseBtn = get("checkoutCloseBtn");
  const orderForm = get("orderForm");

  const trackIdInput = get("trackIdInput");
  const trackOrderBtn = get("trackOrderBtn");
  const trackingResultContainer = get("trackingResultContainer");

  const authModal = get("authModal");
  const authModalBtn = get("authModalBtn");
  const authCloseBtn = get("authCloseBtn");
  const tabLoginBtn = get("tabLoginBtn");
  const tabRegBtn = get("tabRegBtn");
  const loginForm = get("loginForm");
  const regForm = get("regForm");
  const userBadge = get("userBadge");
  const userName = get("userName");
  const vipIndicator = get("vipIndicator");
  const logoutBtn = get("logoutBtn");

  const adminSection = get("adminSection");
  const newProductForm = get("newProductForm");
  const customerTableBody = get("customerTableBody");
  const adminOrdersTableBody = get("adminOrdersTableBody");
  const exportCsvBtn = get("exportCsvBtn");

  async function loadProducts() {
    try {
      const res = await fetch('/api/products');
      products = await res.json();
    } catch {
      products = [];
    }
    renderCatalog();
  }

  function renderCatalog() {
    if (!productGrid) return;
    let items = [...products];

    if (activeCategory !== "All") {
      items = items.filter(p => (p.category || "").toLowerCase() === activeCategory.toLowerCase());
    }

    if (activeSort === "price-asc") items.sort((a, b) => (Number(a.price) || 0) - (Number(b.price) || 0));
    if (activeSort === "price-desc") items.sort((a, b) => (Number(b.price) || 0) - (Number(a.price) || 0));

    const isAdmin = currentUser && currentUser.isAdmin;

    productGrid.innerHTML = items.map(p => {
      const price = Number(p.price) || 0;
      const originalPrice = Number(p.originalPrice) || price;
      const sizes = Array.isArray(p.sizes) ? p.sizes : ["M", "L", "XL"];
      const currentSelected = selectedSizes[p.id] || "";

      return `
        <article class="product-card">
          <div class="img-box"><img src="${p.image}" alt="${p.title}" /></div>
          <div class="details">
            <span class="prod-category">${p.category}</span>
            <h3 class="prod-title">${p.title}</h3>
            <div class="price-row">
              <span class="sale-price">₹${price}</span>
              ${originalPrice > price ? `<span class="cut-price">₹${originalPrice}</span>` : ''}
            </div>
            <div class="size-selector">
              <div class="size-pills">
                ${sizes.map(sz => `
                  <button type="button" class="size-btn ${currentSelected === sz ? 'selected' : ''}" onclick="pickSize('${p.id}', '${sz}')">${sz}</button>
                `).join('')}
              </div>
            </div>
            <button type="button" class="btn-solid" onclick="addItemToBag('${p.id}')">ADD TO BAG</button>
            ${isAdmin ? `<button onclick="deleteProduct('${p.id}')" style="background:none; border:1px solid red; color:red; margin-top:0.4rem; padding:0.3rem; border-radius:3px; cursor:pointer;">Delete</button>` : ''}
          </div>
        </article>
      `;
    }).join('');
  }

  window.pickSize = (productId, size) => {
    selectedSizes[productId] = size;
    renderCatalog();
  };

  window.addItemToBag = (productId) => {
    const product = products.find(p => String(p.id) === String(productId));
    if (!product) return;

    const chosenSize = selectedSizes[productId];
    if (!chosenSize) {
      alert("Please select a size first!");
      return;
    }

    const match = bag.find(i => String(i.productId) === String(product.id) && i.selectedSize === chosenSize);
    if (match) {
      match.quantity += 1;
    } else {
      bag.push({
        productId: product.id,
        title: product.title,
        selectedSize: chosenSize,
        price: Number(product.price) || 0,
        quantity: 1,
        image: product.image
      });
    }

    syncBag();
    bagDrawer.classList.add("active");
    bagOverlay.classList.add("active");
  };

  window.alterBagQty = (productId, size, delta) => {
    const idx = bag.findIndex(i => String(i.productId) === String(productId) && i.selectedSize === size);
    if (idx === -1) return;
    bag[idx].quantity += delta;
    if (bag[idx].quantity <= 0) bag.splice(idx, 1);
    syncBag();
  };

  function syncBag() {
    localStorage.setItem("fitcheck_bag", JSON.stringify(bag));
    renderBag();
  }

  function renderBag() {
    const totalCount = bag.reduce((sum, i) => sum + i.quantity, 0);
    if (bagCount) bagCount.textContent = totalCount;
    if (drawerCount) drawerCount.textContent = totalCount;

    const subtotal = bag.reduce((sum, i) => sum + (i.price * i.quantity), 0);
    const isVIP = currentUser && currentUser.flag === "VIP";
    const vipDiscount = isVIP ? Math.round(subtotal * 0.10) : 0;
    const finalTotal = subtotal - vipDiscount;

    if (drawerSubtotal) drawerSubtotal.textContent = `₹${subtotal}`;
    if (drawerFinalTotal) drawerFinalTotal.textContent = `₹${finalTotal}`;
    if (drawerVipRow) {
      drawerVipRow.style.display = isVIP ? "flex" : "none";
      if (drawerVipDiscount) drawerVipDiscount.textContent = `-₹${vipDiscount}`;
    }

    if (drawerItemsList) {
      drawerItemsList.innerHTML = bag.length === 0 ? `<p style="text-align:center; color:#888; margin-top:2rem;">Bag is empty</p>` : bag.map(i => `
        <div class="drawer-item">
          <img src="${i.image}" alt="${i.title}">
          <div style="flex:1;">
            <h4>${i.title}</h4>
            <div style="color:#888; font-size:0.8rem;">Size: ${i.selectedSize} | ₹${i.price}</div>
            <div style="margin-top:0.4rem;">
              <button onclick="alterBagQty('${i.productId}', '${i.selectedSize}', -1)">-</button>
              <span style="padding:0 0.5rem;">${i.quantity}</span>
              <button onclick="alterBagQty('${i.productId}', '${i.selectedSize}', 1)">+</button>
            </div>
          </div>
          <div>₹${i.price * i.quantity}</div>
        </div>
      `).join('');
    }
  }

  // Bag & Modal Listeners
  if (bagOpenBtn) bagOpenBtn.onclick = () => { bagDrawer.classList.add("active"); bagOverlay.classList.add("active"); };
  if (bagCloseBtn) bagCloseBtn.onclick = () => { bagDrawer.classList.remove("active"); bagOverlay.classList.remove("active"); };
  if (bagOverlay) bagOverlay.onclick = () => { bagDrawer.classList.remove("active"); bagOverlay.classList.remove("active"); };

  if (categoryTabs) categoryTabs.onclick = (e) => {
    const pill = e.target.closest(".pill");
    if (!pill) return;
    document.querySelectorAll(".pill").forEach(p => p.classList.remove("active"));
    pill.classList.add("active");
    activeCategory = pill.dataset.cat;
    renderCatalog();
  };

  if (sortSelect) sortSelect.onchange = (e) => { activeSort = e.target.value; renderCatalog(); };

  if (openCheckoutBtn) openCheckoutBtn.onclick = () => {
    if (bag.length === 0) return alert("Bag is empty!");
    bagDrawer.classList.remove("active");
    bagOverlay.classList.remove("active");
    if (currentUser) {
      get("orderCustName").value = currentUser.name || "";
      get("orderCustPhone").value = currentUser.phone || "";
    }
    checkoutModal.classList.add("active");
  };
  if (checkoutCloseBtn) checkoutCloseBtn.onclick = () => checkoutModal.classList.remove("active");

  // WhatsApp Order Submission
  if (orderForm) orderForm.onsubmit = async (e) => {
    e.preventDefault();
    const name = get("orderCustName").value.trim();
    const phone = get("orderCustPhone").value.trim();
    const address = get("orderCustAddress").value.trim();

    const subtotal = bag.reduce((sum, i) => sum + (i.price * i.quantity), 0);
    const isVIP = currentUser && currentUser.flag === "VIP";
    const vipDiscount = isVIP ? Math.round(subtotal * 0.10) : 0;
    const finalTotal = subtotal - vipDiscount;

    let orderId = "FC-" + Math.floor(100000 + Math.random() * 900000);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer: { name, phone, address },
          items: bag.map(i => ({ name: `${i.title} (${i.selectedSize})`, price: i.price, quantity: i.quantity })),
          total: finalTotal
        })
      });
      const data = await res.json();
      if (data.id) orderId = data.id;
    } catch {}

    let itemsText = "";
    bag.forEach((i, idx) => {
      itemsText += `${idx + 1}. ${i.title} (Size: ${i.selectedSize}) x ${i.quantity} - ₹${i.price * i.quantity}\n`;
    });

    const msg = `🛍️ *NEW ORDER - FIT CHECK*\n-------------------------\n*Tracking ID:* ${orderId}\n*Customer Name:* ${name}\n*Phone:* ${phone}\n*Delivery Address:* ${address}\n\n*Order Items:*\n${itemsText}-------------------------\n*Subtotal:* ₹${subtotal}\n${isVIP ? `*VIP Discount:* ₹${vipDiscount}\n` : ''}*Total Payable:* ₹${finalTotal}\n*Payment Method:* Parcel COD / Online UPI Confirmation\n\nPlease confirm stock availability and dispatch time!`;

    window.open(`https://wa.me/${WHATSAPP_CONTACT}?text=${encodeURIComponent(msg)}`, '_blank');
    bag = [];
    syncBag();
    checkoutModal.classList.remove("active");
    orderForm.reset();

    trackIdInput.value = orderId;
    trackOrderBtn.click();
  };

  // Order Tracking
  if (trackOrderBtn) trackOrderBtn.onclick = async () => {
    const id = trackIdInput.value.trim().toUpperCase();
    if (!id) return;
    try {
      const res = await fetch(`/api/orders/${id}`);
      if (!res.ok) return alert("Tracking ID not found");
      const ord = await res.json();
      trackingResultContainer.style.display = "block";
      trackingResultContainer.innerHTML = `
        <div style="margin-top:1rem; border-top:1px solid #333; padding-top:1rem;">
          <h4>Tracking ID: ${ord.id}</h4>
          <p>Recipient: ${ord.customerName} | Status: <strong style="color:var(--accent-yellow);">${ord.status}</strong></p>
        </div>
      `;
    } catch {
      alert("Error tracking order");
    }
  };

  // Auth Handling
  function syncAuth() {
    const isAdmin = currentUser && currentUser.isAdmin;
    if (currentUser) {
      authModalBtn.style.display = "none";
      userBadge.style.display = "flex";
      userName.textContent = currentUser.name;
      vipIndicator.style.display = currentUser.flag === "VIP" ? "inline-block" : "none";
      adminSection.style.display = isAdmin ? "block" : "none";
      if (isAdmin) fetchAdmin();
    } else {
      authModalBtn.style.display = "block";
      userBadge.style.display = "none";
      adminSection.style.display = "none";
    }
    renderCatalog();
    renderBag();
  }

  if (authModalBtn) authModalBtn.onclick = () => authModal.classList.add("active");
  if (authCloseBtn) authCloseBtn.onclick = () => authModal.classList.remove("active");
  if (tabLoginBtn) tabLoginBtn.onclick = () => { tabLoginBtn.classList.add("active"); tabRegBtn.classList.remove("active"); loginForm.style.display="block"; regForm.style.display="none"; };
  if (tabRegBtn) tabRegBtn.onclick = () => { tabRegBtn.classList.add("active"); tabLoginBtn.classList.remove("active"); regForm.style.display="block"; loginForm.style.display="none"; };

  if (loginForm) loginForm.onsubmit = async (e) => {
    e.preventDefault();
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: get("loginPhone").value, pass: get("loginPass").value })
    });
    const data = await res.json();
    if (res.ok) {
      currentUser = data;
      localStorage.setItem("fitcheck_session", JSON.stringify(currentUser));
      authModal.classList.remove("active");
      loginForm.reset();
      syncAuth();
    } else alert(data.error);
  };

  if (regForm) regForm.onsubmit = async (e) => {
    e.preventDefault();
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: get("regName").value, phone: get("regPhone").value, pass: get("regPass").value })
    });
    const data = await res.json();
    if (res.ok) {
      currentUser = data;
      localStorage.setItem("fitcheck_session", JSON.stringify(currentUser));
      authModal.classList.remove("active");
      regForm.reset();
      syncAuth();
    } else alert(data.error);
  };

  if (logoutBtn) logoutBtn.onclick = () => {
    currentUser = null;
    localStorage.removeItem("fitcheck_session");
    syncAuth();
  };

  // Admin APIs
  if (newProductForm) newProductForm.onsubmit = async (e) => {
    e.preventDefault();
    await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: get("prodTitle").value.trim(),
        category: get("prodCategory").value,
        price: Number(get("prodPrice").value) || 0,
        originalPrice: Number(get("prodOrigPrice").value) || 0,
        sizes: get("prodSizes").value.split(',').map(s => s.trim()).filter(Boolean),
        image: get("prodImgUrl").value.trim() || "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=800&q=80"
      })
    });
    newProductForm.reset();
    loadProducts();
  };

  async function fetchAdmin() {
    const [uRes, oRes] = await Promise.all([fetch('/api/users'), fetch('/api/orders')]);
    const users = await uRes.json();
    const orders = await oRes.json();

    customerTableBody.innerHTML = users.map(u => `
      <tr>
        <td>${u.name}</td>
        <td>${u.phone}</td>
        <td>${u.flag}</td>
        <td>
          <button onclick="setFlag('${u.phone}', 'VIP')">⭐ VIP</button>
          <button onclick="setFlag('${u.phone}', 'Active')">Reset</button>
        </td>
      </tr>
    `).join('');

    adminOrdersTableBody.innerHTML = orders.map(o => `
      <tr>
        <td>${o.id}</td>
        <td>${o.customerName}</td>
        <td>₹${o.total}</td>
        <td>
          <select onchange="setOrderStatus('${o.id}', this.value)">
            <option value="Placed" ${o.status==='Placed'?'selected':''}>Placed</option>
            <option value="Confirmed" ${o.status==='Confirmed'?'selected':''}>Confirmed</option>
            <option value="Dispatched" ${o.status==='Dispatched'?'selected':''}>Dispatched</option>
            <option value="Delivered" ${o.status==='Delivered'?'selected':''}>Delivered</option>
          </select>
        </td>
      </tr>
    `).join('');
  }

  window.setFlag = async (phone, flag) => {
    await fetch(`/api/users/${phone}/flag`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ flag })
    });
    fetchAdmin();
  };

  window.setOrderStatus = async (id, status) => {
    await fetch(`/api/orders/${id}/status`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status })
    });
  };

  window.deleteProduct = async (id) => {
    if (!confirm("Delete product?")) return;
    await fetch(`/api/products/${id}`, { method: 'DELETE' });
    loadProducts();
  };

  if (exportCsvBtn) exportCsvBtn.onclick = async () => {
    const res = await fetch('/api/admin/analytics');
    const data = await res.json();
    const rows = data.map(c => `"${c.name}","${c.phone}","${c.joinedDate}","${c.flag}",${c.totalOrders},${c.totalSpent}`);
    const csv = "\uFEFF" + ["Name,Phone,Joined,Status,Orders,Spent", ...rows].join("\r\n");
    const link = document.createElement("a");
    link.href = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }));
    link.download = "fitcheck_analytics.csv";
    link.click();
  };

  loadProducts();
  syncAuth();
  renderBag();
});