document.addEventListener("DOMContentLoaded", async () => {
  initDarkMode();
  initInstantAnchorScroll();
  initNavbarActiveState();
  initInquiryFormWhatsApp();
  initReviewForm();
  initRoleUI();
  updateCartBadge();

  await loadKategori();
  await loadProdukPilihan();
  await loadGallery();
  await loadBlogPreview();
  await loadTestimoni();
  await loadStats();

  initRevealOnScroll();
});

function showToast(message) {
  const toast = document.getElementById("toastFloat");
  if (!toast) {
    alert(message);
    return;
  }

  toast.textContent = message;
  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
  }, 2200);
}

function initDarkMode() {
  const body = document.body;
  const toggle = document.getElementById("modeToggle");
  const savedTheme = localStorage.getItem("theme");

  if (savedTheme === "dark") {
    body.classList.add("dark");
    if (toggle) toggle.innerHTML = '<i class="bi bi-sun-fill"></i>';
  } else {
    body.classList.remove("dark");
    if (toggle) toggle.innerHTML = '<i class="bi bi-moon-stars-fill"></i>';
  }

  toggle?.addEventListener("click", () => {
    body.classList.toggle("dark");
    const isDark = body.classList.contains("dark");
    localStorage.setItem("theme", isDark ? "dark" : "light");

    toggle.innerHTML = isDark
      ? '<i class="bi bi-sun-fill"></i>'
      : '<i class="bi bi-moon-stars-fill"></i>';

    showToast(isDark ? "Mode gelap diaktifkan" : "Mode terang diaktifkan");
  });

  const hamburger = document.getElementById("hamburger");
  const mobileNav = document.getElementById("mobileNav");

  hamburger?.addEventListener("click", () => {
    mobileNav?.classList.toggle("open");
  });
}

function initInstantAnchorScroll() {
  const links = document.querySelectorAll('a[href^="#"]');

  links.forEach(link => {
    link.addEventListener("click", function (e) {
      const href = this.getAttribute("href");
      if (!href || href === "#") return;

      const target = document.querySelector(href);
      if (!target) return;

      e.preventDefault();

      const navbar = document.getElementById("mainNavbar");
      const offset = navbar ? navbar.offsetHeight + 10 : 90;
      const topPos = target.getBoundingClientRect().top + window.pageYOffset - offset;

      window.scrollTo({
        top: topPos,
        behavior: "smooth"
      });

      const mobileNav = document.getElementById("mobileNav");
      mobileNav?.classList.remove("open");
    });
  });
}

function initNavbarActiveState() {
  const navLinks = document.querySelectorAll('.nav-links a[href^="#"], .mobile-nav a[href^="#"]');
  const sections = document.querySelectorAll("section[id]");

  function updateActiveLink() {
    let currentSection = "beranda";

    sections.forEach((section) => {
      const sectionTop = section.offsetTop - 140;
      const sectionHeight = section.offsetHeight;

      if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
        currentSection = section.getAttribute("id");
      }
    });

    navLinks.forEach(link => {
      link.classList.remove("active");
      if (link.getAttribute("href") === `#${currentSection}`) {
        link.classList.add("active");
      }
    });
  }

  updateActiveLink();
  window.addEventListener("scroll", updateActiveLink);
}

function initRevealOnScroll() {
  const items = document.querySelectorAll(".fade-in");

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
      }
    });
  }, { threshold: 0.12 });

  items.forEach(item => observer.observe(item));
}

