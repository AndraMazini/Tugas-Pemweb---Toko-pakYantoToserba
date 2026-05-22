// ============================================================
//  index.js — Logic untuk halaman Landing Page (index.html)
//  Dikerjakan oleh: Anggota Frontend 1
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
  loadKategori();
  loadProdukUnggulan();
  loadTestimoni();
  loadBlogPreview();
});

// ─── KATEGORI ────────────────────────────────────────────────
async function loadKategori() {
  const grid = document.getElementById('kategori-grid');
  try {
    const res = await getCategories();
    if (!res.success || res.data.length === 0) {
      grid.innerHTML = '<div class="col-span-full text-center text-gray-400 py-8">Belum ada kategori</div>';
      return;
    }
    grid.innerHTML = res.data.map(cat => `
      <a href="/katalog.html?category=${cat.slug}"
         class="bg-white border border-gray-100 rounded-2xl p-5 text-center hover:border-orange-300 hover:shadow-md hover:-translate-y-1 transition">
        <div class="text-3xl mb-2">${cat.icon || '📦'}</div>
        <div class="font-semibold text-sm text-gray-700">${cat.name}</div>
      </a>
    `).join('');
  } catch (err) {
    grid.innerHTML = '<div class="col-span-full text-center text-red-400 py-8">Gagal memuat kategori</div>';
  }
}

// ─── PRODUK UNGGULAN ─────────────────────────────────────────
async function loadProdukUnggulan() {
  const grid = document.getElementById('produk-grid');
  try {
    const res = await getProducts({ featured: 'true', limit: 4 });
    if (!res.success || res.data.length === 0) {
      grid.innerHTML = '<div class="col-span-full text-center text-gray-400 py-8">Belum ada produk unggulan</div>';
      return;
    }
    grid.innerHTML = res.data.map(p => `
      <div class="bg-white rounded-2xl shadow hover:shadow-lg hover:-translate-y-1 transition overflow-hidden">
        <div class="h-40 bg-orange-50 flex items-center justify-center overflow-hidden">
          ${p.image_url
            ? `<img src="${getImageUrl(p.image_url)}" alt="${p.name}" class="w-full h-full object-cover">`
            : `<span class="text-5xl">📦</span>`}
        </div>
        <div class="p-4">
          ${p.badge ? `<span class="text-xs bg-orange-100 text-orange-600 font-bold px-2 py-1 rounded-full">${p.badge}</span>` : ''}
          <h3 class="font-bold text-gray-800 mt-2 text-sm">${p.name}</h3>
          <p class="text-xs text-gray-400 mt-1">${p.price_range || ''}</p>
          <p class="text-xs text-gray-400">${p.category_name || ''}</p>
        </div>
      </div>
    `).join('');
  } catch (err) {
    grid.innerHTML = '<div class="col-span-full text-center text-red-400 py-8">Gagal memuat produk</div>';
  }
}

// ─── TESTIMONI ───────────────────────────────────────────────
async function loadTestimoni() {
  const grid = document.getElementById('testimoni-grid');
  try {
    const res = await getTestimonials();
    if (!res.success || res.data.length === 0) {
      grid.innerHTML = '<div class="col-span-full text-center text-gray-400 py-8">Belum ada testimoni</div>';
      return;
    }
    const bintang = (r) => '⭐'.repeat(Number(r));
    grid.innerHTML = res.data.slice(0, 3).map(t => `
      <div class="bg-white rounded-2xl shadow p-6 hover:shadow-md transition">
        <div class="text-lg mb-2">${bintang(t.rating)}</div>
        <p class="text-gray-600 text-sm leading-relaxed italic">"${t.message}"</p>
        <div class="mt-4 font-bold text-gray-800 text-sm">— ${t.name}</div>
        <div class="text-xs text-gray-400 mt-1">${formatDate(t.created_at)}</div>
      </div>
    `).join('');
  } catch (err) {
    grid.innerHTML = '<div class="col-span-full text-center text-red-400 py-8">Gagal memuat testimoni</div>';
  }
}

// ─── BLOG PREVIEW ────────────────────────────────────────────
async function loadBlogPreview() {
  const grid = document.getElementById('blog-grid');
  try {
    const res = await getBlogPosts({ limit: 3 });
    if (!res.success || res.data.length === 0) {
      grid.innerHTML = '<div class="col-span-full text-center text-gray-400 py-8">Belum ada artikel</div>';
      return;
    }
    grid.innerHTML = res.data.map(post => `
      <a href="/blog-detail.html?slug=${post.slug}"
         class="bg-white rounded-2xl shadow hover:shadow-lg hover:-translate-y-1 transition overflow-hidden block">
        <div class="h-40 bg-gray-100 flex items-center justify-center overflow-hidden">
          ${post.thumbnail_url
            ? `<img src="${getImageUrl(post.thumbnail_url)}" alt="${post.title}" class="w-full h-full object-cover">`
            : `<span class="text-4xl">📝</span>`}
        </div>
        <div class="p-4">
          <h3 class="font-bold text-gray-800 text-sm leading-snug">${post.title}</h3>
          <p class="text-xs text-gray-400 mt-2">${formatDate(post.created_at)}</p>
        </div>
      </a>
    `).join('');
  } catch (err) {
    grid.innerHTML = '<div class="col-span-full text-center text-red-400 py-8">Gagal memuat artikel</div>';
  }
}
