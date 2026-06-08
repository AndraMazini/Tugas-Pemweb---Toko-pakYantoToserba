// testimoni.js — Manajemen Operasional Data Review Toko Pak Yanto

document.addEventListener('DOMContentLoaded', () => {
  cekLogin();
  tampilkanNamaAdmin();
  validasiRoleSuperadmin();
  loadDataTestimoni();
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

// ==================== LOGIKA CORE MANAJEMEN TESTIMONI ====================

// 1. Ambil seluruh testimoni dari server backend port 5000
async function loadDataTestimoni() {
  const tbody = document.getElementById('tabel-testimoni');
  try {
    const response = await getAllTestimonials();
    const testimonialList = response.data || [];

    if (testimonialList.length === 0) {
      tbody.innerHTML = `<tr><td colspan="4" class="text-center py-10 text-slate-400">Belum ada testimoni masuk dari pelanggan.</td></tr>`;
      return;
    }

    tbody.innerHTML = '';
    testimonialList.forEach(item => {
      const row = document.createElement('tr');
      row.className = 'hover:bg-slate-50/80 transition-colors duration-150';
      row.innerHTML = `
        <td class="py-4 px-6 text-slate-900 font-bold">👤 ${item.name}</td>
        <td class="py-4 px-6 text-slate-600 font-normal text-xs leading-relaxed italic">"${item.review}"</td>
        <td class="py-4 px-6 text-center">
          ${getBadgeStatus(item.status)}
        </td>
        <td class="py-4 px-6 text-center">
          <div class="flex items-center justify-center gap-2">
            <button onclick="setujuiTesti('${item.id}')" ${item.status === 'Approved' ? 'disabled' : ''}
              class="text-xs font-bold px-3 py-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-lg transition disabled:opacity-40 disabled:cursor-not-allowed">
              ✅ Setujui
            </button>
            <button onclick="tolakTesti('${item.id}')" ${item.status === 'Rejected' ? 'disabled' : ''}
              class="text-xs font-bold px-3 py-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-lg transition disabled:opacity-40 disabled:cursor-not-allowed">
              ❌ Tolak
            </button>
          </div>
        </td>
      `;
      tbody.appendChild(row);
    });
  } catch (err) {
    console.error(err);
    tbody.innerHTML = `<tr><td colspan="4" class="text-center py-10 text-rose-600 font-semibold">Gagal memuat koneksi server testimoni port 5000.</td></tr>`;
  }
}

// Helper badge status warna testimoni
function getBadgeStatus(status) {
  if (status === 'Approved') {
    return `<span class="bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded-full text-xs font-bold border border-emerald-200">Tampil</span>`;
  } else if (status === 'Rejected') {
    return `<span class="bg-rose-50 text-rose-600 px-2.5 py-1 rounded-full text-xs font-bold border border-rose-200">Ditolak</span>`;
  }
  return `<span class="bg-amber-50 text-amber-600 px-2.5 py-1 rounded-full text-xs font-bold border border-amber-200">Pending</span>`;
}

// 2. Eksekusi Aksi Approve
async function setujuiTesti(id) {
  try {
    const response = await approveTestimonial(id);
    if (response.success) {
      alert('Testimoni berhasil dipublikasikan!');
      loadDataTestimoni();
    } else {
      alert(response.message || 'Gagal menyetujui testimoni');
    }
  } catch (err) {
    console.error(err);
    alert('Koneksi terputus ke server port 5000.');
  }
}

// 3. Eksekusi Aksi Reject
async function tolakTesti(id) {
  try {
    const response = await rejectTestimonial(id);
    if (response.success) {
      alert('Testimoni berhasil ditolak & disembunyikan.');
      loadDataTestimoni();
    } else {
      alert(response.message || 'Gagal menolak testimoni');
    }
  } catch (err) {
    console.error(err);
    alert('Koneksi terputus ke server port 5000.');
  }
}