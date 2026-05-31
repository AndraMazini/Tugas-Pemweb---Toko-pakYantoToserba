document.addEventListener("DOMContentLoaded", async () => {
  initDarkMode();
  initInstantAnchorScroll();
  initNavbarActiveState();
  initInquiryFormWhatsApp();
  initReviewForm();
  initRoleUI();

  await loadKategori();
  await loadProdukPilihan();
  await loadGallery();
  await loadBlogPreview();
  await loadTestimoni();
  await loadStats();
});

function showToast(message) {
  const toast = document.getElementById("toastFloat");
  if (!toast) return;

  toast.innerText = message;
  toast.style.display = "block";

  setTimeout(() => {
    toast.style.display = "none";
  }, 2000);
}

function initDarkMode() {
  const body = document.body;
  const toggle = document.getElementById("darkModeToggle");
  const savedTheme = localStorage.getItem("theme");

  if (savedTheme === "dark") {
    body.classList.add("dark-mode");
    if (toggle) toggle.innerHTML = '<i class="bi bi-sun-fill"></i>';
  }

  toggle?.addEventListener("click", () => {
    body.classList.toggle("dark-mode");
    const isDark = body.classList.contains("dark-mode");
    localStorage.setItem("theme", isDark ? "dark" : "light");
    toggle.innerHTML = isDark
      ? '<i class="bi bi-sun-fill"></i>'
      : '<i class="bi bi-moon-stars-fill"></i>';

    showToast(isDark ? "Mode gelap diaktifkan" : "Mode terang diaktifkan");
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
        behavior: "auto"
      });

      const navbarCollapse = document.getElementById("navbarNav");
      if (navbarCollapse && navbarCollapse.classList.contains("show")) {
        const bsCollapse =
          bootstrap.Collapse.getInstance(navbarCollapse) ||
          new bootstrap.Collapse(navbarCollapse, { toggle: false });
        bsCollapse.hide();
      }
    });
  });
}

