// dashboard.js — Logic halaman Dashboard Admin
// Dikerjakan oleh: Anggota Frontend 2

document.addEventListener('DOMContentLoaded', () => {
  cekLogin();
  loadStats();
  tampilkanNamaAdmin();
});

function cekLogin() {
  if (!isLoggedIn()) {
    // Redirect ke login relatif terhadap folder admin
    window.location.href = './login.html';
  }
}

function tampilkanNamaAdmin() {
  const user = JSON.parse(localStorage.getItem('admin_user') || '{}');
  const el = document.getElementById('admin-name');

  if (el && user.name) {
    el.textContent = user.name;
  }
}

function logout() {
  removeToken();

  // Redirect relatif
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