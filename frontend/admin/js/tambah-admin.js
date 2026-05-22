// tambah-admin.js — Operasional Pendaftaran & Pemantauan Akun Staf Toko Pak Yanto

document.addEventListener('DOMContentLoaded', () => {
  cekLogin();
  tampilkanNamaAdmin();
  validasiRoleSuperadmin();
  loadDataAdmin(); // Panggil fungsi memuat tabel staf

  document.getElementById('form-tambah-admin').addEventListener('submit', handleRegisterAdmin);
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
    el.innerHTML = `${user.name} <span class="block text-[10px] uppercase tracking-wider text-red-400 font-bold mt-0.5">${user.role}</span>`;
  }
}

function validasiRoleSuperadmin() {
  const user = JSON.parse(localStorage.getItem('admin_user') || '{}');
  if (user.role !== 'superadmin') {
    alert('Akses Ditolak! Menu ini hanya boleh dibuka oleh Superadmin.');
    window.location.href = './dashboard.html';
  }
}

// ==================== LOGIKA CORE MANAJEMEN USER ADMIN ====================

// 1. Tampilkan Daftar Admin dengan Emote Spesifik Pembeda
async function loadDataAdmin() {
  const tbody = document.getElementById('tabel-admin');
  try {
    const token = getToken();
    const response = await fetch(`${BASE_URL}/api/auth/users`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const result = await response.json();
    const admins = result.data || [];

    tbody.innerHTML = '';
    admins.forEach(staf => {
      // Logika Emote & Badge Warna Pembeda
      let roleBadge = '';
      if (staf.role === 'superadmin') {
        roleBadge = `<span class="bg-red-50 text-red-600 border border-red-200 px-3 py-1 rounded-full text-xs font-bold flex items-center justify-center gap-1.5 w-max mx-auto">👑 Super Admin</span>`;
      } else {
        roleBadge = `<span class="bg-slate-100 text-slate-600 border border-slate-200 px-3 py-1 rounded-full text-xs font-bold flex items-center justify-center gap-1.5 w-max mx-auto">🧑‍💼 Admin Biasa</span>`;
      }

      const row = document.createElement('tr');
      row.className = 'hover:bg-slate-50/80 transition-colors duration-150';
      row.innerHTML = `
        <td class="py-4 px-6 font-bold text-slate-900">${staf.name}</td>
        <td class="py-4 px-6 text-slate-500 font-mono text-xs">${staf.email}</td>
        <td class="py-4 px-6 text-center">${roleBadge}</td>
        <td class="py-4 px-6 text-center">
          <button onclick="hapusAdmin('${staf.id}', '${staf.name}')" 
            class="text-rose-600 hover:text-rose-800 font-bold text-xs bg-rose-50 hover:bg-rose-100 px-2.5 py-1.5 rounded-lg transition">
            🗑️ Pecat
          </button>
        </td>
      `;
      tbody.appendChild(row);
    });
  } catch (err) {
    console.error(err);
    tbody.innerHTML = `<tr><td colspan="4" class="text-center py-10 text-rose-600 font-semibold">Gagal memuat daftar admin toko.</td></tr>`;
  }
}

// 2. Eksekusi Kirim Data Pendaftaran Admin Baru
async function handleRegisterAdmin(e) {
  e.preventDefault();

  const name = document.getElementById('reg-name').value.trim();
  const email = document.getElementById('reg-email').value.trim();
  const password = document.getElementById('reg-password').value.trim();
  const role = document.getElementById('reg-role').value;
  const btn = document.getElementById('btn-register-admin');

  btn.disabled = true;
  btn.textContent = 'Mendaftarkan...';

  try {
    const token = getToken();
    const response = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ name, email, password, role })
    });

    const result = await response.json();

    if (result.success) {
      alert(`Sukses mendaftarkan ${name}!`);
      document.getElementById('form-tambah-admin').reset();
      loadDataAdmin(); // Auto-refresh isi tabel biar langsung muncul di bawah
    } else {
      alert(result.message || 'Gagal mendaftarkan admin.');
    }
  } catch (err) {
    console.error(err);
    alert('Terjadi kendala jaringan ke server backend.');
  } finally {
    btn.disabled = false;
    btn.textContent = '➕ Daftarkan Akun Staf';
  }
}

// 3. Eksekusi Hapus Staf Pengelola
async function hapusAdmin(id, nama) {
  if (id === 'adm-1') {
    alert('Waduh! Akun utama Pak Yanto tidak boleh dihapus.');
    return;
  }

  if (!confirm(`Apakah Anda yakin ingin menghapus hak akses admin untuk "${nama}"?`)) return;

  try {
    const token = getToken();
    const response = await fetch(`${BASE_URL}/api/auth/users/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const result = await response.json();

    if (result.success) {
      alert('Akun staf berhasil dicabut jabatannya!');
      loadDataAdmin(); // Refresh tabel
    } else {
      alert(result.message || 'Gagal menghapus akun.');
    }
  } catch (err) {
    console.error(err);
    alert('Gagal menghubungi server.');
  }
}