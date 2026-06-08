// kategori.js — Manajemen Operasional Data Kelompok Kategori Toko Pak Yanto

document.addEventListener('DOMContentLoaded', () => {
  cekLogin();
  tampilkanNamaAdmin();
  validasiRoleSuperadmin();
  loadDataKategori();

  document.getElementById('form-kategori').addEventListener('submit', handleTambahKategori);
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

// ==================== LOGIKA CORE MANAJEMEN KATEGORI ====================

// 1. Fetching data kategori dari server ke tabel
async function loadDataKategori() {
  const tbody = document.getElementById('tabel-kategori');
  try {
    const response = await getCategories();
    const kategoriList = response.data || [];

    if (kategoriList.length === 0) {
      tbody.innerHTML = `<tr><td colspan="3" class="text-center py-10 text-slate-400">Belum ada kategori terdaftar.</td></tr>`;
      return;
    }

    tbody.innerHTML = '';
    kategoriList.forEach((k, index) => {
      const row = document.createElement('tr');
      row.className = 'hover:bg-slate-50/80 transition-colors duration-150';
      row.innerHTML = `
        <td class="py-4 px-6 text-slate-400 font-bold">${index + 1}</td>
        <td class="py-4 px-6 text-slate-900 font-bold text-base">${k.name}</td>
        <td class="py-4 px-6 text-center">
          <button onclick="hapusKategori('${k.id}', '${k.name}')" class="text-rose-500 hover:text-rose-700 text-sm font-bold bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-lg transition-all">
            🗑️ Hapus
          </button>
        </td>
      `;
      tbody.appendChild(row);
    });
  } catch (err) {
    console.error(err);
    tbody.innerHTML = `<tr><td colspan="3" class="text-center py-10 text-rose-600 font-semibold">Gagal memuat koneksi data server kategori.</td></tr>`;
  }
}

// 2. Eksekusi Tambah Kategori Baru
async function handleTambahKategori(e) {
  e.preventDefault();
  
  const name = document.getElementById('cat-name').value.trim();
  const btn = document.getElementById('btn-save-category');

  btn.disabled = true;
  btn.textContent = 'Menyimpan...';

  try {
    const response = await createCategory({ name });

    if (response.success) {
      alert('Kategori baru berhasil ditambahkan!');
      document.getElementById('form-kategori').reset();
      tutupModal();
      loadDataKategori(); 
    } else {
      alert(response.message || 'Gagal menyimpan kategori');
    }
  } catch (err) {
    console.error(err);
    alert('Terjadi kesalahan hubungan ke server.');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Simpan Kategori';
  }
}

// 3. Eksekusi Hapus Kategori
async function hapusKategori(id, nama) {
  if (!confirm(`Apakah Anda yakin ingin menghapus kategori "${nama}"?`)) return;

  try {
    const response = await deleteCategory(id);

    if (response.success) {
      alert('Kategori berhasil dihapus!');
      loadDataKategori(); 
    } else {
      alert(response.message || 'Gagal menghapus kategori');
    }
  } catch (err) {
    console.error(err);
    alert('Koneksi terputus saat mencoba menghapus kategori.');
  }
}

// ==================== INTERAKSI ANIMASI MODAL UI ====================
function bukaModal() {
  const modal = document.getElementById('modal-kategori');
  const card = document.getElementById('modal-card');
  
  modal.classList.remove('hidden');
  setTimeout(() => {
    card.classList.remove('scale-95', 'opacity-0');
    card.classList.add('scale-100', 'opacity-100');
  }, 10);
}

function tutupModal() {
  const modal = document.getElementById('modal-kategori');
  const card = document.getElementById('modal-card');
  
  card.classList.remove('scale-100', 'opacity-100');
  card.classList.add('scale-95', 'opacity-0');
  setTimeout(() => {
    modal.classList.add('hidden');
  }, 300);
}