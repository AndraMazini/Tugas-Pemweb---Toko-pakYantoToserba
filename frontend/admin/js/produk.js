// produk.js — Manajemen Operasional Data Barang Dagangan Toko Pak Yanto

document.addEventListener('DOMContentLoaded', () => {
  cekLogin();
  tampilkanNamaAdmin();
  validasiRoleSuperadmin();
  loadDataProduk();
  loadKategoriOptions();

  document.getElementById('form-produk').addEventListener('submit', handleTambahProduk);
});

function cekLogin() {
  if (!isLoggedIn()) {
    window.location.href = './login.html';
  }
}

function tampilkanNamaAdmin() {
  const user = JSON.parse(localStorage.getItem('admin_user') || '{}');
  const el = document.getElementById('admin-name');
  if (el && user.name) {
    el.innerHTML = `${user.name} <span class="block text-[10px] uppercase tracking-wider text-orange-400 font-bold mt-0.5">${user.role}</span>`;
  }
}

function validasiRoleSuperadmin() {
  const user = JSON.parse(localStorage.getItem('admin_user') || '{}');
  if (user.role === 'superadmin') {
    const menu = document.getElementById('menu-superadmin');
    if (menu) menu.classList.remove('hidden');
  }
}

// ==================== LOGIKA CORE MANAJEMEN PRODUK ====================

// 1. Fetching data produk dan merender ke tabel
async function loadDataProduk() {
  const tbody = document.getElementById('tabel-produk');
  try {
    const response = await getProducts({ limit: 100 });
    const produkList = response.data || [];

    if (produkList.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" class="text-center py-10 text-slate-400">Belum ada produk terdaftar.</td></tr>`;
      return;
    }

    tbody.innerHTML = '';
    produkList.forEach(p => {
      const row = document.createElement('tr');
      row.className = 'hover:bg-slate-50/80 transition-colors duration-150';
      row.innerHTML = `
        <td class="py-4 px-6 flex items-center gap-4">
          <img src="${p.image_url || 'https://placehold.co/50'}" alt="${p.name}" class="w-12 h-12 object-cover rounded-xl border border-slate-100 shadow-sm" onerror="this.src='https://placehold.co/50'">
          <div>
            <div class="font-bold text-slate-900">${p.name}</div>
            <div class="text-xs text-slate-400 truncate max-w-[200px] font-normal">${p.description || '-'}</div>
          </div>
        </td>
        <td class="py-4 px-6 text-slate-500 font-medium">${p.category_name || p.category_id || 'Umum'}</td>
        <td class="py-4 px-6 font-bold text-slate-900">Rp ${Number(p.price).toLocaleString('id-ID')}</td>
        <td class="py-4 px-6">
          <span class="px-2.5 py-1 rounded-md text-xs font-bold ${p.stock > 10 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}">
            ${p.stock} pcs
          </span>
        </td>
        <td class="py-4 px-6 text-center">
          <button onclick="hapusProduk('${p.id}', '${p.name}')" class="text-rose-500 hover:text-rose-700 text-sm font-bold bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-lg transition-all">
            🗑️ Hapus
          </button>
        </td>
      `;
      tbody.appendChild(row);
    });
  } catch (err) {
    console.error(err);
    tbody.innerHTML = `<tr><td colspan="5" class="text-center py-10 text-rose-600 font-semibold">Gagal memuat koneksi data server.</td></tr>`;
  }
}

// 2. Mengambil kategori dari server untuk dimasukkan ke dalam pilihan select FORM
async function loadKategoriOptions() {
  const select = document.getElementById('prod-category');
  try {
    const response = await getCategories();
    const kategoriList = response.data || [];
    
    select.innerHTML = '<option value="">-- Pilih Kategori --</option>';
    kategoriList.forEach(k => {
      select.innerHTML += `<option value="${k.id}">${k.name}</option>`;
    });
  } catch (err) {
    console.error('Gagal mengambil opsi kategori:', err);
  }
}

// 3. Eksekusi Tambah Produk
async function handleTambahProduk(e) {
  e.preventDefault();
  
  const name = document.getElementById('prod-name').value.trim();
  const price = Number(document.getElementById('prod-price').value);
  const stock = Number(document.getElementById('prod-stock').value);
  const category_id = document.getElementById('prod-category').value;
  const image_url = document.getElementById('prod-image').value.trim();
  const description = document.getElementById('prod-desc').value.trim();
  const btn = document.getElementById('btn-save-product');

  btn.disabled = true;
  btn.textContent = 'Menyimpan...';

  try {
    const token = getToken();
    const response = await fetch(`${BASE_URL}/api/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ name, price, stock, category_id, image_url, description })
    });

    const result = await response.json();

    if (result.success) {
      alert('Produk baru berhasil ditambahkan!');
      document.getElementById('form-produk').reset();
      tutupModal();
      loadDataProduk(); 
    } else {
      alert(result.message || 'Gagal menyimpan produk');
    }
  } catch (err) {
    console.error(err);
    alert('Terjadi kesalahan hubungan ke server.');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Simpan Barang';
  }
}

// 4. Eksekusi Hapus data
async function hapusProduk(id, nama) {
  if (!confirm(`Apakah Anda yakin ingin menghapus produk "${nama}"?`)) return;

  try {
    const token = getToken();
    const response = await fetch(`${BASE_URL}/api/products/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const result = await response.json();

    if (result.success) {
      alert('Produk berhasil dihapus!');
      loadDataProduk(); 
    } else {
      alert(result.message || 'Gagal menghapus produk');
    }
  } catch (err) {
    console.error(err);
    alert('Koneksi terputus saat mencoba menghapus.');
  }
}

// ==================== INTERAKSI ANIMASI MODAL UI ====================
function bukaModal() {
  const modal = document.getElementById('modal-produk');
  const card = document.getElementById('modal-card');
  
  modal.classList.remove('hidden');
  setTimeout(() => {
    card.classList.remove('scale-95', 'opacity-0');
    card.classList.add('scale-100', 'opacity-100');
  }, 10);
}

function tutupModal() {
  const modal = document.getElementById('modal-produk');
  const card = document.getElementById('modal-card');
  
  card.classList.remove('scale-100', 'opacity-100');
  card.classList.add('scale-95', 'opacity-0');
  setTimeout(() => {
    modal.classList.add('hidden');
  }, 300);
}