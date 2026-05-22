// ============================================================
//  api.js — JANGAN DIUBAH TANPA KOORDINASI
//  File ini dipakai bersama oleh landing page & admin panel
// ============================================================

// Disesuaikan ke port backend Node.js 5000 yang sedang berjalan aktif
const BASE_URL = 'http://localhost:5000'; 

// ─── HELPER ─────────────────────────────────────────────────
function getToken() {
  return localStorage.getItem('admin_token');
}

function saveToken(token) {
  localStorage.setItem('admin_token', token);
}

function removeToken() {
  localStorage.removeItem('admin_token');
  localStorage.removeItem('admin_user');
}

function isLoggedIn() {
  return !!getToken();
}

function getImageUrl(path) {
  if (!path) return '/assets/images/placeholder.jpg';
  return `${BASE_URL}${path}`;
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: 'numeric', month: 'long', year: 'numeric'
  });
}

function authHeader() {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${getToken()}`
  };
}

// ─── GLOBAL AUTH ACTIONS ─────────────────────────────────────
function logout() {
  removeToken();
  // Jalur aman relatif dari subfolder admin maupun landing page utama
  window.location.href = 'login.html'; 
}

// ─── AUTH ────────────────────────────────────────────────────
async function login(email, password) {
  const res = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  return res.json();
}

async function getMe() {
  const res = await fetch(`${BASE_URL}/api/auth/me`, {
    headers: authHeader()
  });
  return res.json();
}

// ─── KATEGORI ────────────────────────────────────────────────
async function getCategories() {
  const res = await fetch(`${BASE_URL}/api/categories`);
  return res.json();
}

async function createCategory(data) {
  const res = await fetch(`${BASE_URL}/api/categories`, {
    method: 'POST',
    headers: authHeader(),
    body: JSON.stringify(data)
  });
  return res.json();
}

async function updateCategory(id, data) {
  const res = await fetch(`${BASE_URL}/api/categories/${id}`, {
    method: 'PUT',
    headers: authHeader(),
    body: JSON.stringify(data)
  });
  return res.json();
}

async function deleteCategory(id) {
  const res = await fetch(`${BASE_URL}/api/categories/${id}`, {
    method: 'DELETE',
    headers: authHeader()
  });
  return res.json();
}

// ─── PRODUK ──────────────────────────────────────────────────
async function getProducts(params = {}) {
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`${BASE_URL}/api/products${query ? '?' + query : ''}`);
  return res.json();
}

async function getProductById(id) {
  const res = await fetch(`${BASE_URL}/api/products/${id}`);
  return res.json();
}

async function createProduct(formData) {
  const res = await fetch(`${BASE_URL}/api/products`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${getToken()}` },
    body: formData  
  });
  return res.json();
}

async function updateProduct(id, formData) {
  const res = await fetch(`${BASE_URL}/api/products/${id}`, {
    method: 'PUT',
    headers: { 'Authorization': `Bearer ${getToken()}` },
    body: formData
  });
  return res.json();
}

async function deleteProduct(id) {
  const res = await fetch(`${BASE_URL}/api/products/${id}`, {
    method: 'DELETE',
    headers: authHeader()
  });
  return res.json();
}

// ─── GALERI ──────────────────────────────────────────────────
async function getGallery() {
  const res = await fetch(`${BASE_URL}/api/gallery`);
  return res.json();
}

async function createGallery(formData) {
  const res = await fetch(`${BASE_URL}/api/gallery`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${getToken()}` },
    body: formData
  });
  return res.json();
}

async function deleteGallery(id) {
  const res = await fetch(`${BASE_URL}/api/gallery/${id}`, {
    method: 'DELETE',
    headers: authHeader()
  });
  return res.json();
}

// ─── TESTIMONI ───────────────────────────────────────────────
async function getTestimonials() {
  const res = await fetch(`${BASE_URL}/api/testimonials`);
  return res.json();
}

async function getAllTestimonials() {
  const res = await fetch(`${BASE_URL}/api/testimonials/all`, {
    headers: authHeader()
  });
  return res.json();
}

async function submitTestimonial(data) {
  const res = await fetch(`${BASE_URL}/api/testimonials`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.json();
}

async function approveTestimonial(id) {
  const res = await fetch(`${BASE_URL}/api/testimonials/${id}/approve`, {
    method: 'PUT',
    headers: authHeader()
  });
  return res.json();
}

async function rejectTestimonial(id) {
  const res = await fetch(`${BASE_URL}/api/testimonials/${id}/reject`, {
    method: 'PUT',
    headers: authHeader()
  });
  return res.json();
}

// ─── BLOG ────────────────────────────────────────────────────
async function getBlogPosts(params = {}) {
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`${BASE_URL}/api/blog${query ? '?' + query : ''}`);
  return res.json();
}

async function getAllBlogPosts() {
  const res = await fetch(`${BASE_URL}/api/blog/all`, {
    headers: authHeader()
  });
  return res.json();
}

async function getBlogBySlug(slug) {
  const res = await fetch(`${BASE_URL}/api/blog/${slug}`);
  return res.json();
}

async function createBlogPost(formData) {
  const res = await fetch(`${BASE_URL}/api/blog`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${getToken()}` },
    body: formData
  });
  return res.json();
}

async function updateBlogPost(id, formData) {
  const res = await fetch(`${BASE_URL}/api/blog/${id}`, {
    method: 'PUT',
    headers: { 'Authorization': `Bearer ${getToken()}` },
    body: formData
  });
  return res.json();
}

async function deleteBlogPost(id) {
  const res = await fetch(`${BASE_URL}/api/blog/${id}`, {
    method: 'DELETE',
    headers: authHeader()
  });
  return res.json();
}

// ─── ORDER ───────────────────────────────────────────────────
async function submitOrder(data) {
  const res = await fetch(`${BASE_URL}/api/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.json();
}

async function getAllOrders(params = {}) {
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`${BASE_URL}/api/orders${query ? '?' + query : ''}`, {
    headers: authHeader()
  });
  return res.json();
}

// Jembatan / Alias fungsi agar orders.html dan orders.js tidak error mencari fungsi getOrders
async function getOrders() {
  return getAllOrders();
}

async function updateOrderStatus(id, status) {
  const res = await fetch(`${BASE_URL}/api/orders/${id}/status`, {
    method: 'PUT',
    headers: authHeader(),
    body: JSON.stringify({ status })
  });
  return res.json();
}

async function deleteOrder(id) {
  const res = await fetch(`${BASE_URL}/api/orders/${id}`, {
    method: 'DELETE',
    headers: authHeader()
  });
  return res.json();
}

async function generateWaLink(id) {
  const res = await fetch(`${BASE_URL}/api/orders/generate-wa/${id}`, {
    headers: authHeader()
  });
  return res.json();
}

// ... (Biarkan semua kode asli api.js milikmu di atas tetap seperti itu) ...

async function generateWaLink(id) {
  const res = await fetch(`${BASE_URL}/api/orders/generate-wa/${id}`, {
    headers: authHeader()
  });
  return res.json();
}

// ─── ADDISIONAL REGISTER ACTION (TAMBAHAN BARU DI PALING BAWAH) ───
async function register(name, email, password) {
  const res = await fetch(`${BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password })
  });
  return res.json();
}