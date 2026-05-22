// dashboard.js — Logic halaman Dashboard Admin

let dashboardChart;

document.addEventListener('DOMContentLoaded', () => {
  cekLogin();
  validasiRoleSuperadmin(); // 🌟 Tambahan validasi menu superadmin
  loadStats();
  tampilkanNamaAdmin();
  setInterval(loadStats, 10000);
});

function cekLogin() {
  const user = JSON.parse(localStorage.getItem('admin_user') || '{}');
  if (!isLoggedIn() || !user.role || (user.role !== 'admin' && user.role !== 'superadmin')) {
    removeToken();
    localStorage.removeItem('admin_user');
    window.location.href = '../index.html';
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

function getCount(data) {
  if (!data) return 0;
  if (Array.isArray(data)) return data.length;
  return data.data?.length ?? data.length ?? 0;
}

function buildRecentOrder(order) {
  const total = typeof order.total_price === 'number' ? `Rp ${order.total_price.toLocaleString('id-ID')}` : order.total_price || '-';
  const statusClass = order.status?.toLowerCase() === 'selesai'
    ? 'bg-emerald-100 text-emerald-700'
    : order.status?.toLowerCase() === 'diproses'
      ? 'bg-amber-100 text-amber-700'
      : 'bg-rose-100 text-rose-700';

  return `
    <div class="rounded-3xl bg-slate-50 p-4 border border-slate-100">
      <div class="flex items-center justify-between gap-3">
        <div>
          <div class="font-semibold text-slate-900">${order.customer_name || 'Pelanggan'}</div>
          <div class="text-xs text-slate-500 mt-1">${order.items || 'Detail produk tidak tersedia'}</div>
        </div>
        <span class="rounded-full px-3 py-1 text-[11px] font-semibold ${statusClass}">${order.status || 'Unknown'}</span>
      </div>
      <div class="mt-3 flex items-center justify-between text-sm text-slate-600">
        <span class="font-medium">${order.id || '-'}</span>
        <span>${total}</span>
      </div>
    </div>
  `;
}

function updateChart({ produkCount, kategoriCount, ordersTotal, pendingTestimonials, blogCount }) {
  const ctx = document.getElementById('dashboardChart');
  if (!ctx) return;

  const config = {
    type: 'bar',
    data: {
      labels: ['Produk', 'Kategori', 'Orders', 'Testimoni', 'Blog'],
      datasets: [{
        label: 'Jumlah',
        data: [produkCount, kategoriCount, ordersTotal, pendingTestimonials, blogCount],
        backgroundColor: ['#f59e0b', '#3b82f6', '#ef4444', '#10b981', '#8b5cf6'],
        borderColor: ['#d97706', '#2563eb', '#b91c1c', '#059669', '#7c3aed'],
        borderWidth: 1,
        borderRadius: 12,
        maxBarThickness: 44,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          mode: 'index',
          intersect: false,
          backgroundColor: '#0f172a',
          titleColor: '#fff',
          bodyColor: '#fff'
        }
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: '#475569', font: { size: 12 } }
        },
        y: {
          beginAtZero: true,
          ticks: { color: '#475569', font: { size: 12 } },
          grid: { color: '#e2e8f0' }
        }
      }
    }
  };

  if (dashboardChart) {
    dashboardChart.data = config.data;
    dashboardChart.options = config.options;
    dashboardChart.update();
  } else {
    dashboardChart = new Chart(ctx, config);
  }
}

function renderRecentOrders(orders) {
  const container = document.getElementById('recent-orders');
  if (!container) return;

  if (!Array.isArray(orders) || orders.length === 0) {
    container.innerHTML = '<div class="rounded-3xl bg-slate-50 p-4 border border-slate-100 text-slate-500">Belum ada pesanan terbaru untuk ditampilkan.</div>';
    return;
  }

  container.innerHTML = orders.slice(0, 4).map(buildRecentOrder).join('');
}

async function loadStats() {
  try {
    const [produk, kategori, orders, testimoni, blogs] = await Promise.all([
      getProducts(),
      getCategories(),
      getAllOrders(),
      getAllTestimonials(),
      getAllBlogPosts()
    ]);

    const produkCount = getCount(produk);
    const kategoriCount = getCount(kategori);
    const ordersData = orders.data ?? orders ?? [];
    const ordersTotal = Array.isArray(ordersData) ? ordersData.length : 0;
    const blogCount = getCount(blogs);
    const pendingTestimonials = (testimoni.data ?? testimoni ?? []).filter(t => t.status?.toLowerCase() === 'pending').length;
    const finishedOrders = Array.isArray(ordersData) ? ordersData.filter(o => o.status?.toLowerCase() === 'selesai').length : 0;
    const pendingOrders = Array.isArray(ordersData) ? ordersData.filter(o => o.status?.toLowerCase() === 'pending').length : 0;

    document.getElementById('stat-produk').textContent = produkCount;

    document.getElementById('stat-kategori').textContent = kategoriCount;

    document.getElementById('stat-orders').textContent = ordersTotal;

    document.getElementById('stat-testimoni').textContent = pendingTestimonials;
    document.getElementById('stat-blog').textContent = blogCount;
    document.getElementById('stat-finished-orders').textContent = finishedOrders;
    document.getElementById('stat-pending-orders').textContent = pendingOrders;

    updateChart({ produkCount, kategoriCount, ordersTotal, pendingTestimonials, blogCount });
    renderRecentOrders(Array.isArray(ordersData) ? ordersData : []);

  } catch (err) {
    console.error('Gagal load stats:', err);
  }
}