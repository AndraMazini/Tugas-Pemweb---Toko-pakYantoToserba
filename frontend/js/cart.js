const CART_KEY = "toserba_cart";
const CHECKOUT_INFO_KEY = "toserba_checkout_info";

function getCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

function addToCart(product) {

  if (!isUserLoggedIn()) {
    requireLogin(() => {});
    return false;
  }

  const cart = getCart();
  const existing = cart.find(
    item => String(item.id) === String(product.id)
  );

  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      price_range: product.price_range || "",
      image_url: product.image_url || "",
      category_name: product.category_name || "",
      qty: 1
    });
  }

  saveCart(cart);

  return true;
}

function removeFromCart(productId) {
  const cart = getCart().filter(item => String(item.id) !== String(productId));
  saveCart(cart);
}

function increaseQty(productId) {
  const cart = getCart();
  const item = cart.find(i => String(i.id) === String(productId));
  if (item) item.qty += 1;
  saveCart(cart);
}

function decreaseQty(productId) {
  let cart = getCart();
  const item = cart.find(i => String(i.id) === String(productId));

  if (item) {
    item.qty -= 1;
    if (item.qty <= 0) {
      cart = cart.filter(i => String(i.id) !== String(productId));
    }
  }

  saveCart(cart);
}

function clearCart() {
  localStorage.removeItem(CART_KEY);
}

function getCartCount() {
  return getCart().reduce((sum, item) => sum + item.qty, 0);
}

function getCheckoutInfo() {
  try {
    return JSON.parse(localStorage.getItem(CHECKOUT_INFO_KEY) || "{}");
  } catch {
    return {};
  }
}

function saveCheckoutInfo(data) {
  localStorage.setItem(CHECKOUT_INFO_KEY, JSON.stringify(data));
}

function getCartSummary() {
  const cart = getCart();
  return {
    totalItems: cart.reduce((sum, item) => sum + item.qty, 0),
    uniqueItems: cart.length
  };
}

function buildWhatsAppMessage(userName = "Pelanggan", detail = {}) {
  const cart = getCart();

  if (!cart.length) return "";

  let message = `Halo Toko Pak Yanto,%0A%0ASaya ingin memesan / menanyakan barang berikut:%0A`;

  cart.forEach((item, index) => {
    message += `%0A${index + 1}. ${item.name} x${item.qty}`;
    if (item.price_range) {
      message += ` - ${encodeURIComponent(item.price_range)}`;
    }
    if (item.category_name) {
      message += ` (%23${encodeURIComponent(item.category_name)})`;
    }
  });

  message += `%0A%0ANama:%20${encodeURIComponent(userName || detail.name || "Pelanggan")}`;

  if (detail.phone) {
    message += `%0AWhatsApp:%20${encodeURIComponent(detail.phone)}`;
  }

  if (detail.method) {
    message += `%0AMetode:%20${encodeURIComponent(detail.method)}`;
  }

  if (detail.address) {
    message += `%0AAlamat/Lokasi:%20${encodeURIComponent(detail.address)}`;
  }

  if (detail.note) {
    message += `%0ACatatan:%20${encodeURIComponent(detail.note)}`;
  }

  message += `%0A%0AMohon info stok, ketersediaan, dan total harga. Terima kasih.`;

  return message;
}

function getUserToken() {
  return localStorage.getItem("user_token");
}

function getCurrentUser() {
  try {
    return JSON.parse(localStorage.getItem("user_user") || "null");
  } catch {
    return null;
  }
}

function isUserLoggedIn() {
  return !!getUserToken() && !!getCurrentUser();
}

function logoutUser() {
  localStorage.removeItem("user_token");
  localStorage.removeItem("user_user");
  window.location.href = "index.html";
}

function requireLogin(onSuccess) {
  if (isUserLoggedIn()) {
    if (typeof onSuccess === "function") onSuccess();
    return;
  }

  sessionStorage.setItem("afterUserLoginRedirect", window.location.href);

  const goLogin = confirm(
    "Untuk menambahkan produk ke keranjang atau checkout, kamu harus login terlebih dahulu.\n\nKlik OK untuk login atau register."
  );

  if (goLogin) {
    window.location.href = "login.html";
  }
}

function renderUserNavbar() {
  const slot = document.getElementById("userNavSlot");
  if (!slot) return;

  const user = getCurrentUser();

  if (user) {
    const displayName = user.name || user.nama || user.email || "Customer";

    slot.innerHTML = `
      <div class="d-flex align-items-center gap-2">
        <span class="fw-semibold">
          <i class="bi bi-person-circle me-1"></i>${displayName}
        </span>
        <button class="btn btn-sm btn-outline-danger" onclick="logoutUser()">Logout</button>
      </div>
    `;
  } else {
    slot.innerHTML = `
      <a href="login.html" class="btn-primary-cta">
        <i class="bi bi-person"></i> Login
      </a>
    `;
  }
}

document.addEventListener("DOMContentLoaded", renderUserNavbar);