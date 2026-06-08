// orders.db.js — DB-driven admin untuk kategori & produk (sinkron ke database)

let kategoriCache = [];
let produkCache = [];
let currentProductImageData = '';

// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', () => {
  tampilkanNamaAdmin();
  gantiTab('produk');

  // init UI
  setupFormListeners();

  // load data DB
  refreshAll();
});

async function refreshAll() {
  await Promise.all([
    loadKategoriFromDB(),
    loadProdukFromDB(),
  ]);

  updateDropdownKategoriDiFormProduk();
  renderSemua();
}

function tampilkanNamaAdmin() {
  const adminNameEl = document.getElementById('admin-name');
  if (!adminNameEl) return;
  adminNameEl.textContent = typeof currentAdminName !== 'undefined' ? currentAdminName : 'Pak Yanto (Admin)';
}

// ==================== TAB SYSTEM (reuse logic from original file) ====================
function gantiTab(tabName) {
  document.querySelectorAll('.tab-content').forEach(section => section.classList.add('hidden'));

  const navs = ['produk', 'kategori', 'katalog'];
  navs.forEach(nav => {
    const btn = document.getElementById(`nav-${nav}`);
    if (btn) {
      btn.className = 'w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-slate-100 transition-all duration-200';
    }
  });

  const section = document.getElementById(`section-${tabName}`);
  if (section) section.classList.remove('hidden');

  const btnAktif = document.getElementById(`nav-${tabName}`);
  if (btnAktif) {
    btnAktif.className = 'w-full flex items-center gap-3.5 px-4 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white text-sm font-bold shadow-lg shadow-orange-500/20 transition-all duration-300';
  }
}

// ==================== MODAL MANAGER ====================
function bukaModal(idModal) {
  document.getElementById(idModal)?.classList.remove('hidden');
}

function tutupModal(idModal) {
  document.getElementById(idModal)?.classList.add('hidden');
  if (idModal === 'modal-produk') {
    document.getElementById('form-produk')?.reset();
    currentProductImageData = '';
    document.getElementById('prod-image-preview')?.classList.add('hidden');
  }
  if (idModal === 'modal-kategori') document.getElementById('form-kategori')?.reset();
  if (idModal === 'modal-katalog') document.getElementById('form-katalog')?.reset();
}

function setupFormListeners() {
  const fileInput = document.getElementById('prod-image-file');
  if (fileInput) fileInput.addEventListener('change', handlePreviewProductImage);
}

function handlePreviewProductImage() {
  const fileInput = document.getElementById('prod-image-file');
  const preview = document.getElementById('prod-image-preview');
  const previewImg = document.getElementById('prod-image-preview-img');
  currentProductImageData = '';

  if (!fileInput || fileInput.files.length === 0) {
    if (preview) preview.classList.add('hidden');
    return;
  }

  const file = fileInput.files[0];
  const reader = new FileReader();
  reader.onload = () => {
    currentProductImageData = reader.result;
    if (previewImg) previewImg.src = reader.result;
    if (preview) preview.classList.remove('hidden');
  };
  reader.readAsDataURL(file);
}

// ==================== LOAD DATA DB ====================
async function loadKategoriFromDB() {
  const res = await getCategories();
  kategoriCache = (res && res.data) ? res.data : [];
}

async function loadProdukFromDB() {
  const res = await getProducts({ page: 1, limit: 1000 });
  produkCache = (res && res.data) ? res.data : [];
}

// ==================== RENDER ====================
function renderSemua() {
  renderTabelKategori();
  renderTabelProduk();
  // katalog landing tidak dikelola via localStorage lagi; UI admin bagian katalog tetap ada
  // tapi saat ini dibiarkan tidak di-render agar tidak membingungkan.
}

function renderTabelKategori() {
  const tbody = document.getElementById('tabel-kategori');
  if (!tbody) return;

  tbody.innerHTML = '';
  if (!kategoriCache.length) {
    tbody.innerHTML = '<tr><td colspan="3" class="text-center py-6 text-slate-400">Belum ada kategori.</td></tr>';
    return;
  }

  kategoriCache.forEach((cat, index) => {
    tbody.innerHTML += `
      <tr class="hover:bg-slate-50/80 transition-colors">
        <td class="py-4 px-6 font-semibold">${index + 1}</td>
        <td class="py-4 px-6 text-slate-900">${cat.name}</td>
        <td class="py-4 px-6 text-center">
          <button onclick="hapusKategori(${cat.id})" class="text-xs font-bold text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg border border-red-200 transition-all">🗑️ Hapus</button>
        </td>
      </tr>`;
  });
}

