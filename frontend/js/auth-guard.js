function getCurrentUser() {
  try {
    return JSON.parse(localStorage.getItem("admin_user") || "null");
  } catch {
    return null;
  }
}

function getAuthToken() {
  return localStorage.getItem("admin_token");
}

function isUserLoggedIn() {
  const token = getAuthToken();
  const user = getCurrentUser();
  return !!token && !!user;
}

function requireLogin(actionCallback) {
  if (isUserLoggedIn()) {
    actionCallback();
    return true;
  }

  const confirmed = confirm(
    "Untuk menambahkan produk ke keranjang atau checkout, kamu harus login terlebih dahulu.\n\nKlik OK untuk login atau register."
  );

  if (confirmed) {
    window.location.href = "admin/login.html";
  }

  return false;
}