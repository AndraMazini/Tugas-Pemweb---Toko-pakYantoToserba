const CART_KEY = "toserba_cart";

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
  const cart = getCart();
  const existing = cart.find(item => item.id === product.id);

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
}

function removeFromCart(productId) {
  const cart = getCart().filter(item => item.id !== productId);
  saveCart(cart);
}

function increaseQty(productId) {
  const cart = getCart();
  const item = cart.find(i => i.id === productId);
  if (item) item.qty += 1;
  saveCart(cart);
}

function decreaseQty(productId) {
  let cart = getCart();
  const item = cart.find(i => i.id === productId);

  if (item) {
    item.qty -= 1;
    if (item.qty <= 0) {
      cart = cart.filter(i => i.id !== productId);
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

function buildWhatsAppMessage(userName = "Pelanggan") {
  const cart = getCart();

  if (!cart.length) return "";

  let message = `Halo Toko Pak Yanto,%0A%0ASaya ingin memesan barang berikut:%0A`;

  cart.forEach((item, index) => {
    message += `%0A${index + 1}. ${item.name} x${item.qty}`;
    if (item.price_range) {
      message += ` - ${encodeURIComponent(item.price_range)}`;
    }
  });

  message += `%0A%0ANama:%20${encodeURIComponent(userName)}`;
  message += `%0A%0AMohon info stok dan total harga. Terima kasih.`;

  return message;
}