function renderTabelProduk() {
  const tbody = document.getElementById('tabel-produk');
  if (!tbody) return;

  tbody.innerHTML = '';
  if (!produkCache.length) {
    tbody.innerHTML = '<tr><td colspan="5" class="text-center py-6 text-slate-400">Belum ada produk gudang.</td></tr>';
    return;
  }

  produkCache.forEach((prod) => {
    tbody.innerHTML += `
      <tr class="hover:bg-slate-50/80 transition-colors">
        <td class="py-4 px-6">
          <div class="font-bold text-slate-900">${prod.name}</div>
          <div class="text-xs text-slate-400 font-normal line-clamp-1">${prod.description || ''}</div>
        </td>
        <td class="py-4 px-6 text-slate-500">${prod.category_name || ''}</td>
        <td class="py-4 px-6 font-bold text-slate-800">Rp ${(prod.price_range || 0).toLocaleString('id-ID')}</td>
        <td class="py-4 px-6 text-slate-600">${prod.stock || 0} <span class="text-xs text-slate-400">pcs</span></td>
        <td class="py-4 px-6 text-center">
          <button onclick="hapusProduk(${prod.id})" class="text-xs font-bold text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg border border-red-200 transition-all">🗑️ Hapus</button>
        </td>
      </tr>`;
  });
}

function updateDropdownKategoriDiFormProduk() {
  const select = document.getElementById('prod-category');
  if (!select) return;

  select.innerHTML = (kategoriCache || []).map(cat => `
    <option value="${cat.id}">${cat.name}</option>
  `).join('');
}

// ==================== ACTIONS (called by HTML onclick/onsubmit) ====================
async function simpanKategori(e) {
  e.preventDefault();
  const namaCat = document.getElementById('cat-name').value.trim();
  if (!namaCat) return;

  const token = getToken();
  if (!token) return alert('Login admin terlebih dahulu.');

  const res = await createCategory({ name: namaCat });
  if (res && res.success === false) {
    alert(res.message || 'Gagal menyimpan kategori');
    return;
  }

  document.getElementById('form-kategori')?.reset();
  await refreshAll();
  tutupModal('modal-kategori');
}

async function hapusKategori(id) {
  if (!confirm('Hapus kategori ini?')) return;
  const res = await deleteCategory(id);
  if (!res || res.success === false) {
    alert(res?.message || 'Gagal menghapus kategori');
    return;
  }
  await refreshAll();
}

async function simpanProduk(e) {
  e.preventDefault();

  const name = document.getElementById('prod-name').value.trim();
  const price = parseInt(document.getElementById('prod-price').value);
  const stock = parseInt(document.getElementById('prod-stock').value);
  const category_id = parseInt(document.getElementById('prod-category').value);
  const description = document.getElementById('prod-desc').value.trim();
  const image_url = currentProductImageData;

  if (!name) return;
  if (!category_id) return alert('Pilih kategori terlebih dahulu.');
  if (!image_url) return alert('Pilih gambar terlebih dahulu.');

  const token = getToken();
  if (!token) return alert('Login admin terlebih dahulu.');

  // If there is a selected file, send as FormData so server saves the file to /src/uploads
  const fileInput = document.getElementById('prod-image-file');
  let res;
  if (fileInput && fileInput.files && fileInput.files[0]) {
    const form = new FormData();
    form.append('name', name);
    form.append('price', Number.isFinite(price) ? price : 0);
    form.append('stock', Number.isFinite(stock) ? stock : 0);
    form.append('category_id', category_id);
    form.append('description', description);
    form.append('badge', '');
    form.append('is_featured', 0);
    form.append('image', fileInput.files[0]);

    const r = await fetch('http://localhost:5000/api/products', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: form
    });
    res = await r.json();
  } else {
    const payload = {
      name,
      price: Number.isFinite(price) ? price : 0,
      stock: Number.isFinite(stock) ? stock : 0,
      category_id,
      image_url,
      description,
      badge: null,
      is_featured: 0
    };
    res = await createProduct(payload);
  }
  if (!res || res.success === false) {
    alert(res?.message || 'Gagal menyimpan produk');
    return;
  }

  currentProductImageData = '';
  document.getElementById('form-produk')?.reset();
  await refreshAll();
  tutupModal('modal-produk');
}

async function hapusProduk(id) {
  if (!confirm('Hapus produk ini?')) return;
  const res = await deleteProduct(id);
  if (!res || res.success === false) {
    alert(res?.message || 'Gagal menghapus produk');
    return;
  }
  await refreshAll();
}

function logout() {
  if (confirm('Apakah anda ingin keluar dari Control Panel?')) {
    window.location.href = '../index.html';
  }
}

