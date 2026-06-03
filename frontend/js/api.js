// ============================================================
// api.js — versi rapi untuk frontend user + admin
// ============================================================

const BASE_URL = "http://localhost:5000";

// ─── TOKEN & AUTH ────────────────────────────────────────────
function getToken() {
  return localStorage.getItem("admin_token");
}

function saveToken(token) {
  localStorage.setItem("admin_token", token);
}

function removeToken() {
  localStorage.removeItem("admin_token");
  localStorage.removeItem("admin_user");

  localStorage.removeItem("customer_token");
  localStorage.removeItem("customer_user");
}

function isLoggedIn() {
  return !!getToken();
}

function authHeader(isJson = true) {
  const headers = {
    Authorization: `Bearer ${getToken()}`
  };

  if (isJson) {
    headers["Content-Type"] = "application/json";
  }

  return headers;
}

function logout() {
  removeToken();
  window.location.href = "login.html";
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
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Terjadi kesalahan pada server");
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

async function register(name, email, password) {
  return await safeFetch(`${BASE_URL}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password })
  });
}

async function getMe() {
  return await safeFetch(`${BASE_URL}/api/auth/me`, {
    headers: authHeader()
  });
}

// ─── KATEGORI ────────────────────────────────────────────────
async function getCategories() {
  return await safeFetch(`${BASE_URL}/api/categories`);
}

async function createCategory(data) {
  return await safeFetch(`${BASE_URL}/api/categories`, {
    method: "POST",
    headers: authHeader(),
    body: JSON.stringify(data)
  });
}

async function updateCategory(id, data) {
  return await safeFetch(`${BASE_URL}/api/categories/${id}`, {
    method: "PUT",
    headers: authHeader(),
    body: JSON.stringify(data)
  });
}

async function deleteCategory(id) {
  return await safeFetch(`${BASE_URL}/api/categories/${id}`, {
    method: "DELETE",
    headers: authHeader()
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
    headers: isFormData ? { Authorization: `Bearer ${getToken()}` } : authHeader(),
    body: isFormData ? formData : JSON.stringify(formData)
  });
}

async function updateProduct(id, formData) {
  const isFormData = typeof FormData !== "undefined" && formData instanceof FormData;

  return await safeFetch(`${BASE_URL}/api/products/${id}`, {
    method: "PUT",
    headers: isFormData ? { Authorization: `Bearer ${getToken()}` } : authHeader(),
    body: isFormData ? formData : JSON.stringify(formData)
  });
}

async function deleteProduct(id) {
  return await safeFetch(`${BASE_URL}/api/products/${id}`, {
    method: "DELETE",
    headers: authHeader()
  });
}

// ─── GALERI ──────────────────────────────────────────────────
async function getGallery() {
  return await safeFetch(`${BASE_URL}/api/gallery`);
}

async function createGallery(formData) {
  return await safeFetch(`${BASE_URL}/api/gallery`, {
    method: "POST",
    headers: { Authorization: `Bearer ${getToken()}` },
    body: formData
  });
}

async function deleteGallery(id) {
  return await safeFetch(`${BASE_URL}/api/gallery/${id}`, {
    method: "DELETE",
    headers: authHeader()
  });
}

// ─── TESTIMONI ───────────────────────────────────────────────
async function getTestimonials() {
  return await safeFetch(`${BASE_URL}/api/testimonials`);
}

async function getAllTestimonials() {
  return await safeFetch(`${BASE_URL}/api/testimonials/all`, {
    headers: authHeader()
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
    headers: authHeader()
  });
}

async function rejectTestimonial(id) {
  return await safeFetch(`${BASE_URL}/api/testimonials/${id}/reject`, {
    method: "PUT",
    headers: authHeader()
  });
}

// ─── BLOG ────────────────────────────────────────────────────
async function getBlogPosts(params = {}) {
  return await safeFetch(`${BASE_URL}/api/blog${buildQuery(params)}`);
}

async function getAllBlogPosts() {
  return await safeFetch(`${BASE_URL}/api/blog/all`, {
    headers: authHeader()
  });
}

async function getBlogBySlug(slug) {
  return await safeFetch(`${BASE_URL}/api/blog/${slug}`);
}

async function createBlogPost(formData) {
  return await safeFetch(`${BASE_URL}/api/blog`, {
    method: "POST",
    headers: { Authorization: `Bearer ${getToken()}` },
    body: formData
  });
}

async function updateBlogPost(id, formData) {
  return await safeFetch(`${BASE_URL}/api/blog/${id}`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${getToken()}` },
    body: formData
  });
}

async function deleteBlogPost(id) {
  return await safeFetch(`${BASE_URL}/api/blog/${id}`, {
    method: "DELETE",
    headers: authHeader()
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
    headers: authHeader(false)
  });
}

async function getOrders() {
  return await getAllOrders();
}

async function updateOrderStatus(id, status) {
  return await safeFetch(`${BASE_URL}/api/orders/${id}/status`, {
    method: "PUT",
    headers: authHeader(),
    body: JSON.stringify({ status })
  });
}

async function deleteOrder(id) {
  return await safeFetch(`${BASE_URL}/api/orders/${id}`, {
    method: "DELETE",
    headers: authHeader(false)
  });
}

async function generateWaLink(id) {
  return await safeFetch(`${BASE_URL}/api/orders/generate-wa/${id}`, {
    headers: authHeader(false)
  });
}