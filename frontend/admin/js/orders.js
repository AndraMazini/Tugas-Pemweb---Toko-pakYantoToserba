// orders.js — Manajemen Operasional Data Transaksi Belanja Toko Pak Yanto

document.addEventListener('DOMContentLoaded', () => {
  cekLogin();
  tampilkanNamaAdmin();
  validasiRoleSuperadmin();
  loadDataOrders();
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

// ==================== LOGIKA CORE MANAJEMEN ORDERS ====================

// 1. Ambil list orderan dari server backend port 5000
async function loadDataOrders() {
  const tbody = document.getElementById('tabel-orders');
  try {
    const response = await getOrders();
    const orderList = response.data || [];

    if (orderList.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" class="text-center py-10 text-slate-400">Belum ada pesanan masuk dari pelanggan.</td></tr>`;
      return;
    }

    tbody.innerHTML = '';
    orderList.forEach(order => {
      const row = document.createElement('tr');
      row.className = 'hover:bg-slate-50/80 transition-colors duration-150';
      row.innerHTML = `
        <td class="py-4 px-6 text-slate-900 font-bold font-mono text-xs">${order.id}</td>
        <td class="py-4 px-6 text-slate-800 font-semibold">${order.customer_name}</td>
        <td class="py-4 px-6 text-slate-500 font-normal text-xs leading-relaxed">${order.items}</td>
        <td class="py-4 px-6 text-slate-900 font-extrabold text-sm">Rp ${order.total_price.toLocaleString('id-ID')}</td>
        <td class="py-4 px-6 text-center">
          ${getBadgeStatus(order.status)}
        </td>
        <td class="py-4 px-6 text-center">
          <select onchange="updateStatusPesanan('${order.id}', this.value)" 
            class="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-1.5 px-2.5 rounded-xl border-none outline-none focus:ring-2 focus:ring-orange-400 transition cursor-pointer">
            <option value="Pending" ${order.status === 'Pending' ? 'selected' : ''}>⏳ Pending</option>
            <option value="Diproses" ${order.status === 'Diproses' ? 'selected' : ''}>⚙️ Diproses</option>
            <option value="Selesai" ${order.status === 'Selesai' ? 'selected' : ''}>✅ Selesai</option>
            <option value="Dibatalkan" ${order.status === 'Dibatalkan' ? 'selected' : ''}>❌ Batal</option>
          </select>
        </td>
      `;
      tbody.appendChild(row);
    });
  } catch (err) {
    console.error(err);
    tbody.innerHTML = `<tr><td colspan="6" class="text-center py-10 text-rose-600 font-semibold">Gagal memuat koneksi order server port 5000.</td></tr>`;
  }
}

// Helper untuk mempercantik warna status badge
function getBadgeStatus(status) {
  switch(status) {
    case 'Pending':
      return `<span class="bg-amber-50 text-amber-600 px-2.5 py-1 rounded-full text-xs font-bold border border-amber-200">Pending</span>`;
    case 'Diproses':
      return `<span class="bg-blue-50 text-blue-600 px-2.5 py-1 rounded-full text-xs font-bold border border-blue-200">Diproses</span>`;
    case 'Selesai':
      return `<span class="bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded-full text-xs font-bold border border-emerald-200">Selesai</span>`;
    case 'Dibatalkan':
      return `<span class="bg-rose-50 text-rose-600 px-2.5 py-1 rounded-full text-xs font-bold border border-rose-200">Dibatalkan</span>`;
    default:
      return `<span class="bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full text-xs font-bold">${status}</span>`;
  }
}

// 2. Eksekusi PUT Request Update Status Order
async function updateStatusPesanan(id, statusBaru) {
  try {
    const token = getToken();
    const response = await fetch(`${BASE_URL}/api/orders/${id}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ status: statusBaru })
    });

    const result = await response.json();

    if (result.success) {
      alert(`Pesanan ${id} sukses diubah ke status [${statusBaru}]`);
      loadDataOrders(); // Reload tabel biar warna badge-nya update otomatis
    } else {
      alert(result.message || 'Gagal mengubah status pesanan');
    }
  } catch (err) {
    console.error(err);
    alert('Terjadi kesalahan koneksi status ke server port 5000.');
  }
}