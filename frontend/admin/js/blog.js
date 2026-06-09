document.addEventListener("DOMContentLoaded", () => {
  cekLoginAdmin();
  tampilkanNamaAdmin();
  validasiRoleSuperadmin();
  loadDataBlog();

  document.getElementById("form-blog")?.addEventListener("submit", handleTambahBlog);
});

function getAdminUser() {
  try {
    return JSON.parse(localStorage.getItem("admin_user") || "{}");
  } catch {
    return {};
  }
}

function cekLoginAdmin() {
  const user = getAdminUser();
  const role = (user.role || "").toLowerCase();

  if (!isAdminLoggedIn() || !role || (role !== "admin" && role !== "superadmin")) {
    removeAdminToken();
    window.location.href = "./login.html";
  }
}

function tampilkanNamaAdmin() {
  const user = getAdminUser();
  const el = document.getElementById("admin-name");
  if (el && user.name) {
    el.innerHTML = `${user.name} <span class="block text-[10px] uppercase tracking-wider text-orange-400 font-bold mt-0.5">${user.role || "admin"}</span>`;
  }
}

function validasiRoleSuperadmin() {
  const user = getAdminUser();
  if ((user.role || "").toLowerCase() === "superadmin") {
    const menu = document.getElementById("menu-superadmin");
    if (menu) menu.classList.remove("hidden");
  }
}

function logout() {
  removeAdminToken();
  window.location.href = "./login.html";
}

async function loadDataBlog() {
  const tbody = document.getElementById("tabel-blog");
  if (!tbody) return;

  try {
    const response = await getAllBlogPosts();
    const blogList = response.data || response || [];

    if (!Array.isArray(blogList) || blogList.length === 0) {
      tbody.innerHTML = `<tr><td colspan="3" class="text-center py-10 text-slate-400">Belum ada naskah artikel yang ditulis.</td></tr>`;
      return;
    }

    tbody.innerHTML = "";
    blogList.forEach((item) => {
      const createdAt = item.createdAt || item.created_at || item.date || "";
      const row = document.createElement("tr");
      row.className = "hover:bg-slate-50/80 transition-colors duration-150";
      row.innerHTML = `
        <td class="py-4 px-6">
          <div class="font-bold text-slate-900 text-base mb-1">${item.title || "-"}</div>
          <div class="text-xs text-slate-400 truncate max-w-[450px] font-normal">${item.content || "-"}</div>
          <div class="text-[11px] text-amber-600 bg-amber-50 font-semibold px-2 py-0.5 rounded-md inline-block mt-2">
            🔗 slug: /blog/${item.slug || "-"}
          </div>
        </td>
        <td class="py-4 px-6 text-slate-500 font-semibold text-xs">
          🕒 ${formatDate(createdAt)}
        </td>
        <td class="py-4 px-6 text-center">
          <button onclick="hapusBlog('${item.id}', '${String(item.title || "Artikel").replace(/'/g, "\\'")}')" 
            class="text-rose-500 hover:text-rose-700 text-sm font-bold bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-lg transition-all">
            🗑️ Hapus
          </button>
        </td>
      `;
      tbody.appendChild(row);
    });
  } catch (err) {
    console.error(err);
    tbody.innerHTML = `<tr><td colspan="3" class="text-center py-10 text-rose-600 font-semibold">Gagal memuat koneksi data server blog.</td></tr>`;
  }
}

async function handleTambahBlog(e) {
  e.preventDefault();

  const title = document.getElementById("blog-title")?.value.trim();
  const content = document.getElementById("blog-content")?.value.trim();
  const btn = document.getElementById("btn-save-blog");

  if (!title || !content) {
    alert("Judul dan isi artikel wajib diisi.");
    return;
  }

  if (btn) {
    btn.disabled = true;
    btn.textContent = "Menerbitkan...";
  }

  try {
    const response = await safeFetch(`${BASE_URL}/api/blog`, {
      method: "POST",
      headers: adminAuthHeader(),
      body: JSON.stringify({ title, content })
    });

    if (response.success) {
      alert("Artikel blog sukses diterbitkan ke publik!");
      document.getElementById("form-blog")?.reset();
      tutupModal();
      loadDataBlog();
    } else {
      alert(response.message || "Gagal menerbitkan artikel");
    }
  } catch (err) {
    console.error(err);
    alert(err.message || "Koneksi terhambat ke server backend.");
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.textContent = "Terbitkan Artikel";
    }
  }
}

async function hapusBlog(id, judul) {
  if (!confirm(`Apakah Anda yakin ingin menghapus artikel "${judul}"?`)) return;

  try {
    const response = await deleteBlogPost(id);

    if (response.success) {
      alert("Artikel berhasil dihapus dari sistem!");
      loadDataBlog();
    } else {
      alert(response.message || "Gagal menghapus artikel");
    }
  } catch (err) {
    console.error(err);
    alert(err.message || "Gagal menghubungi server saat mencoba menghapus artikel.");
  }
}

function bukaModal() {
  const modal = document.getElementById("modal-blog");
  const card = document.getElementById("modal-card");

  modal?.classList.remove("hidden");
  setTimeout(() => {
    card?.classList.remove("scale-95", "opacity-0");
    card?.classList.add("scale-100", "opacity-100");
  }, 10);
}

function tutupModal() {
  const modal = document.getElementById("modal-blog");
  const card = document.getElementById("modal-card");

  card?.classList.remove("scale-100", "opacity-100");
  card?.classList.add("scale-95", "opacity-0");
  setTimeout(() => {
    modal?.classList.add("hidden");
  }, 300);
}