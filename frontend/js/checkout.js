document.addEventListener("DOMContentLoaded", () => {
  renderCart();
  syncCheckoutForm();

  const checkoutBtn = document.getElementById("checkoutWA");
  const clearBtn = document.getElementById("clearCartBtn");

  const fields = [
    "checkoutName",
    "checkoutPhone",
    "checkoutMethod",
    "checkoutAddress",
    "checkoutNote"
  ];

  fields.forEach((id) => {
    const el = document.getElementById(id);
    el?.addEventListener("input", persistCheckoutForm);
    el?.addEventListener("change", persistCheckoutForm);
  });

  checkoutBtn?.addEventListener("click", () => {
    requireLogin(() => {
      const user = JSON.parse(localStorage.getItem("admin_user") || "{}");
      const formData = getCheckoutFormData();

      const waMessage = buildWhatsAppMessage(
        formData.name || user.name || "Pelanggan",
        formData
      );

      if (!waMessage) {
        alert("Keranjang masih kosong.");
        return;
      }

      window.open(`https://wa.me/6282312740855?text=${waMessage}`, "_blank");
    });
  });

  clearBtn?.addEventListener("click", () => {
    clearCart();
    renderCart();
  });
});

function getCheckoutFormData() {
  return {
    name: document.getElementById("checkoutName")?.value.trim() || "",
    phone: document.getElementById("checkoutPhone")?.value.trim() || "",
    method: document.getElementById("checkoutMethod")?.value || "",
    address: document.getElementById("checkoutAddress")?.value.trim() || "",
    note: document.getElementById("checkoutNote")?.value.trim() || ""
  };
}

function persistCheckoutForm() {
  saveCheckoutInfo(getCheckoutFormData());
}

function syncCheckoutForm() {
  const saved = getCheckoutInfo();
  const user = JSON.parse(localStorage.getItem("admin_user") || "{}");

  const nameInput = document.getElementById("checkoutName");
  const phoneInput = document.getElementById("checkoutPhone");
  const methodInput = document.getElementById("checkoutMethod");
  const addressInput = document.getElementById("checkoutAddress");
  const noteInput = document.getElementById("checkoutNote");

  if (nameInput) nameInput.value = saved.name || user.name || "";
  if (phoneInput) phoneInput.value = saved.phone || "";
  if (methodInput) methodInput.value = saved.method || "Ambil di toko";
  if (addressInput) addressInput.value = saved.address || "";
  if (noteInput) noteInput.value = saved.note || "";
}

function renderCart() {
  const cartList = document.getElementById("cartList");
  if (!cartList) return;

  const cart = getCart();

  if (!cart.length) {
    cartList.innerHTML = `
      <div class="empty-cart">
        <i class="bi bi-cart-x fs-1 d-block mb-3"></i>
        Keranjang masih kosong.
      </div>
    `;
    updateSummary();
    return;
  }

  cartList.innerHTML = cart.map(item => `
    <div class="cart-item mb-3">
      <div class="d-flex flex-wrap justify-content-between gap-3">
        <div class="d-flex align-items-start gap-3">
          <img
            src="${
              item.image_url
                ? (typeof getImageUrl === 'function'
                    ? getImageUrl(item.image_url)
                    : item.image_url)
                : 'https://via.placeholder.com/84'
            }"
            alt="${item.name}"
            class="cart-thumb"
          >
          <div>
            <div class="cart-name">${item.name}</div>
            <div class="cart-meta">${item.category_name || ""}</div>
            <div class="cart-meta">${formatPriceRange(item.price_range)}</div>
          </div>
        </div>

        <div class="qty-box">
          <button class="btn btn-outline-secondary btn-sm" onclick="decreaseQty('${item.id}'); renderCart();">-</button>
          <span class="qty-value">${item.qty}</span>
          <button class="btn btn-outline-secondary btn-sm" onclick="increaseQty('${item.id}'); renderCart();">+</button>
          <button class="btn btn-outline-danger btn-sm" onclick="removeFromCart('${item.id}'); renderCart();">Hapus</button>
        </div>
      </div>
    </div>
  `).join("");

  updateSummary();
}

function updateSummary() {
  const summary = getCartSummary();

  const totalItemsEl = document.getElementById("summaryTotalItems");
  const uniqueItemsEl = document.getElementById("summaryUniqueItems");

  if (totalItemsEl) totalItemsEl.textContent = summary.totalItems;
  if (uniqueItemsEl) uniqueItemsEl.textContent = summary.uniqueItems;
}

function formatPriceRange(priceRange) {
  if (!priceRange) {
    return "Hubungi toko untuk harga";
  }

  const parts = String(priceRange).split("-");

  if (parts.length !== 2) {
    return priceRange;
  }

  const min = Number(parts[0]);
  const max = Number(parts[1]);

  if (isNaN(min) || isNaN(max)) {
    return priceRange;
  }

  return `Rp ${min.toLocaleString("id-ID")} - Rp ${max.toLocaleString("id-ID")}`;
}