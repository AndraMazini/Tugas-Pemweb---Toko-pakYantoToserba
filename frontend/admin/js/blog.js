// blog.js — Manajemen Operasional Data Artikel Blog Toko Pak Yanto

document.addEventListener('DOMContentLoaded', () => {
  cekLogin();
  tampilkanNamaAdmin();
  validasiRoleSuperadmin();
  loadDataBlog();

  document.getElementById('form-blog').addEventListener('submit', handleTambahBlog);
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

// ==================== LOGIKA CORE MANAJEMEN BLOG ====================

// 1. Fetching daftar artikel dari backend port 5000
async function loadDataBlog() {
  const tbody = document.getElementById('tabel-blog');
  try {
    const response = await getAllBlogPosts();
    const blogList = response.data || [];

    if (blogList.length === 0) {
      tbody.innerHTML = `<tr><td colspan="3" class="text-center py-10 text-slate-400">Belum ada naskah artikel yang ditulis.</td></tr>`;
      return;
    }

    tbody.innerHTML = '';
    blogList.forEach(item => {
      const row = document.createElement('tr');
      row.className = 'hover:bg-slate-50/80 transition-colors duration-150';
      row.innerHTML = `
        <td class="py-4 px-6">
          <div class="font-bold text-slate-900 text-base mb-1">${item.title}</div>
          <div class="text-xs text-slate-400 truncate max-w-[450px] font-normal">${item.content}</div>
          <div class="text-[11px] text-amber-600 bg-amber-50 font-semibold px-2 py-0.5 rounded-md inline-block mt-2">
            🔗 slug: /blog/${item.slug}
          </div>
        </td>
        <td class="py-4 px-6 text-slate-500 font-semibold text-xs">
          🕒 ${formatDate(item.createdAt)}
        </td>
        <td class="py-4 px-6 text-center">
          <button onclick="hapusBlog('${item.id}', '${item.title}')" 
            class="text-rose-500 hover:text-rose-700 text-sm font-bold bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-lg transition-all">
            🗑️ Hapus
          </button>
        </td>
      `;
      tbody.appendChild(row);
    });
  } catch (err) {
    console.error(err);
    tbody.innerHTML = `<tr><td colspan="3" class="text-center py-10 text-rose-600 font-semibold">Gagal memuat koneksi data server blog port 5000.</td></tr>`;
  }
}

// 2. Eksekusi Posting Artikel Baru (Bypass FormData ke JSON Payload)
async function handleTambahBlog(e) {
  e.preventDefault();
  
  const title = document.getElementById('blog-title').value.trim();
  const content = document.getElementById('blog-content').value.trim();
  const btn = document.getElementById('btn-save-blog');

  btn.disabled = true;
  btn.textContent = 'Menerbitkan...';

  try {
    const token = getToken();
    // Bypass createBlogPost dari api.js karena database dummy kita menerima JSON murni
    const response = await fetch(`${BASE_URL}/api/blog`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ title, content })
    });

    const result = await response.json();

    if (result.success) {
      alert('Artikel blog sukses diterbitkan ke publik!');
      document.getElementById('form-blog').reset();
      tutupModal();
      loadDataBlog(); 
    } else {
      alert(result.message || 'Gagal menerbitkan artikel');
    }
  } catch (err) {
    console.error(err);
    alert('Koneksi terhambat ke server backend port 5000.');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Terbitkan Artikel';
  }
}

// 3. Eksekusi Hapus Artikel
async function hapusBlog(id, judul) {
  if (!confirm(`Apakah Anda yakin ingin menghapus artikel "${judul}"?`)) return;

  try {
    const response = await deleteBlogPost(id);

    if (response.success) {
      alert('Artikel berhasil dihapus dari sistem!');
      loadDataBlog(); 
    } else {
      alert(response.message || 'Gagal menghapus artikel');
    }
  } catch (err) {
    console.error(err);
    alert('Gagal menghubungi server saat mencoba menghapus artikel.');
  }
}

// ==================== INTERAKSI ANIMASI MODAL UI ====================
function bukaModal() {
  const modal = document.getElementById('modal-blog');
  const card = document.getElementById('modal-card');
  
  modal.classList.remove('hidden');
  setTimeout(() => {
    card.classList.remove('scale-95', 'opacity-0');
    card.classList.add('scale-100', 'opacity-100');
  }, 10);
}

function tutupModal() {
  const modal = document.getElementById('modal-blog');
  const card = document.getElementById('modal-card');
  
  card.classList.remove('scale-100', 'opacity-100');
  card.classList.add('scale-95', 'opacity-0');
  setTimeout(() => {
    modal.classList.add('hidden');
  }, 300);
}