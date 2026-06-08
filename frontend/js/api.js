// ============================================================
// api.js — versi rapi untuk frontend user + admin
// ============================================================

const BASE_URL = "http://localhost:5000";

// ─── TOKEN & AUTH ────────────────────────────────────────────
function getAdminToken() {
  return localStorage.getItem("admin_token");
}

function saveAdminToken(token) {
  localStorage.setItem("admin_token", token || "");
}

function removeAdminToken() {
  localStorage.removeItem("admin_token");
  localStorage.removeItem("admin_user");
}

function isAdminLoggedIn() {
  return !!getAdminToken();
}

function getUserToken() {
  return localStorage.getItem("user_token");
}

function saveUserToken(token) {
  localStorage.setItem("user_token", token || "");
}

function removeUserToken() {
  localStorage.removeItem("user_token");
  localStorage.removeItem("user_user");
}

function isUserLoggedIn() {
  return !!getUserToken();
}

function adminAuthHeader(isJson = true) {
  const headers = {
    Authorization: `Bearer ${getAdminToken()}`
  };

  if (isJson) {
    headers["Content-Type"] = "application/json";
  }

  return headers;
}

function userAuthHeader(isJson = true) {
  const headers = {
    Authorization: `Bearer ${getUserToken()}`
  };

  if (isJson) {
    headers["Content-Type"] = "application/json";
  }

  return headers;
}

function logoutAdmin() {
  removeAdminToken();
  window.location.href = "admin/login.html";
}

// ─── USER SESSION UI HELPERS ─────────────────────────────────
function getCurrentUser() {
  try {
    return JSON.parse(localStorage.getItem("user_user") || "null");
  } catch {
    return null;
  }
}

function renderUserNavbar() {
  const user = getCurrentUser();
  const userNavSlot = document.getElementById("userNavSlot");

  if (!userNavSlot) return;

  if (user) {
    const displayName = user.name || user.nama || user.email || "Customer";

    userNavSlot.innerHTML = `
      <div class="user-nav-box d-flex align-items-center gap-2">
        <i class="bi bi-person-circle"></i>
        <span>${displayName}</span>
        <button class="btn btn-sm btn-outline-danger ms-2" onclick="logoutUser()">Logout</button>
      </div>
    `;
  } else {
    userNavSlot.innerHTML = `
      <a href="login.html" class="btn-primary-cta">
        <i class="bi bi-person"></i> Login
      </a>
    `;
  }
}

function logoutUser() {
  removeUserToken();
  window.location.reload();
}

function requireUserLoginBeforeCart() {
  const userToken = localStorage.getItem("user_token");
  const userData = localStorage.getItem("user_user");

  if (!userToken || !userData) {
    const goLogin = confirm(
      "Untuk menambahkan produk ke keranjang atau checkout, kamu harus login terlebih dahulu.\n\nKlik OK untuk login atau register."
    );

    if (goLogin) {
      window.location.href = "login.html";
    }

    return false;
  }

  return true;
}

function handleAddToCart(product) {
  if (!requireUserLoginBeforeCart()) return;
  addToCart(product);
}