function initNavbarActiveState() {
  const navLinks = document.querySelectorAll('.nav-link[href^="#"]');
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

function getFallbackImageByCategory(categoryName = "", categorySlug = "") {
  const slug = String(categorySlug || "").toLowerCase();
  const name = String(categoryName || "").toLowerCase();

  if (slug === "sembako" || name === "sembako") {
    return "https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=1200&auto=format&fit=crop";
  }
  if (slug === "peralatan-dapur" || name === "peralatan dapur") {
    return "https://images.unsplash.com/photo-1514996937319-344454492b37?q=80&w=1200&auto=format&fit=crop";
  }
  if (slug === "peralatan-rumah-tangga" || name === "peralatan rumah tangga") {
    return "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=1200&auto=format&fit=crop";
  }
  if (slug === "kebersihan" || name === "kebersihan") {
    return "https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=1200&auto=format&fit=crop";
  }
  if (slug === "plastik-dan-wadah" || name === "plastik & wadah" || name === "plastik dan wadah") {
    return "https://images.unsplash.com/photo-1615484477778-ca3b77940c25?q=80&w=1200&auto=format&fit=crop";
  }

  return "https://via.placeholder.com/600x400?text=No+Image";
}

function getFallbackImageByProduct(productName = "", categoryName = "", categorySlug = "") {
  const name = String(productName || "").toLowerCase();

  const imageByProduct = {
    "beras premium 5kg": "https://images.unsplash.com/photo-1586201375761-83865001e31c?q=80&w=1200&auto=format&fit=crop",
    "minyak goreng 2l": "https://images.unsplash.com/photo-1620706857370-e1b9770e8bb1?q=80&w=1200&auto=format&fit=crop",
    "gula pasir 1kg": "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?q=80&w=1200&auto=format&fit=crop",
    "tepung terigu 1kg": "https://images.unsplash.com/photo-1608198093002-ad4e005484ec?q=80&w=1200&auto=format&fit=crop",
    "telur ayam 1kg": "https://images.unsplash.com/photo-1506976785307-8732e854ad03?q=80&w=1200&auto=format&fit=crop",
    "mie instan paket 5": "https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?q=80&w=1200&auto=format&fit=crop",
    "susu kental manis": "https://images.unsplash.com/photo-1563636619-e9143da7973b?q=80&w=1200&auto=format&fit=crop",
    "kopi bubuk sachet": "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=1200&auto=format&fit=crop",
    "teh celup box": "https://images.unsplash.com/photo-1597318181409-cf64d0b5d8a2?q=80&w=1200&auto=format&fit=crop",
    "garam dapur 500gr": "https://images.unsplash.com/photo-1518110925495-5fe2fda0442f?q=80&w=1200&auto=format&fit=crop",

    "wajan anti lengket": "https://images.unsplash.com/photo-1584990347449-a8f52f1f2f4d?q=80&w=1200&auto=format&fit=crop",
    "panci stainless": "https://images.unsplash.com/photo-1601050690597-df0568f70950?q=80&w=1200&auto=format&fit=crop",
    "spatula nilon": "https://images.unsplash.com/photo-1583778176476-4a8b02d1d3c1?q=80&w=1200&auto=format&fit=crop",
    "sendok sayur": "https://images.unsplash.com/photo-1514996937319-344454492b37?q=80&w=1200&auto=format&fit=crop",
    "pisau dapur": "https://images.unsplash.com/photo-1593618998160-e34014e67546?q=80&w=1200&auto=format&fit=crop",
    "talenan plastik": "https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=1200&auto=format&fit=crop",
    "saringan minyak": "https://images.unsplash.com/photo-1576867757603-05b134ebc379?q=80&w=1200&auto=format&fit=crop",
    "rak piring mini": "https://images.unsplash.com/photo-1582582494700-7c0d0d3731ae?q=80&w=1200&auto=format&fit=crop",
    "gelas ukur": "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?q=80&w=1200&auto=format&fit=crop",
    "baskom dapur": "https://images.unsplash.com/photo-1615484477778-ca3b77940c25?q=80&w=1200&auto=format&fit=crop",

    "ember plastik besar": "https://images.unsplash.com/photo-1583947582886-f40ec95dd752?q=80&w=1200&auto=format&fit=crop",
    "gayung plastik": "https://images.unsplash.com/photo-1604335399105-a0c585fd81a1?q=80&w=1200&auto=format&fit=crop",
    "sapu lantai": "https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=1200&auto=format&fit=crop",
    "pel lantai": "https://images.unsplash.com/photo-1581579186913-45acb313e8d3?q=80&w=1200&auto=format&fit=crop",
    "keranjang baju": "https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=1200&auto=format&fit=crop",
    "tempat sampah mini": "https://images.unsplash.com/photo-1621451537084-482c73073a0f?q=80&w=1200&auto=format&fit=crop",
    "rak plastik susun": "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=1200&auto=format&fit=crop",
    "gantungan baju": "https://images.unsplash.com/photo-1524758631624-e2822e304c36?q=80&w=1200&auto=format&fit=crop",
    "lap kanebo": "https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=1200&auto=format&fit=crop",
    "keset rumah": "https://images.unsplash.com/photo-1616628182509-6e5d853ee1bc?q=80&w=1200&auto=format&fit=crop",

    "sabun cuci piring": "https://images.unsplash.com/photo-1583947582886-f40ec95dd752?q=80&w=1200&auto=format&fit=crop",
    "deterjen bubuk": "https://images.unsplash.com/photo-1610552050890-fe99536c2614?q=80&w=1200&auto=format&fit=crop",
    "pembersih lantai": "https://images.unsplash.com/photo-1585421514738-01798e348b17?q=80&w=1200&auto=format&fit=crop",
    "pewangi pakaian": "https://images.unsplash.com/photo-1616628182509-6e5d853ee1bc?q=80&w=1200&auto=format&fit=crop",
    "tisu gulung": "https://images.unsplash.com/photo-1583947581924-a6d6f1d41f7b?q=80&w=1200&auto=format&fit=crop",
    "sabun mandi batang": "https://images.unsplash.com/photo-1600857062241-98e5dba7f214?q=80&w=1200&auto=format&fit=crop",
    "sikat baju": "https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=1200&auto=format&fit=crop",
    "pembersih kamar mandi": "https://images.unsplash.com/photo-1585421514738-01798e348b17?q=80&w=1200&auto=format&fit=crop",
    "handwash refill": "https://images.unsplash.com/photo-1583947581924-a6d6f1d41f7b?q=80&w=1200&auto=format&fit=crop",
    "kaporit pembersih": "https://images.unsplash.com/photo-1585421514738-01798e348b17?q=80&w=1200&auto=format&fit=crop",

    "toples plastik": "https://images.unsplash.com/photo-1615484477778-ca3b77940c25?q=80&w=1200&auto=format&fit=crop",
    "wadah makan kotak": "https://images.unsplash.com/photo-1514996937319-344454492b37?q=80&w=1200&auto=format&fit=crop",
    "botol minum plastik": "https://images.unsplash.com/photo-1523362628745-0c100150b504?q=80&w=1200&auto=format&fit=crop",
    "kotak serbaguna": "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=1200&auto=format&fit=crop",
    "tempat bumbu": "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?q=80&w=1200&auto=format&fit=crop",
    "plastik sampah roll": "https://images.unsplash.com/photo-1621451537084-482c73073a0f?q=80&w=1200&auto=format&fit=crop",
    "plastik klip": "https://images.unsplash.com/photo-1615484477778-ca3b77940c25?q=80&w=1200&auto=format&fit=crop",
    "lunch box plastik": "https://images.unsplash.com/photo-1514996937319-344454492b37?q=80&w=1200&auto=format&fit=crop",
    "tempat sendok": "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?q=80&w=1200&auto=format&fit=crop",
    "wadah beras mini": "https://images.unsplash.com/photo-1608198093002-ad4e005484ec?q=80&w=1200&auto=format&fit=crop"
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

    grid.innerHTML = res.data.map(cat => {
      const iconClass = cat.icon || "bi-box-seam-fill";

      return `
        <div class="col-6 col-md-4 col-lg-3">
          <a href="katalog.html?category=${encodeURIComponent(cat.slug)}"
             class="category-card d-block text-decoration-none text-center p-4">
            <div class="category-icon-box mx-auto">
              <i class="bi ${iconClass} fs-3"></i>
            </div>
            <h3 class="feature-title mb-2">${cat.name}</h3>
            <p class="feature-text">Lihat semua produk kategori ini.</p>
          </a>
        </div>
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
          Belum ada produk
        </div>
      `;
      return;
    }

    grid.innerHTML = res.data.map(product => `
      <div class="col-12 col-md-6 col-xl-3">
        <div class="product-card">
          <div style="height:220px; overflow:hidden;">
            <img
              src="${resolveProductImage(product)}"
              alt="${product.name}"
              class="product-image"
              onerror="this.onerror=null;this.src='${getFallbackImageByProduct(product.name, product.category_name, product.category_slug)}';"
            />
          </div>

          <div class="product-body">
            <div class="d-flex flex-wrap gap-2 mb-2">
              ${product.category_name ? `<span class="badge-soft badge-category">${product.category_name}</span>` : ""}
              ${product.badge ? `<span class="badge-soft badge-accent">${product.badge}</span>` : ""}
            </div>

            <h3 class="product-title">${product.name}</h3>
            <div class="product-meta mb-3">${product.price_range || ""}</div>

            <div class="d-grid gap-2">
              <a href="katalog.html?category=${encodeURIComponent(product.category_slug || "")}" class="btn btn-accent btn-sm">
                Lihat Detail Produk
              </a>
            </div>
          </div>
        </div>
      </div>
    `).join("");
  } catch (err) {
    console.error("Gagal memuat produk:", err);
    grid.innerHTML = `
      <div class="col-12 text-center text-danger py-4">
        Gagal memuat produk
      </div>
    `;
  }
}

async function loadGallery() {
  const grid = document.getElementById("galleryList");
  if (!grid) return;

  try {
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
        <div class="gallery-card">
          <img
            src="${getImageUrl(img.image_url || img.file_path || img.url)}"
            alt="${img.title || "Galeri"}"
            class="gallery-image"
            onerror="this.onerror=null;this.src='https://via.placeholder.com/600x400?text=No+Image';"
          />
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
                ? `<img src="${getImageUrl(post.thumbnail_url)}" alt="${post.title}" class="blog-image" onerror="this.onerror=null;this.src='https://via.placeholder.com/800x400?text=No+Image';">`
                : `<div class="d-flex align-items-center justify-content-center h-100 fs-1">📝</div>`
            }
          </div>
          <div class="p-3">
            <h3 class="h6 fw-bold mb-2">${post.title}</h3>
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
    const res = await getTestimonials();

    if (!res.success || !res.data || res.data.length === 0) {
      grid.innerHTML = `
        <div class="col-12 text-center text-muted py-4">
          Belum ada testimoni
        </div>
      `;
      return;
    }

    const starsHtml = (rating) => {
      const r = Math.max(0, Math.min(5, Number(rating) || 0));
      return Array.from({ length: 5 }, (_, i) => {
        const active = i < r;
        return `<i class="bi bi-star-fill ${active ? "text-warning" : "text-secondary"}"></i>`;
      }).join("");
    };

    grid.innerHTML = res.data.slice(0, 3).map(t => `
      <div class="col-md-6 col-xl-4">
        <div class="review-card p-4">
          <div class="mb-2">${starsHtml(t.rating)}</div>
          <p class="feature-text fst-italic mb-3">"${t.message}"</p>
          <div class="fw-bold">${t.name}</div>
          <div class="review-date mt-1">${formatDate(t.created_at)}</div>
        </div>
      </div>
    `).join("");
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
    const [prodRes, catRes, testRes] = await Promise.all([
      getProducts({ limit: 100 }),
      getCategories(),
      getTestimonials()
    ]);

    const prodCount = prodRes?.data?.length || 0;
    const catCount = catRes?.data?.length || 0;
    const testCount = testRes?.data?.length || 0;

    const statProducts = document.getElementById("statProducts");
    const statCategories = document.getElementById("statCategories");
    const statTestimonials = document.getElementById("statTestimonials");

    if (statProducts) statProducts.innerText = prodCount > 0 ? `${prodCount}+` : "0";
    if (statCategories) statCategories.innerText = catCount > 0 ? `${catCount}` : "0";
    if (statTestimonials) statTestimonials.innerText = testCount > 0 ? `${testCount}+` : "0";
  } catch (err) {
    console.warn("Gagal memuat statistik:", err);
  }
}

function initInquiryFormWhatsApp() {
  const inquiryForm = document.getElementById("inquiryForm");
  if (!inquiryForm) return;

  inquiryForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const name = document.getElementById("customerName")?.value || "";
    const phone = document.getElementById("customerPhone")?.value || "";
    const interest = document.getElementById("productInterest")?.value || "-";
    const msg = document.getElementById("customerMessage")?.value || "";

    const waMessage =
      `Halo Toko Pak Yanto,%0A%0A` +
      `Saya ingin mengajukan pertanyaan:%0A%0A` +
      `*Nama:* ${name}%0A` +
      `*WA:* ${phone}%0A` +
      `*Produk Diminati:* ${interest}%0A` +
      `*Pesan:* ${msg}`;

    window.open(`https://wa.me/6282312740855?text=${waMessage}`, "_blank");
  });
}

