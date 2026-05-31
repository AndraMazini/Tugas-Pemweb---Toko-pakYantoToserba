document.addEventListener("DOMContentLoaded", async () => {
  await initKatalogPage();
});

let allProducts = [];
let allCategories = [];
let activeCategory = "";
let currentPage = 1;
const ITEMS_PER_PAGE = 8;

// =========================
// INIT
// =========================
async function initKatalogPage() {
  try {
    await Promise.all([
      loadCategories(),
      loadProducts()
    ]);

    normalizeCategoryData();
    bindInitialFilterFromURL();
    renderAll();
  } catch (error) {
    console.error("Gagal inisialisasi katalog:", error);
    renderErrorState("Gagal memuat data katalog.");
  }
}

async function loadCategories() {
  try {
    const res = await getCategories();
    if (!res.success) throw new Error(res.message || "Gagal memuat kategori");
    allCategories = Array.isArray(res.data) ? res.data : [];
  } catch (err) {
    console.warn("Kategori gagal dimuat dari API, lanjut fallback dari produk.", err);
    allCategories = [];
  }
}

async function loadProducts() {
  const res = await getProducts({ limit: 500 });
  if (!res.success) throw new Error(res.message || "Gagal memuat produk");
  allProducts = Array.isArray(res.data) ? res.data : [];
}

// =========================
// NORMALIZER
// =========================
function normalizeSlug(text = "") {
  return String(text || "")
    .trim()
    .toLowerCase()
    .replace(/&/g, "dan")
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function normalizeCategoryData() {
  // Rapikan data produk
  allProducts = allProducts.map((product) => {
    const categoryName = product.category_name || "";
    const categorySlug =
      product.category_slug ||
      normalizeSlug(categoryName);

    return {
      ...product,
      category_name: categoryName,
      category_slug: categorySlug,
      category_id: product.category_id ?? null
    };
  });

  // Jika kategori dari API kosong / tidak lengkap, ambil dari produk
  const categoriesFromProducts = new Map();

  allProducts.forEach((product) => {
    const slug = product.category_slug || normalizeSlug(product.category_name);
    const name = product.category_name || slug || "Kategori";

    if (!slug) return;

    categoriesFromProducts.set(slug, {
      id: product.category_id ?? slug,
      name,
      slug
    });
  });

  const categoriesFromApi = new Map();

  allCategories.forEach((cat) => {
    const slug = cat.slug || normalizeSlug(cat.name);
    if (!slug) return;

    categoriesFromApi.set(slug, {
      id: cat.id ?? slug,
      name: cat.name || slug,
      slug
    });
  });

  // Gabungkan: API prioritas, tapi produk melengkapi yang hilang
  categoriesFromProducts.forEach((value, key) => {
    if (!categoriesFromApi.has(key)) {
      categoriesFromApi.set(key, value);
    }
  });

  allCategories = Array.from(categoriesFromApi.values());
}

// =========================
// URL + FILTER
// =========================
function bindInitialFilterFromURL() {
  const params = new URLSearchParams(window.location.search);
  const category = params.get("category");
  if (category) {
    activeCategory = normalizeSlug(category);
  }
}

function setActiveCategory(slug = "") {
  activeCategory = normalizeSlug(slug);
  currentPage = 1;

  const nextUrl = activeCategory
    ? `katalog.html?category=${encodeURIComponent(activeCategory)}`
    : "katalog.html";

  window.history.replaceState({}, "", nextUrl);
  renderAll();
}

function filterKategori(slug = "") {
  setActiveCategory(slug);
}

function getFilteredProducts() {
  if (!activeCategory) return allProducts;

  return allProducts.filter((product) => {
    const pSlug = normalizeSlug(product.category_slug || "");
    const pName = normalizeSlug(product.category_name || "");
    const active = normalizeSlug(activeCategory);

    return pSlug === active || pName === active;
  });
}

// =========================
// RENDER
// =========================
function renderAll() {
  renderCategoryButtons();
  renderProducts();
  renderPagination();
}

function renderCategoryButtons() {
  const container = document.getElementById("filter-kategori");
  if (!container) return;

  const buttonsHtml = `
    <button class="filter-btn ${activeCategory === "" ? "active" : ""}" data-category="">
      Semua
    </button>
    ${allCategories.map(cat => `
      <button
        class="filter-btn ${normalizeSlug(cat.slug) === normalizeSlug(activeCategory) ? "active" : ""}"
        data-category="${escapeHtml(cat.slug)}">
        ${escapeHtml(cat.name)}
      </button>
    `).join("")}
  `;

  container.innerHTML = buttonsHtml;

  container.querySelectorAll(".filter-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const slug = btn.getAttribute("data-category") || "";
      setActiveCategory(slug);
    });
  });
}