function initRoleUI() {
  const adminBtn = document.getElementById("admin-btn");
  const adminBtnDesktop = document.getElementById("admin-btn-desktop");

  try {
    const user = JSON.parse(localStorage.getItem("admin_user") || "null");
    const token = localStorage.getItem("admin_token");

    if (user && user.role && (user.role === "admin" || user.role === "superadmin")) {
      adminBtn?.classList.remove("d-none");
      adminBtnDesktop?.classList.remove("d-none");
    } else {
      adminBtn?.classList.add("d-none");
      adminBtnDesktop?.classList.add("d-none");
    }

    const userLoginNav = document.getElementById("user-login-nav");
    const userLogoutNav = document.getElementById("user-logout-nav");
    const userLogoutBtn = document.getElementById("user-logout-btn");

    if (userLoginNav) {
      if (token) userLoginNav.classList.add("d-none");
      else userLoginNav.classList.remove("d-none");
    }

    if (userLogoutNav) {
      if (token && user?.role === "user") userLogoutNav.classList.remove("d-none");
      else userLogoutNav.classList.add("d-none");
    }

    if (userLogoutBtn) {
      userLogoutBtn.onclick = () => {
        localStorage.removeItem("admin_token");
        localStorage.removeItem("admin_user");
        window.location.reload();
      };
    }
  } catch {
    adminBtn?.classList.add("d-none");
    adminBtnDesktop?.classList.add("d-none");
  }
}