function initReviewForm() {
  const stars = document.querySelectorAll("#starRatingSelect i");
  const ratingInput = document.getElementById("reviewerRating");

  stars.forEach(star => {
    star.addEventListener("click", function () {
      const selectedValue = parseInt(this.getAttribute("data-value"));

      if (ratingInput) ratingInput.value = selectedValue;

      stars.forEach(s => {
        if (parseInt(s.getAttribute("data-value")) <= selectedValue) {
          s.classList.add("active");
        } else {
          s.classList.remove("active");
        }
      });
    });
  });

  const addReviewForm = document.getElementById("addReviewForm");
  if (!addReviewForm) return;

  addReviewForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    const name = document.getElementById("reviewerName")?.value.trim();
    const rating = document.getElementById("reviewerRating")?.value;
    const message = document.getElementById("reviewerText")?.value.trim();

    if (!name || !rating || !message) {
      alert("Mohon lengkapi nama, rating, dan ulasan.");
      return;
    }

    try {
      await submitTestimonial({
        name,
        rating: Number(rating),
        message
      });

      alert("Terima kasih! Ulasan Anda telah terkirim dan menunggu persetujuan moderator.");
      addReviewForm.reset();
      stars.forEach(s => s.classList.remove("active"));
      if (ratingInput) ratingInput.value = "";
    } catch (err) {
      console.error("Gagal mengirim ulasan:", err);
      alert("Gagal mengirim ulasan.");
    }
  });
}