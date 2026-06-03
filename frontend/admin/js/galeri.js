// galeri.js — Manajemen Operasional Data Galeri Toko Pak Yanto

document.addEventListener('DOMContentLoaded', () => {
  cekLogin();
  tampilkanNamaAdmin();
  validasiRoleSuperadmin();
  loadDataGaleri();

  document.getElementById('form-galeri').addEventListener('submit', handleTambahGaleri);
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

// ==================== LOGIKA CORE MANAJEMEN GALERI ====================

// 1. Fetching album foto galeri dari server backend port 5000
async function loadDataGaleri() {
  const gridContainer = document.getElementById('grid-galeri');
  try {
    const response = await getGallery();
    const galeriList = response.data || [];

    if (galeriList.length === 0) {
      gridContainer.innerHTML = `
        <div class="col-span-full text-center py-20 bg-white rounded-2xl border border-slate-100 p-6 text-slate-400">
          📷 Album galeri toko masih kosong. Silakan unggah dokumentasi perdana Anda!
        </div>`;
      return;
    }

    gridContainer.innerHTML = '';
    galeriList.forEach(item => {
      const card = document.createElement('div');
      card.className = 'bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden group hover:shadow-md transition-all duration-300 flex flex-col';
      card.innerHTML = `
        <div class="relative overflow-hidden aspect-video bg-slate-100">
          <img src="${item.image_url}" alt="${item.title}" 
            class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
            onerror="this.src='https://placehold.co/600x400?text=Gambar+Rusak'">
        </div>
        <div class="p-5 flex flex-col justify-between flex-1 gap-4">
          <h4 class="font-bold text-slate-800 line-clamp-2 text-base leading-snug">${item.title}</h4>
          <div class="flex items-center justify-end border-t border-slate-50 pt-3">
            <button onclick="hapusFoto('${item.id}', '${item.title}')" 
              class="text-rose-500 hover:text-rose-700 text-xs font-bold bg-rose-50 hover:bg-rose-100 px-3 py-2 rounded-xl transition-all">
              🗑️ Hapus Dokumentasi
            </button>
          </div>
        </div>
      `;
      gridContainer.appendChild(card);
    });
  } catch (err) {
    console.error(err);
    gridContainer.innerHTML = `
      <div class="col-span-full text-center py-20 bg-rose-50 rounded-2xl text-rose-600 font-semibold border border-rose-100">
        🚨 Hubungan ke server port 5000 terputus. Gagal memuat album galeri.
      </div>`;
  }
}

// 2. Eksekusi Kirim Data Foto Baru (Menggunakan JSON payload menyesuaikan dummy backend)
async function handleTambahGaleri(e) {
  e.preventDefault();
  
  const title = document.getElementById('gal-title').value.trim();
  const image_url = document.getElementById('gal-image').value.trim();
  const btn = document.getElementById('btn-save-gallery');

  btn.disabled = true;
  btn.textContent = 'Memajang...';

  try {
    const token = getToken();
    // Kita bypass pemanggilan createGallery di api.js karena disana defaultnya menerima FormData, 
    // sedangkan database dummy kita saat ini membutuhkan JSON agar praktis dan tidak crash.
    const response = await fetch(`${BASE_URL}/api/gallery`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ title, image_url })
    });

    const result = await response.json();

    if (result.success) {
      alert('Foto baru berhasil ditambahkan ke galeri!');
      document.getElementById('form-galeri').reset();
      tutupModal();
      loadDataGaleri(); 
    } else {
      alert(result.message || 'Gagal menyimpan foto');
    }
  } catch (err) {
    console.error(err);
    alert('Terjadi hambatan koneksi data ke server port 5000.');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Pajang Foto';
  }
}

// 3. Eksekusi Hapus Foto
async function hapusFoto(id, judul) {
  if (!confirm(`Apakah Anda yakin ingin menghapus foto "${judul}" dari album?`)) return;

  try {
    const response = await deleteGallery(id);

    if (response.success) {
      alert('Foto berhasil dihapus dari galeri!');
      loadDataGaleri(); 
    } else {
      alert(response.message || 'Gagal menghapus foto');
    }
  } catch (err) {
    console.error(err);
    alert('Koneksi terputus saat mencoba menghapus gambar.');
  }
}

// ==================== INTERAKSI ANIMASI MODAL UI ====================
function bukaModal() {
  const modal = document.getElementById('modal-galeri');
  const card = document.getElementById('modal-card');
  
  modal.classList.remove('hidden');
  setTimeout(() => {
    card.classList.remove('scale-95', 'opacity-0');
    card.classList.add('scale-100', 'opacity-100');
  }, 10);
}

function tutupModal() {
  const modal = document.getElementById('modal-galeri');
  const card = document.getElementById('modal-card');
  
  card.classList.remove('scale-100', 'opacity-100');
  card.classList.add('scale-95', 'opacity-0');
  setTimeout(() => {
    modal.classList.add('hidden');
  }, 300);
}