function normalizeSlug(text = "") {
  return String(text || "")
    .trim()
    .toLowerCase()
    .replace(/&/g, "dan")
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function resolveCategoryAlias(slug = "") {
  const normalized = normalizeSlug(slug);

  const aliasMap = {
    "peralatan-dapur": "kebutuhan-dapur",
    "kebutuhan-dapur": "kebutuhan-dapur",

    "peralatan-rumah-tangga": "peralatan-rumah-tangga",
    "rumah-tangga": "peralatan-rumah-tangga",

    "plastik-wadah": "plastik-dan-wadah",
    "plastik-dan-wadah": "plastik-dan-wadah",

    "makanan-instan": "makanan-instan",
    "makanan instan": "makanan-instan",

    "sembako": "sembako",
    "kebersihan": "kebersihan"
  };

  return aliasMap[normalized] || normalized;
}

function getSafeCategorySlug(cat) {
  return resolveCategoryAlias(cat?.slug || cat?.name || "");
}

function getFallbackImageByCategory(categoryName = "", categorySlug = "") {
  const slug = resolveCategoryAlias(categorySlug || categoryName);
  const name = String(categoryName || "").toLowerCase();

  if (slug === "sembako" || name === "sembako") {
    return "https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=1200&auto=format&fit=crop";
  }
  if (slug === "kebutuhan-dapur") {
    return "https://images.unsplash.com/photo-1514996937319-344454492b37?q=80&w=1200&auto=format&fit=crop";
  }
  if (slug === "peralatan-rumah-tangga") {
    return "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=1200&auto=format&fit=crop";
  }
  if (slug === "kebersihan" || name === "kebersihan") {
    return "https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=1200&auto=format&fit=crop";
  }
  if (slug === "plastik-dan-wadah" || name === "plastik & wadah" || name === "plastik dan wadah") {
    return "https://images.unsplash.com/photo-1615484477778-ca3b77940c25?q=80&w=1200&auto=format&fit=crop";
  }
  if (slug === "makanan-instan") {
    return "https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?q=80&w=1200&auto=format&fit=crop";
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
    "mie instan paket 5": "https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?q=80&w=1200&auto=format&fit=crop",
    "indomie goreng spesial (per dus)": "https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?q=80&w=1200&auto=format&fit=crop",
    "mie sedaap soto 1 dus": "https://images.unsplash.com/photo-1585032226651-759b368d7246?q=80&w=1200&auto=format&fit=crop",
    "pop mie ayam": "https://images.unsplash.com/photo-1626808642875-0aa545482dfb?q=80&w=1200&auto=format&fit=crop"
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

function handleAddToCartHome(product) {
  if (typeof addToCart === "function") {
    addToCart(product);
  }
  updateCartBadge();
  showToast(`${product.name} ditambahkan ke keranjang`);
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

async function loadKategori() {
  const grid = document.getElementById("kategori-grid");
  if (!grid) return;

  try {
    const res = await getCategories();

    if (!res.success || !res.data || res.data.length === 0) {
      grid.innerHTML = `
        <div class="col-12 text-center text-muted py-4">
          Belum ada kategori
        </div>
      `;
      return;
    }

    const descriptionMap = {
      "sembako": "Kebutuhan pokok harian seperti beras, gula, minyak, telur, dan stok rumah lainnya.",
      "kebutuhan-dapur": "Peralatan dan perlengkapan dapur agar aktivitas memasak jadi lebih praktis.",
      "makanan-instan": "Pilihan makanan praktis untuk stok rumah, bekal, dan kebutuhan cepat saji.",
      "kebersihan": "Produk kebersihan rumah tangga untuk menjaga rumah tetap bersih dan nyaman.",
      "plastik-dan-wadah": "Wadah dan perlengkapan penyimpanan untuk kebutuhan rumah tangga sehari-hari.",
      "peralatan-rumah-tangga": "Perlengkapan rumah tangga serbaguna untuk memudahkan aktivitas keluarga."
    };

    const preferredOrder = [
      "sembako",
      "kebutuhan-dapur",
      "makanan-instan",
      "kebersihan",
      "plastik-dan-wadah",
      "peralatan-rumah-tangga"
    ];

    const fallbackCategories = [
      { name: "Sembako", slug: "sembako", icon: "bi-box-seam-fill" },
      { name: "Kebutuhan Dapur", slug: "kebutuhan-dapur", icon: "bi-basket2-fill" },
      { name: "Makanan Instan", slug: "makanan-instan", icon: "bi-cup-hot-fill" },
      { name: "Kebersihan", slug: "kebersihan", icon: "bi-stars" }
    ];

    const categories = res.data
      .map((cat) => ({
        ...cat,
        safeSlug: getSafeCategorySlug(cat)
      }))
      .filter((cat) => !!cat.safeSlug);

    const seen = new Set();
    const uniqueCategories = categories.filter((cat) => {
      if (seen.has(cat.safeSlug)) return false;
      seen.add(cat.safeSlug);
      return true;
    });

    uniqueCategories.sort((a, b) => {
      const indexA = preferredOrder.indexOf(a.safeSlug);
      const indexB = preferredOrder.indexOf(b.safeSlug);

      const safeIndexA = indexA === -1 ? 999 : indexA;
      const safeIndexB = indexB === -1 ? 999 : indexB;

      return safeIndexA - safeIndexB;
    });

    let homepageCategories = uniqueCategories.slice(0, 4);

    if (homepageCategories.length < 4) {
      const used = new Set(homepageCategories.map(item => item.safeSlug));

      fallbackCategories.forEach(item => {
        if (homepageCategories.length >= 4) return;
        if (used.has(item.slug)) return;

        homepageCategories.push({
          ...item,
          safeSlug: item.slug
        });
        used.add(item.slug);
      });
    }

    grid.innerHTML = homepageCategories.map((cat, index) => {
      const iconClass = cat.icon || "bi-box-seam-fill";
      const desc =
        descriptionMap[cat.safeSlug] ||
        "Lihat koleksi produk pilihan dalam kategori ini dan temukan kebutuhan terbaik untuk rumah Anda.";

      return `
        <a href="katalog.html?category=${encodeURIComponent(cat.safeSlug)}"
           class="category-grid-card reveal-up"
           style="animation-delay:${index * 0.06}s;">
          <div>
            <div class="category-grid-icon">
              <i class="bi ${iconClass}"></i>
            </div>

            <div class="category-grid-title">${escapeHtml(cat.name)}</div>

            <div class="category-grid-text">${escapeHtml(desc)}</div>
          </div>

          <div class="category-grid-link">
            Lihat Produk
            <i class="bi bi-arrow-right-short"></i>
          </div>
        </a>
      `;
    }).join("");
  } catch (err) {
    console.error("Gagal memuat kategori:", err);
    grid.innerHTML = `
      <div class="col-12 text-center text-danger py-4">
        Gagal memuat kategori
      </div>
    `;
  }
}

async function loadProdukPilihan() {
  const grid = document.getElementById("produk-grid");
  if (!grid) return;

  try {
    const res = await getProducts({ limit: 8 });

    if (!res.success || !res.data || res.data.length === 0) {
      grid.innerHTML = `
        <div class="col-12 text-center text-muted py-4">
          Belum ada produk pilihan hari ini
        </div>
      `;
      return;
    }

    grid.innerHTML = res.data.map(product => {
      const productCategorySlug = resolveCategoryAlias(product.category_slug || product.category_name || "");

      return `
        <div class="col-12 col-md-6 col-xl-3">
          <div class="product-card home-product-card h-100">
            <div class="product-image-wrap" style="height: 230px; overflow: hidden; border-bottom: 1px solid var(--border-soft);">
              <img
                src="${resolveProductImage(product)}"
                alt="${escapeHtml(product.name || "Produk")}"
                class="product-image"
                onerror="this.onerror=null;this.src='${getFallbackImageByProduct(product.name, product.category_name, product.category_slug)}';"
              />
            </div>

            <div class="product-body">
              <div class="d-flex flex-wrap gap-2 mb-2">
                ${product.category_name ? `<span class="badge-soft badge-category">${escapeHtml(product.category_name)}</span>` : ""}
                ${product.badge ? `<span class="badge-soft badge-accent">${escapeHtml(product.badge)}</span>` : `<span class="badge-soft badge-accent">Pilihan</span>`}
              </div>

              <h3 class="product-title">${escapeHtml(product.name || "-")}</h3>

              <p class="feature-text mb-2" style="min-height: 48px;">
                ${
                  product.description
                    ? escapeHtml(product.description.length > 70 ? product.description.slice(0, 70) + "..." : product.description)
                    : "Produk kebutuhan harian pilihan untuk membantu belanja lebih mudah dan praktis."
                }
              </p>

              <div class="product-meta mb-3">${escapeHtml(product.price_range || "Hubungi toko untuk harga terbaru")}</div>

              <div class="home-product-actions d-grid gap-2">
                <button
                  class="btn btn-cart-home btn-sm"
                  onclick='handleAddToCartHome(${JSON.stringify({
                    id: product.id,
                    name: product.name,
                    price_range: product.price_range || "",
                    image_url: product.image_url || "",
                    category_name: product.category_name || ""
                  }).replace(/'/g, "&apos;")})'>
                  <i class="bi bi-cart-plus-fill me-2"></i>Tambah ke Keranjang
                </button>

                <a
                  href="katalog.html?category=${encodeURIComponent(productCategorySlug)}"
                  class="btn btn-detail-home btn-sm">
                  <i class="bi bi-eye me-2"></i>Lihat Detail
                </a>

                <a
                  href="https://wa.me/6282312740855?text=${encodeURIComponent(`Halo Toserba Pak Yanto, saya ingin menanyakan produk: ${product.name}`)}"
                  target="_blank"
                  class="btn btn-wa-home btn-sm">
                  <i class="bi bi-whatsapp me-2"></i>Tanya via WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      `;
    }).join("");
  } catch (err) {
    console.error("Gagal memuat produk:", err);
    grid.innerHTML = `
      <div class="col-12 text-center text-danger py-4">
        Gagal memuat produk pilihan
      </div>
    `;
  }
}

async function loadGallery() {
  const grid = document.getElementById("galleryList");
  if (!grid) return;

  try {
    if (typeof getGallery !== "function") return;

    const res = await getGallery();

    if (!res.success || !res.data || res.data.length === 0) {
      grid.innerHTML = `
        <div class="col-12 text-center text-muted py-4">
          Belum ada galeri.
        </div>
      `;
      return;
    }

    grid.innerHTML = res.data.slice(0, 6).map(img => `
      <div class="col-6 col-md-4">
        <div class="gal-card">
          <img
            src="${typeof getImageUrl === "function" ? getImageUrl(img.image_url || img.file_path || img.url) : (img.image_url || img.file_path || img.url || "https://via.placeholder.com/600x400?text=No+Image")}"
            alt="${escapeHtml(img.title || "Galeri")}"
            class="gal-img"
            onerror="this.onerror=null;this.src='https://via.placeholder.com/600x400?text=No+Image';"
          />
          <div class="gal-body">
            <p class="gal-cap">${escapeHtml(img.title || "Galeri Toserba Pak Yanto")}</p>
          </div>
        </div>
      </div>
    `).join("");
  } catch (err) {
    console.error("Gagal memuat galeri:", err);
    grid.innerHTML = `
      <div class="col-12 text-center text-danger py-4">
        Gagal memuat galeri
      </div>
    `;
  }
}

async function loadBlogPreview() {
  const grid = document.getElementById("blog-grid");
  if (!grid) return;

  try {
    if (typeof getBlogPosts !== "function") return;

    const res = await getBlogPosts({ limit: 3 });

    if (!res.success || !res.data || res.data.length === 0) {
      grid.innerHTML = `
        <div class="col-12 text-center text-muted py-4">
          Belum ada artikel
        </div>
      `;
      return;
    }

    grid.innerHTML = res.data.map(post => `
      <div class="col-12 col-md-4">
        <a href="blog-detail.html?slug=${encodeURIComponent(post.slug)}"
           class="blog-card d-block text-decoration-none text-dark h-100">
          <div style="height:220px; overflow:hidden;">
            ${
              post.thumbnail_url
                ? `<img src="${typeof getImageUrl === "function" ? getImageUrl(post.thumbnail_url) : post.thumbnail_url}" alt="${escapeHtml(post.title)}" class="blog-img" onerror="this.onerror=null;this.src='https://via.placeholder.com/800x400?text=No+Image';">`
                : `<div class="d-flex align-items-center justify-content-center h-100 fs-1">📝</div>`
            }
          </div>
          <div class="blog-body">
            <h3 class="blog-title">${escapeHtml(post.title)}</h3>
            <div class="blog-meta">${formatDate(post.created_at)}</div>
          </div>
        </a>
      </div>
    `).join("");
  } catch (err) {
    console.error("Gagal memuat blog:", err);
    grid.innerHTML = `
      <div class="col-12 text-center text-danger py-4">
        Gagal memuat artikel
      </div>
    `;
  }
}

async function loadTestimoni() {
  const grid = document.getElementById("user-testimoni-grid");
  if (!grid) return;

  try {
    if (typeof getTestimonials !== "function") return;

    const res = await getTestimonials();

    if (!res.success || !res.data || res.data.length === 0) {
      grid.innerHTML = `
        <div class="col-12 text-center text-muted py-4">
          Belum ada testimoni
        </div>
      `;
      return;
    }

    grid.innerHTML = res.data.slice(0, 6).map(item => {
      const rating = Number(item.rating || 5);
      const initials = String(item.name || "P").trim().charAt(0).toUpperCase();

      return `
        <div class="col-12 col-md-6 col-xl-4">
          <div class="testi-card h-100">
            <div class="testi-stars">${"★".repeat(Math.max(1, Math.min(5, rating)))}</div>
            <div class="testi-text">"${escapeHtml(item.message || "Pelayanan sangat baik dan produk lengkap.")}"</div>
            <div class="testi-author">
              <div class="testi-avatar">${initials}</div>
              <div>
                <div class="testi-name">${escapeHtml(item.name || "Pelanggan")}</div>
                <div class="testi-role">Pelanggan</div>
              </div>
            </div>
          </div>
        </div>
      `;
    }).join("");
  } catch (err) {
    console.error("Gagal memuat testimoni:", err);
    grid.innerHTML = `
      <div class="col-12 text-center text-danger py-4">
        Gagal memuat testimoni
      </div>
    `;
  }
}

async function loadStats() {
  try {
    const [categoriesRes, productsRes, testimonialsRes] = await Promise.allSettled([
      typeof getCategories === "function" ? getCategories() : Promise.resolve({ success: false, data: [] }),
      typeof getProducts === "function" ? getProducts({ limit: 500 }) : Promise.resolve({ success: false, data: [] }),
      typeof getTestimonials === "function" ? getTestimonials() : Promise.resolve({ success: false, data: [] })
    ]);

    const categories = categoriesRes.status === "fulfilled" && categoriesRes.value?.success
      ? (categoriesRes.value.data || [])
      : [];

    const products = productsRes.status === "fulfilled" && productsRes.value?.success
      ? (productsRes.value.data || [])
      : [];

    const testimonials = testimonialsRes.status === "fulfilled" && testimonialsRes.value?.success
      ? (testimonialsRes.value.data || [])
      : [];

    const statProducts = document.getElementById("statProducts");
    const statCategories = document.getElementById("statCategories");
    const statTestimonials = document.getElementById("statTestimonials");

    if (statProducts) statProducts.textContent = String(products.length || 0);
    if (statCategories) statCategories.textContent = String(categories.length || 0);
    if (statTestimonials) statTestimonials.textContent = String(testimonials.length || 0);
  } catch (err) {
    console.error("Gagal memuat statistik:", err);
  }
}

function initInquiryFormWhatsApp() {
  const form = document.getElementById("inquiryForm");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const nama = form.querySelector('[name="nama"]')?.value?.trim() || "";
    const telepon = form.querySelector('[name="telepon"]')?.value?.trim() || "";
    const produk = form.querySelector('[name="produk"]')?.value?.trim() || "";
    const pesan = form.querySelector('[name="pesan"]')?.value?.trim() || "";

    const waText = `Halo Toserba Pak Yanto,%0A%0ASaya ingin bertanya:%0A- Nama: ${encodeURIComponent(nama)}%0A- Telepon: ${encodeURIComponent(telepon)}%0A- Produk/Kebutuhan: ${encodeURIComponent(produk)}%0A- Pesan: ${encodeURIComponent(pesan)}`;

    if (typeof createOrder === "function") {
      try {
        await createOrder({
          customer_name: nama,
          phone: telepon,
          product_interest: produk,
          message: pesan
        });
      } catch (err) {
        console.warn("Gagal simpan inquiry ke database:", err);
      }
    }

    window.open(`https://wa.me/6282312740855?text=${waText}`, "_blank");
    form.reset();
    showToast("Inquiry berhasil dikirim");
  });
}

function initReviewForm() {
  const form = document.getElementById("reviewForm");
  if (!form) return;

  let selectedRating = 5;
  const stars = document.querySelectorAll("#starRatingSelect i");
  const ratingInput = document.getElementById("ratingValue");

  function renderStars(value) {
    stars.forEach((star, index) => {
      star.className = index < value ? "bi bi-star-fill" : "bi bi-star";
    });
  }

  if (stars.length) {
    renderStars(selectedRating);

    stars.forEach((star, index) => {
      star.addEventListener("click", () => {
        selectedRating = index + 1;
        if (ratingInput) ratingInput.value = selectedRating;
        renderStars(selectedRating);
      });
    });
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = form.querySelector('[name="name"]')?.value?.trim() || "";
    const message = form.querySelector('[name="message"]')?.value?.trim() || "";

    if (!name || !message) {
      showToast("Nama dan ulasan wajib diisi");
      return;
    }

    try {
      if (typeof createTestimonial === "function") {
        await createTestimonial({
          name,
          message,
          rating: selectedRating
        });
      }

      form.reset();
      selectedRating = 5;
      if (ratingInput) ratingInput.value = 5;
      renderStars(5);
      showToast("Terima kasih, ulasan berhasil dikirim");
      await loadTestimoni();
      await loadStats();
    } catch (err) {
      console.error("Gagal kirim ulasan:", err);
      showToast("Gagal mengirim ulasan");
    }
  });
}

function updateCartBadge() {
  if (typeof getCartCount !== "function") return;

  const count = getCartCount();

  const badge = document.getElementById("cartBadge");
  if (badge) {
    badge.textContent = count;
    badge.style.display = count > 0 ? "inline-flex" : "none";
  }

  const mobileBadge = document.getElementById("cartBadgeMobile");
  if (mobileBadge) {
    mobileBadge.textContent = `(${count})`;
  }
}

function formatDate(dateString) {
  if (!dateString) return "-";

  try {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric"
    });
  } catch {
    return dateString;
  }
}