// ─── HELPER ──────────────────────────────────────────────────
function getImageUrl(path) {
  if (!path) {
    return "https://via.placeholder.com/600x400?text=No+Image";
  }

  if (typeof path === "string" && path.startsWith("data:image/")) {
    return path;
  }

  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  let p = String(path).replace(/\\/g, "/");
  p = p.replace(/(^\/*)?src\//i, "");

  if (p.startsWith("/")) {
    return `${BASE_URL}${p}`;
  }

  if (p.startsWith("uploads/")) {
    return `${BASE_URL}/${p}`;
  }

  return `${BASE_URL}/${p.replace(/^\//, "")}`;
}

function formatDate(dateStr) {
  if (!dateStr) return "-";

  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return "-";

  return d.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric"
  });
}

function buildQuery(params = {}) {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      query.append(key, value);
    }
  });

  const queryString = query.toString();
  return queryString ? `?${queryString}` : "";
}

async function safeFetch(url, options = {}) {
  const res = await fetch(url, options);

  let data = null;
  try {
    data = await res.json();
  } catch {
    throw new Error("Respons server tidak valid");
  }

  if (!res.ok) {
    throw new Error(data?.message || "Terjadi kesalahan pada server");
  }

  return data;
}

// ─── AUTH ────────────────────────────────────────────────────
async function login(email, password) {
  return await safeFetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });
}

async function register(payload) {
  return await safeFetch(`${BASE_URL}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
}

async function getMe() {
  return await safeFetch(`${BASE_URL}/api/auth/me`, {
    headers: userAuthHeader(false)
  });
}

// ─── KATEGORI ────────────────────────────────────────────────
async function getCategories() {
  return await safeFetch(`${BASE_URL}/api/categories`);
}

async function createCategory(data) {
  return await safeFetch(`${BASE_URL}/api/categories`, {
    method: "POST",
    headers: adminAuthHeader(),
    body: JSON.stringify(data)
  });
}

async function updateCategory(id, data) {
  return await safeFetch(`${BASE_URL}/api/categories/${id}`, {
    method: "PUT",
    headers: adminAuthHeader(),
    body: JSON.stringify(data)
  });
}

async function deleteCategory(id) {
  return await safeFetch(`${BASE_URL}/api/categories/${id}`, {
    method: "DELETE",
    headers: adminAuthHeader(false)
  });
}

// ─── PRODUK ──────────────────────────────────────────────────
async function getProducts(params = {}) {
  return await safeFetch(`${BASE_URL}/api/products${buildQuery(params)}`);
}

async function getProductById(id) {
  return await safeFetch(`${BASE_URL}/api/products/${id}`);
}

async function createProduct(formData) {
  const isFormData = typeof FormData !== "undefined" && formData instanceof FormData;

  return await safeFetch(`${BASE_URL}/api/products`, {
    method: "POST",
    headers: isFormData ? { Authorization: `Bearer ${getAdminToken()}` } : adminAuthHeader(),
    body: isFormData ? formData : JSON.stringify(formData)
  });
}

async function updateProduct(id, formData) {
  const isFormData = typeof FormData !== "undefined" && formData instanceof FormData;

  return await safeFetch(`${BASE_URL}/api/products/${id}`, {
    method: "PUT",
    headers: isFormData ? { Authorization: `Bearer ${getAdminToken()}` } : adminAuthHeader(),
    body: isFormData ? formData : JSON.stringify(formData)
  });
}

async function deleteProduct(id) {
  return await safeFetch(`${BASE_URL}/api/products/${id}`, {
    method: "DELETE",
    headers: adminAuthHeader(false)
  });
}

// ─── GALERI ──────────────────────────────────────────────────
async function getGallery() {
  return await safeFetch(`${BASE_URL}/api/gallery`);
}

async function createGallery(formData) {
  return await safeFetch(`${BASE_URL}/api/gallery`, {
    method: "POST",
    headers: { Authorization: `Bearer ${getAdminToken()}` },
    body: formData
  });
}

async function deleteGallery(id) {
  return await safeFetch(`${BASE_URL}/api/gallery/${id}`, {
    method: "DELETE",
    headers: adminAuthHeader(false)
  });
}

// ─── TESTIMONI ───────────────────────────────────────────────
async function getTestimonials() {
  return await safeFetch(`${BASE_URL}/api/testimonials`);
}

async function getAllTestimonials() {
  return await safeFetch(`${BASE_URL}/api/testimonials/all`, {
    headers: adminAuthHeader(false)
  });
}

async function submitTestimonial(data) {
  return await safeFetch(`${BASE_URL}/api/testimonials`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
}

async function approveTestimonial(id) {
  return await safeFetch(`${BASE_URL}/api/testimonials/${id}/approve`, {
    method: "PUT",
    headers: adminAuthHeader(false)
  });
}

async function rejectTestimonial(id) {
  return await safeFetch(`${BASE_URL}/api/testimonials/${id}/reject`, {
    method: "PUT",
    headers: adminAuthHeader(false)
  });
}

// ─── BLOG ────────────────────────────────────────────────────
async function getBlogPosts(params = {}) {
  return await safeFetch(`${BASE_URL}/api/blog${buildQuery(params)}`);
}

async function getAllBlogPosts() {
  return await safeFetch(`${BASE_URL}/api/blog/all`, {
    headers: adminAuthHeader(false)
  });
}

async function getBlogBySlug(slug) {
  return await safeFetch(`${BASE_URL}/api/blog/${slug}`);
}

async function createBlogPost(formData) {
  return await safeFetch(`${BASE_URL}/api/blog`, {
    method: "POST",
    headers: { Authorization: `Bearer ${getAdminToken()}` },
    body: formData
  });
}

async function updateBlogPost(id, formData) {
  return await safeFetch(`${BASE_URL}/api/blog/${id}`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${getAdminToken()}` },
    body: formData
  });
}

async function deleteBlogPost(id) {
  return await safeFetch(`${BASE_URL}/api/blog/${id}`, {
    method: "DELETE",
    headers: adminAuthHeader(false)
  });
}

// ─── ORDER ───────────────────────────────────────────────────
async function submitOrder(data) {
  return await safeFetch(`${BASE_URL}/api/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
}

async function getAllOrders(params = {}) {
  return await safeFetch(`${BASE_URL}/api/orders${buildQuery(params)}`, {
    headers: adminAuthHeader(false)
  });
}

async function getOrders() {
  return await getAllOrders();
}

async function updateOrderStatus(id, status) {
  return await safeFetch(`${BASE_URL}/api/orders/${id}/status`, {
    method: "PUT",
    headers: adminAuthHeader(),
    body: JSON.stringify({ status })
  });
}

async function deleteOrder(id) {
  return await safeFetch(`${BASE_URL}/api/orders/${id}`, {
    method: "DELETE",
    headers: adminAuthHeader(false)
  });
}

async function generateWaLink(id) {
  return await safeFetch(`${BASE_URL}/api/orders/generate-wa/${id}`, {
    headers: adminAuthHeader(false)
  });
}

// ─── ADMIN LOGIN ─────────────────────────────────────────────
async function handleAdminLogin(email, password) {
  const res = await login(email, password);

  if (res.success) {
    localStorage.setItem("admin_token", res.token || res.data?.token || "");
    localStorage.setItem("admin_user", JSON.stringify(res.user || res.data?.user || res.data || {}));
    window.location.href = "dashboard.html";
  }
}

// ─── ORDER PAYLOAD FOR CUSTOMER ──────────────────────────────
function buildOrderPayload(cartItems) {
  const user = JSON.parse(localStorage.getItem("user_user") || "null");

  return {
    user_id: user?.id || null,
    customer_name: user?.name || user?.nama || "",
    email: user?.email || "",
    items: cartItems
  };
}