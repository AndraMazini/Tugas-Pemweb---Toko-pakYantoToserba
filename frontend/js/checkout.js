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

  checkoutBtn?.addEventListener("click", async () => {
    requireLogin(async () => {
      const user = getCurrentUser() || {};
      const cart = getCart();
      const formData = getCheckoutFormData();

      if (!cart.length) {
        alert("Keranjang masih kosong.");
        return;
      }

      if (!formData.name) {
        alert("Nama pemesan wajib diisi.");
        document.getElementById("checkoutName")?.focus();
        return;
      }

      if (!formData.phone) {
        alert("Nomor WhatsApp wajib diisi.");
        document.getElementById("checkoutPhone")?.focus();
        return;
      }

      const originalText = checkoutBtn.innerHTML;
      checkoutBtn.disabled = true;
      checkoutBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Menyimpan pesanan...';

      try {
        const payload = {
          user_id: user.id || null,
          customer_name: formData.name || user.name || user.nama || "Pelanggan",
          email: user.email || "",
          phone: formData.phone || "",
          method: formData.method || "Ambil di toko",
          address: formData.address || "",
          notes: formData.note || "",
          items: cart.map((item) => ({
            id: item.id,
            product_id: item.id,
            name: item.name || "",
            product_name: item.name || "",
            qty: Number(item.qty || 1),
            quantity: Number(item.qty || 1),
            price_range: item.price_range || "",
            image_url: item.image_url || "",
            category_name: item.category_name || ""
          })),
          total_items: cart.reduce((sum, item) => sum + Number(item.qty || 0), 0),
          total_price: 0,
          status: "Pending"
        };

        const result = await submitOrder(payload);

        const waMessage = buildWhatsAppMessage(
          payload.customer_name,
          {
            name: payload.customer_name,
            phone: payload.phone,
            method: payload.method,
            address: payload.address,
            note: payload.notes
          }
        );

        if (result?.success) {
          alert("Pesanan berhasil masuk ke sistem. Lanjutkan konfirmasi via WhatsApp.");
          saveCheckoutInfo(formData);
          clearCart();
          renderCart();

          if (waMessage) {
            window.open(`https://wa.me/6282312740855?text=${waMessage}`, "_blank");
          }
        } else {
          alert(result?.message || "Pesanan gagal disimpan ke sistem.");
        }
      } catch (error) {
        console.error("Checkout error:", error);
        alert(error.message || "Gagal menyimpan pesanan ke database.");
      } finally {
        checkoutBtn.disabled = false;
        checkoutBtn.innerHTML = originalText;
      }
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
  const user = getCurrentUser() || {};

  const nameInput = document.getElementById("checkoutName");
  const phoneInput = document.getElementById("checkoutPhone");
  const methodInput = document.getElementById("checkoutMethod");
  const addressInput = document.getElementById("checkoutAddress");
  const noteInput = document.getElementById("checkoutNote");

  if (nameInput) nameInput.value = saved.name || user.name || user.nama || "";
  if (phoneInput) phoneInput.value = saved.phone || user.phone || user.whatsapp || "";
  if (methodInput) methodInput.value = saved.method || "Ambil di toko";
  if (addressInput) addressInput.value = saved.address || user.address || "";
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
            src="${item.image_url ? getImageUrl(item.image_url) : 'https://via.placeholder.com/84'}"
            alt="${item.name}"
            class="cart-thumb"
            onerror="this.onerror=null;this.src='https://via.placeholder.com/84';"
          >
          <div>
            <div class="cart-name">${item.name}</div>
            <div class="cart-meta">${item.category_name || ""}</div>
            <div class="cart-meta">${item.price_range || ""}</div>
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