function renderProducts() {
  const grid = document.getElementById("produk-grid");
  if (!grid) return;

  const filtered = getFilteredProducts();

  if (!filtered.length) {
    grid.innerHTML = `
      <div class="text-center text-muted py-5" style="grid-column: 1 / -1;">
        Belum ada produk untuk kategori ini.
      </div>
    `;
    return;
  }

  const start = (currentPage - 1) * ITEMS_PER_PAGE;
  const end = start + ITEMS_PER_PAGE;
  const pageItems = filtered.slice(start, end);

  grid.innerHTML = pageItems.map(product => `
    <div class="prod-card">
      <div class="prod-img-wrap">
        <img
          src="${resolveProductImage(product)}"
          alt="${escapeHtml(product.name || "Produk")}"
          class="prod-img"
          onerror="this.onerror=null;this.src='${getFallbackImageByProduct(product.name, product.category_name, product.category_slug)}';"
        />
      </div>

      <div class="prod-body">
        <div class="prod-meta-top">
          ${product.category_name ? `<span class="pill pill-category">${escapeHtml(product.category_name)}</span>` : ""}
          ${product.badge ? `<span class="pill pill-badge">${escapeHtml(product.badge)}</span>` : ""}
        </div>

        <div class="prod-name">${escapeHtml(product.name || "-")}</div>

        <div class="prod-desc">
          ${escapeHtml(product.description || "Produk kebutuhan harian tersedia di Toserba Pak Yanto.")}
        </div>

        <div class="prod-price">
          ${escapeHtml(product.price_range || "Hubungi toko untuk harga")}
        </div>

        <div class="prod-actions">
          <a href="index.html#kontak" class="btn-prod">
            <i class="bi bi-bag-check-fill"></i>
            Tanya Produk
          </a>

          <a
            href="https://wa.me/6282312740855?text=${encodeURIComponent(buildWhatsAppMessage(product))}"
            target="_blank"
            class="btn-prod-wa">
            <i class="bi bi-whatsapp"></i>
            WhatsApp
          </a>
        </div>
      </div>
    </div>
  `).join("");
}

function renderPagination() {
  const container = document.getElementById("pagination");
  if (!container) return;

  const filtered = getFilteredProducts();
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);

  if (totalPages <= 1) {
    container.innerHTML = "";
    return;
  }

  let html = "";

  html += `
    <button class="page-btn" ${currentPage === 1 ? "disabled" : ""} data-page="${currentPage - 1}">
      <i class="bi bi-chevron-left"></i>
    </button>
  `;

  for (let i = 1; i <= totalPages; i++) {
    html += `
      <button class="page-btn ${i === currentPage ? "active" : ""}" data-page="${i}">
        ${i}
      </button>
    `;
  }

  html += `
    <button class="page-btn" ${currentPage === totalPages ? "disabled" : ""} data-page="${currentPage + 1}">
      <i class="bi bi-chevron-right"></i>
    </button>
  `;

  container.innerHTML = html;

  container.querySelectorAll(".page-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const page = Number(btn.getAttribute("data-page"));
      goToPage(page);
    });
  });
}

function goToPage(page) {
  const filtered = getFilteredProducts();
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);

  if (page < 1 || page > totalPages) return;

  currentPage = page;
  renderProducts();
  renderPagination();

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}

// =========================
// HELPERS
// =========================
function buildWhatsAppMessage(product) {
  return `Halo Toserba Pak Yanto, saya ingin menanyakan produk:\n\nNama: ${product.name || "-"}\nKategori: ${product.category_name || "-"}\nHarga: ${product.price_range || "-"}\n\nApakah masih tersedia?`;
}

function getFallbackImageByCategory(categoryName = "", categorySlug = "") {
  const slug = normalizeSlug(categorySlug || categoryName);

  if (slug === "sembako") {
    return "https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=1200&auto=format&fit=crop";
  }
  if (slug === "kebutuhan-dapur" || slug === "peralatan-dapur") {
    return "https://images.unsplash.com/photo-1514996937319-344454492b37?q=80&w=1200&auto=format&fit=crop";
  }
  if (slug === "makanan-instan") {
    return "https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?q=80&w=1200&auto=format&fit=crop";
  }
  if (slug === "kebersihan") {
    return "https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=1200&auto=format&fit=crop";
  }
  if (slug === "rumah-tangga" || slug === "peralatan-rumah-tangga") {
    return "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=1200&auto=format&fit=crop";
  }

  return "https://via.placeholder.com/600x400?text=No+Image";
}

function getFallbackImageByProduct(productName = "", categoryName = "", categorySlug = "") {
  const name = String(productName || "").toLowerCase();

  const imageByProduct = {
    "beras premium 5kg": "https://images.unsplash.com/photo-1586201375761-83865001e31c?q=80&w=1200&auto=format&fit=crop",
    "beras pandan wangi super 5kg": "https://images.unsplash.com/photo-1586201375761-83865001e31c?q=80&w=1200&auto=format&fit=crop",
    "minyak goreng 2l": "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?q=80&w=1200&auto=format&fit=crop",
    "minyak goreng bimoli 2 liter": "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?q=80&w=1200&auto=format&fit=crop",
    "gula pasir 1kg": "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?q=80&w=1200&auto=format&fit=crop",
    "tepung terigu 1kg": "https://images.unsplash.com/photo-1608198093002-ad4e005484ec?q=80&w=1200&auto=format&fit=crop",
    "telur ayam 1kg": "https://images.unsplash.com/photo-1506976785307-8732e854ad03?q=80&w=1200&auto=format&fit=crop",
    "indomie goreng spesial (per dus)": "https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?q=80&w=1200&auto=format&fit=crop"
  };

  if (imageByProduct[name]) {
    return imageByProduct[name];
  }

  return getFallbackImageByCategory(categoryName, categorySlug);
}

function resolveProductImage(product) {
  const rawPath = product.image_url || "";

  if (!rawPath || rawPath.trim() === "") {
    return getFallbackImageByProduct(product.name, product.category_name, product.category_slug);
  }

  if (/^https?:\/\//i.test(rawPath)) {
    return rawPath;
  }

  if (typeof getImageUrl === "function") {
    return getImageUrl(rawPath);
  }

  return getFallbackImageByProduct(product.name, product.category_name, product.category_slug);
}

function renderErrorState(message) {
  const grid = document.getElementById("produk-grid");
  if (!grid) return;

  grid.innerHTML = `
    <div class="text-center text-danger py-5" style="grid-column: 1 / -1;">
      ${escapeHtml(message)}
    </div>
  `;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}