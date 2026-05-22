// ============================================================
//  katalog.js — Logic halaman Katalog Produk
//  Dikerjakan oleh: Anggota Frontend 1
// ============================================================

let currentPage = 1;
let currentCategory = '';
const LIMIT = 8;

document.addEventListener('DOMContentLoaded', () => {
  // Cek kalau ada ?category= di URL
  const params = new URLSearchParams(window.location.search);
  currentCategory = params.get('category') || '';

  loadFilterKategori();
  loadProduk();
});

async function loadFilterKategori() {
  const container = document.getElementById('filter-kategori');
  try {
    const res = await getCategories();
    if (!res.success) return;

    const tombolSemua = `
      <button onclick="filterKategori('')"
        class="filter-btn px-4 py-2 rounded-full text-sm font-semibold border ${currentCategory === '' ? 'bg-orange-600 text-white border-orange-600' : 'border-gray-300 text-gray-600 hover:border-orange-400'}">
        Semua
      </button>`;

    const tombolKategori = res.data.map(cat => `
      <button onclick="filterKategori('${cat.slug}')"
        class="filter-btn px-4 py-2 rounded-full text-sm font-semibold border ${currentCategory === cat.slug ? 'bg-orange-600 text-white border-orange-600' : 'border-gray-300 text-gray-600 hover:border-orange-400'}">
        ${cat.icon || ''} ${cat.name}
      </button>
    `).join('');

    container.innerHTML = tombolSemua + tombolKategori;
  } catch (err) {
    console.error('Gagal load kategori:', err);
  }
}

async function loadProduk() {
  const grid = document.getElementById('produk-grid');
  grid.innerHTML = '<div class="col-span-full text-center text-gray-400 py-16">Memuat produk...</div>';

  try {
    const params = { page: currentPage, limit: LIMIT };
    if (currentCategory) params.category = currentCategory;

    const res = await getProducts(params);

    if (!res.success || res.data.length === 0) {
      grid.innerHTML = '<div class="col-span-full text-center text-gray-400 py-16">Tidak ada produk ditemukan</div>';
      document.getElementById('pagination').innerHTML = '';
      return;
    }

    grid.innerHTML = res.data.map(p => `
      <div class="bg-white rounded-2xl shadow hover:shadow-lg hover:-translate-y-1 transition overflow-hidden">
        <div class="h-44 bg-orange-50 flex items-center justify-center overflow-hidden">
          ${p.image_url
            ? `<img src="${getImageUrl(p.image_url)}" alt="${p.name}" class="w-full h-full object-cover">`
            : `<span class="text-5xl">📦</span>`}
        </div>
        <div class="p-4">
          ${p.badge ? `<span class="text-xs bg-orange-100 text-orange-600 font-bold px-2 py-1 rounded-full">${p.badge}</span>` : ''}
          <h3 class="font-bold text-gray-800 mt-2 text-sm">${p.name}</h3>
          <p class="text-xs text-gray-400 mt-1">${p.description || ''}</p>
          <p class="text-orange-600 font-semibold text-sm mt-2">${p.price_range || ''}</p>
          <p class="text-xs text-gray-300 mt-1">${p.category_name || ''}</p>
        </div>
      </div>
    `).join('');

    renderPagination(res.pagination);
  } catch (err) {
    grid.innerHTML = '<div class="col-span-full text-center text-red-400 py-16">Gagal memuat produk</div>';
  }
}

function filterKategori(slug) {
  currentCategory = slug;
  currentPage = 1;
  loadFilterKategori();
  loadProduk();
}

function renderPagination(pagination) {
  const container = document.getElementById('pagination');
  if (!pagination || pagination.totalPages <= 1) { container.innerHTML = ''; return; }

  let html = '';
  for (let i = 1; i <= pagination.totalPages; i++) {
    html += `
      <button onclick="gantiHalaman(${i})"
        class="w-10 h-10 rounded-full text-sm font-semibold ${i === currentPage ? 'bg-orange-600 text-white' : 'bg-white border border-gray-300 text-gray-600 hover:border-orange-400'}">
        ${i}
      </button>`;
  }
  container.innerHTML = html;
}

function gantiHalaman(page) {
  currentPage = page;
  loadProduk();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
