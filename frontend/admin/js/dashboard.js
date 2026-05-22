// dashboard.js — Logic halaman Dashboard Admin

document.addEventListener('DOMContentLoaded', () => {
  cekLogin();
  validasiRoleSuperadmin(); // 🌟 Tambahan validasi menu superadmin
  loadStats();
  tampilkanNamaAdmin();
});

function cekLogin() {
  if (!isLoggedIn()) {
    window.location.href = './login.html';
  }
}

// 🌟 TAMBAHAN: Logika menyalakan menu rahasia jika role sesuai
function validasiRoleSuperadmin() {
  const user = JSON.parse(localStorage.getItem('admin_user') || '{}');
  
  if (user.role === 'superadmin') {
    const menu = document.getElementById('menu-superadmin');
    const shortcut = document.getElementById('shortcut-superadmin');
    
    if (menu) menu.classList.remove('hidden');
    if (shortcut) shortcut.classList.remove('hidden');
  }
}

function tampilkanNamaAdmin() {
  const user = JSON.parse(localStorage.getItem('admin_user') || '{}');
  const el = document.getElementById('admin-name');

  if (el && user.name) {
    // Tambahkan badge status role agar admin tahu tingkatan mereka
    el.innerHTML = `${user.name} <span class="block text-[10px] uppercase tracking-wider text-orange-400 font-bold mt-0.5">${user.role}</span>`;
  }
}

function logout() {
  removeToken();
  localStorage.removeItem('admin_user'); // Bersihkan sisa data user saat logout
  window.location.href = './login.html';
}

async function loadStats() {
  try {
    const [produk, kategori, orders, testimoni] = await Promise.all([
      getProducts({ limit: 1 }),
      getCategories(),
      getAllOrders({ status: 'new', limit: 1 }),
      getAllTestimonials()
    ]);

    document.getElementById('stat-produk').textContent =
      produk.pagination?.total ?? '-';

    document.getElementById('stat-kategori').textContent =
      kategori.data?.length ?? '-';

    document.getElementById('stat-orders').textContent =
      orders.pagination?.total ?? '-';

    document.getElementById('stat-testimoni').textContent =
      testimoni.data?.filter(t => !t.is_approved).length ?? '-';

  } catch (err) {
    console.error('Gagal load stats:', err);
  }
}