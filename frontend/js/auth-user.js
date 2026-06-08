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

function saveUserSession(token, user) {
  localStorage.setItem("user_token", token || "");
  localStorage.setItem("user_user", JSON.stringify(user || {}));
}

function clearUserSession() {
  localStorage.removeItem("user_token");
  localStorage.removeItem("user_user");
}

function logoutUser() {
  clearUserSession();
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
  const user = getCurrentUser();
  const userNavSlot = document.getElementById("userNavSlot");

  if (!userNavSlot) return;

  if (user) {
    const displayName = user.name || user.nama || user.email || "Customer";

    userNavSlot.innerHTML = `
      <div class="user-nav-box">
        <i class="bi bi-person-circle"></i>
        <span class="user-nav-name">Halo, ${displayName}</span>
        <button type="button" class="user-nav-logout" onclick="logoutUser()">Logout</button>
      </div>
    `;
  } else {
    userNavSlot.innerHTML = `
      <a href="login.html" class="user-login-btn">
        <i class="bi bi-person"></i>
        <span>Masuk</span>
      </a>
    `;
  }
}

document.addEventListener("DOMContentLoaded", renderUserNavbar);