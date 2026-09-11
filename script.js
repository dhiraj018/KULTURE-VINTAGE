// Store Configuration: Set target WhatsApp number and custom logo URL
const STORE_CONFIG = {
  brandName: "KULTURE VINTAGE",
  phone: "919876543210", // Put client's WhatsApp number here
  logoUrl: "https://images.unsplash.com/photo-1555529771-835f59fc5efe?w=100&auto=format&fit=crop&q=80",
  fulfillmentHub: "Pune Hub (Camp / Viman Nagar / PCMC / Kothrud)"
};

// Initialize Store Elements
document.addEventListener("DOMContentLoaded", () => {
  // Update Brand Logo dynamically if provided
  const logoImg = document.getElementById("brand-logo");
  if (logoImg && STORE_CONFIG.logoUrl) {
    logoImg.src = STORE_CONFIG.logoUrl;
  }

  // Render initial catalog
  if (typeof renderCatalog === "function" && typeof catalog !== "undefined") {
    renderCatalog(catalog);
  }

  // Sync saved session
  syncAuthUI();
});

// Auth Modal Management
function toggleAuthModal() {
  const modal = document.getElementById("auth-modal");
  const backdrop = document.getElementById("backdrop");
  const isOpen = modal.classList.contains("open");

  if (!isOpen) {
    modal.classList.add("open");
    backdrop.classList.add("open");
  } else {
    modal.classList.remove("open");
    if (!document.getElementById("cart-drawer").classList.contains("open")) {
      backdrop.classList.remove("open");
    }
  }
}

function closeAllDrawers() {
  const modal = document.getElementById("auth-modal");
  const drawer = document.getElementById("cart-drawer");
  const backdrop = document.getElementById("backdrop");

  if (modal) modal.classList.remove("open");
  if (drawer) drawer.classList.remove("open");
  if (backdrop) backdrop.classList.remove("open");
}

function syncAuthUI() {
  const savedUser = JSON.parse(localStorage.getItem("kv_user") || "null");
  const triggerBtn = document.getElementById("auth-trigger");
  const loggedOutView = document.getElementById("auth-logged-out-view");
  const loggedInView = document.getElementById("auth-logged-in-view");

  if (savedUser && savedUser.name) {
    if (triggerBtn) triggerBtn.innerText = savedUser.name.split(" ")[0].toUpperCase();
    if (loggedOutView) loggedOutView.style.display = "none";
    if (loggedInView) loggedInView.style.display = "block";

    document.getElementById("profile-display-name").innerText = savedUser.name;
    document.getElementById("profile-display-phone").innerText = savedUser.phone;
    document.getElementById("profile-display-address").innerText = savedUser.address;

    // Autofill checkout inputs
    if (document.getElementById("cust-name")) document.getElementById("cust-name").value = savedUser.name;
    if (document.getElementById("cust-phone")) document.getElementById("cust-phone").value = savedUser.phone;
    if (document.getElementById("cust-address")) document.getElementById("cust-address").value = savedUser.address;
  } else {
    if (triggerBtn) triggerBtn.innerText = "SIGN IN";
    if (loggedOutView) loggedOutView.style.display = "block";
    if (loggedInView) loggedInView.style.display = "none";
  }
}

function handleAuthSubmit() {
  const name = document.getElementById("login-name").value.trim();
  const phone = document.getElementById("login-phone").value.trim();
  const address = document.getElementById("login-address").value.trim();

  if (!name || !phone) {
    alert("Please enter at least your name and WhatsApp number.");
    return;
  }

  const userData = { name, phone, address };
  localStorage.setItem("kv_user", JSON.stringify(userData));
  syncAuthUI();
  toggleAuthModal();
}

function handleAuthLogout() {
  localStorage.removeItem("kv_user");
  syncAuthUI();
  toggleAuthModal();
}

// WhatsApp Checkout Execution
function checkoutViaWhatsApp() {
  if (cart.length === 0) {
    alert("Your bag is empty.");
    return;
  }

  const name = document.getElementById('cust-name').value.trim();
  const phone = document.getElementById('cust-phone').value.trim();
  const address = document.getElementById('cust-address').value.trim();

  if (!name || !phone || !address) {
    alert("Please enter your name, phone number, and delivery address.");
    return;
  }

  const orderID = "KV-" + Math.floor(100000 + Math.random() * 900000);
  let total = 0;
  
  const itemsList = cart.map(i => {
    total += i.price;
    return `• ${i.title} (Size: ${i.chosenSize}) - ₹${i.price}`;
  }).join("\n");

  const message = 
`⚡ *NEW ORDER: ${orderID}*
-----------------------------
*Customer Details:*
• Name: ${name}
• Phone: ${phone}
• Address: ${address}

*Ordered Items:*
${itemsList}

*Order Total:* ₹${total}
*Fulfillment Branch:* ${STORE_CONFIG.fulfillmentHub}
-----------------------------
Please send payment link and verify dispatch!`;

  const encoded = encodeURIComponent(message);
  window.open(`https://wa.me/${STORE_CONFIG.phone}?text=${encoded}`, '_blank');
}