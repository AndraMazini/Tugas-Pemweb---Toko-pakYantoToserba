function renderCategories(categories, containerId = "categoryList") {
  const container = document.getElementById(containerId);
  if (!container) return;

  if (!categories || categories.length === 0) {
    container.innerHTML = `
      <div class="col-12 text-center">
        <p class="text-muted">Kategori belum tersedia.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = categories.map((category) => `
    <div class="col-sm-6 col-lg-4 col-xl-3">
      <div class="soft-card text-center">
        <div class="category-icon mx-auto">
          <i class="bi ${category.icon || "bi-grid"}"></i>
        </div>
        <h3 class="feature-title">${category.name}</h3>
        <p class="feature-text">Kategori pilihan untuk kebutuhan harian pelanggan.</p>
      </div>
    </div>
  `).join("");
}

function renderProducts(products, containerId = "productList") {
  const container = document.getElementById(containerId);
  if (!container) return;

  if (!products || products.length === 0) {
    container.innerHTML = `
      <div class="col-12 text-center">
        <p class="text-muted">Produk belum tersedia.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = products.map((product) => `
    <div class="col-md-6 col-xl-4">
      <div class="product-card">
        <img
          src="${product.image_url || "https://via.placeholder.com/600x400?text=No+Image"}"
          alt="${product.name}"
          class="product-img"
        />
        <div class="product-body">
          <div class="product-badges">
            <span class="badge-soft badge-category">${product.category_name || "Produk"}</span>
            ${product.badge ? `<span class="badge-soft badge-accent">${product.badge}</span>` : ""}
          </div>
          <h3 class="product-title">${product.name}</h3>
          <p class="product-desc">${product.description || "Produk pilihan untuk kebutuhan harian pelanggan."}</p>
          <div class="product-meta">Kisaran harga: ${product.price_range || "-"}</div>
        </div>
      </div>
    </div>
  `).join("");
}

function renderGallery(galleryItems, containerId = "galleryList") {
  const container = document.getElementById(containerId);
  if (!container) return;

  if (!galleryItems || galleryItems.length === 0) {
    container.innerHTML = `<div class="col-12 text-center"><p class="text-muted">Galeri belum tersedia.</p></div>`;
    return;
  }

  container.innerHTML = galleryItems.map((item) => `
    <div class="col-md-6 col-xl-4">
      <div class="gallery-card">
        <img src="${item.image_url}" alt="${item.caption || "Galeri"}" class="gallery-img">
        <div class="gallery-body">
          <h3 class="product-title">${item.caption || "Galeri Toko"}</h3>
          <p class="gallery-caption">Dokumentasi visual toko dan suasana pelayanan.</p>
        </div>
      </div>
    </div>
  `).join("");
}

function renderBlogPosts(posts, containerId = "blogList") {
  const container = document.getElementById(containerId);
  if (!container) return;

  if (!posts || posts.length === 0) {
    container.innerHTML = `<div class="col-12 text-center"><p class="text-muted">Artikel belum tersedia.</p></div>`;
    return;
  }

  container.innerHTML = posts.map((post) => `
    <div class="col-md-6 col-xl-4">
      <div class="blog-card">
        <img src="${post.thumbnail_url || "https://via.placeholder.com/600x400?text=No+Image"}" alt="${post.title}" class="blog-img">
        <div class="blog-body">
          <div class="blog-meta mb-2">
            <i class="bi bi-calendar3 me-2"></i>${new Date(post.created_at).toLocaleDateString("id-ID")}
          </div>
          <h3 class="blog-title">${post.title}</h3>
          <p class="blog-excerpt">Artikel terbaru untuk informasi, promo, dan edukasi pelanggan.</p>
        </div>
      </div>
    </div>
  `).join("");
}

function renderTestimonials(testimonials, containerId = "testimonialList") {
  const container = document.getElementById(containerId);
  if (!container) return;

  if (!testimonials || testimonials.length === 0) {
    container.innerHTML = `<div class="col-12 text-center"><p class="text-muted">Testimoni belum tersedia.</p></div>`;
    return;
  }

  container.innerHTML = testimonials.map((item) => {
    const rating = Math.max(1, Math.min(5, Number(item.rating || 5)));
    const fullStars = "★".repeat(rating);
    const emptyStars = "☆".repeat(5 - rating);
    const initial = item.name ? item.name.charAt(0).toUpperCase() : "P";

    return `
      <div class="col-md-6 col-xl-4">
        <div class="testimonial-card">
          <div class="testimonial-body">
            <div class="stars">${fullStars}${emptyStars}</div>
            <p class="testimonial-text">"${item.message}"</p>
            <div class="testimonial-user">
              <div class="user-avatar">${initial}</div>
              <div>
                <div class="fw-bold">${item.name}</div>
                <small class="text-muted">Pelanggan</small>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }).join("");
}

function fillProductSelect(products) {
  const select = document.getElementById("productInterest");
  if (!select) return;

  select.innerHTML = `
    <option value="">Pilih produk</option>
    ${products.map((product) => `<option value="${product.name}">${product.name}</option>`).join("")}
    <option value="Produk lainnya">Produk lainnya</option>
  `;
}

window.PublicUI = {
  renderCategories,
  renderProducts,
  renderGallery,
  renderBlogPosts,
  renderTestimonials,
  fillProductSelect
};