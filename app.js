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
});

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