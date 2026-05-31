document.addEventListener("DOMContentLoaded", () => {
  renderCart();

  const checkoutBtn = document.getElementById("checkoutWA");
  const clearBtn = document.getElementById("clearCartBtn");

  checkoutBtn?.addEventListener("click", () => {
    requireLogin(() => {
      const user = JSON.parse(localStorage.getItem("admin_user") || "{}");
      const waMessage = buildWhatsAppMessage(user.name || "Pelanggan");

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

function renderCart() {
  const cartList = document.getElementById("cartList");
  if (!cartList) return;

  const cart = getCart();

  if (!cart.length) {
    cartList.innerHTML = `
      <div class="col-12 text-center text-muted py-5">
        Keranjang masih kosong.
      </div>
    `;
    return;
  }

  cartList.innerHTML = cart.map(item => `
    <div class="col-12">
      <div class="soft-card d-flex flex-wrap align-items-center justify-content-between gap-3">
        <div class="d-flex align-items-center gap-3">
          <img
            src="${item.image_url ? getImageUrl(item.image_url) : 'https://via.placeholder.com/80'}"
            alt="${item.name}"
            style="width:80px;height:80px;object-fit:cover;border-radius:12px;"
          >
          <div>
            <div class="fw-bold">${item.name}</div>
            <div class="text-muted small">${item.category_name || ""}</div>
            <div class="text-muted small">${item.price_range || ""}</div>
          </div>
        </div>

        <div class="d-flex align-items-center gap-2">
          <button class="btn btn-outline-secondary btn-sm" onclick="decreaseQty(${item.id}); renderCart();">-</button>
          <span class="fw-bold px-2">${item.qty}</span>
          <button class="btn btn-outline-secondary btn-sm" onclick="increaseQty(${item.id}); renderCart();">+</button>
          <button class="btn btn-outline-danger btn-sm" onclick="removeFromCart(${item.id}); renderCart();">Hapus</button>
        </div>
      </div>
    </div>
  `).join("");
}