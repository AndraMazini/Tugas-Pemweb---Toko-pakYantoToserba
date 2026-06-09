document.addEventListener("DOMContentLoaded", () => {
  cekLoginAdmin();
  tampilkanNamaAdmin();
  validasiRoleSuperadmin();
  loadDataProduk();
  loadKategoriOptions();

  document.getElementById("form-produk")?.addEventListener("submit", handleTambahProduk);
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
    el.innerHTML = `${user.name}
      <span class="block text-[10px] uppercase tracking-wider text-orange-400 font-bold mt-0.5">
        ${user.role || "admin"}
      </span>`;
  }
}

function validasiRoleSuperadmin() {
  const user = getAdminUser();
  if ((user.role || "").toLowerCase() === "superadmin") {
    const menu = document.getElementById("menu-superadmin");
    if (menu) menu.classList.remove("hidden");
  }
}

async function loadDataProduk() {
  const tbody = document.getElementById("tabel-produk");
  if (!tbody) return;

  try {
    const response = await getProducts({ limit: 100 });
    const produkList = response.data || response || [];

    if (!Array.isArray(produkList) || produkList.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" class="text-center py-10 text-slate-400">Belum ada produk terdaftar.</td></tr>`;
      return;
    }

    tbody.innerHTML = "";
    produkList.forEach((p) => {
      const rawImage = p.image_url || p.thumbnail_url || "";
      const imageSrc = rawImage
        ? (typeof getImageUrl === "function" ? getImageUrl(rawImage) : rawImage)
        : "https://placehold.co/50";

      const priceDisplay = p.price_range || (p.price ? `Rp ${Number(p.price).toLocaleString("id-ID")}` : "Hubungi toko");
      const stockDisplay = p.stock !== undefined && p.stock !== null
        ? `${Number(p.stock)} pcs`
        : "-";

      const row = document.createElement("tr");
      row.className = "hover:bg-slate-50/80 transition-colors duration-150";
      row.innerHTML = `
        <td class="py-4 px-6">
          <div class="flex items-center gap-4">
            <img src="${imageSrc}" alt="${p.name || "Produk"}" class="w-12 h-12 object-cover rounded-xl border border-slate-100 shadow-sm" onerror="this.src='https://placehold.co/50'">
            <div>
              <div class="font-bold text-slate-900">${p.name || "-"}</div>
              <div class="text-xs text-slate-400 truncate max-w-[200px] font-normal">${p.description || "-"}</div>
            </div>
          </div>
        </td>
        <td class="py-4 px-6 text-slate-500 font-medium">${p.category_name || p.category_id || "Umum"}</td>
        <td class="py-4 px-6 font-bold text-slate-900">${priceDisplay}</td>
        <td class="py-4 px-6">
          <span class="px-2.5 py-1 rounded-md text-xs font-bold bg-slate-100 text-slate-700">
            ${stockDisplay}
          </span>
        </td>
        <td class="py-4 px-6 text-center">
          <button onclick="hapusProduk('${p.id}', '${String(p.name || "Produk").replace(/'/g, "\\'")}')" class="text-rose-500 hover:text-rose-700 text-sm font-bold bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-lg transition-all">
            🗑️ Hapus
          </button>
        </td>
      `;
      tbody.appendChild(row);
    });
  } catch (err) {
    console.error("Gagal memuat produk:", err);
    tbody.innerHTML = `<tr><td colspan="5" class="text-center py-10 text-rose-600 font-semibold">Gagal memuat koneksi data server.</td></tr>`;
  }
}

async function loadKategoriOptions() {
  const select = document.getElementById("prod-category");
  if (!select) return;

  try {
    const response = await getCategories();
    const kategoriList = response.data || response || [];

    select.innerHTML = '<option value="">-- Pilih Kategori --</option>';
    kategoriList.forEach((k) => {
      select.innerHTML += `<option value="${k.id}">${k.name}</option>`;
    });
  } catch (err) {
    console.error("Gagal mengambil opsi kategori:", err);
  }
}

async function handleTambahProduk(e) {
  e.preventDefault();

  const name = document.getElementById("prod-name")?.value.trim();
  const price = Number(document.getElementById("prod-price")?.value || 0);
  const stock = Number(document.getElementById("prod-stock")?.value || 0);
  const category_id = document.getElementById("prod-category")?.value;
  const image_url = document.getElementById("prod-image")?.value.trim();
  const description = document.getElementById("prod-desc")?.value.trim();
  const btn = document.getElementById("btn-save-product");

  if (!name || !price || stock < 0) {
    alert("Nama, harga, dan stok produk wajib diisi dengan benar.");
    return;
  }

  if (btn) {
    btn.disabled = true;
    btn.textContent = "Menyimpan...";
  }

  try {
    const response = await createProduct({
      name,
      price,
      stock,
      category_id,
      image_url,
      description
    });

    if (response.success) {
      alert("Produk baru berhasil ditambahkan!");
      document.getElementById("form-produk")?.reset();
      tutupModal();
      loadDataProduk();
    } else {
      alert(response.message || "Gagal menyimpan produk");
    }
  } catch (err) {
    console.error("Gagal tambah produk:", err);
    alert(err.message || "Terjadi kesalahan hubungan ke server.");
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.textContent = "Simpan Barang";
    }
  }
}

async function hapusProduk(id, nama) {
  if (!confirm(`Apakah Anda yakin ingin menghapus produk "${nama}"?`)) return;

  try {
    const response = await deleteProduct(id);

    if (response.success) {
      alert("Produk berhasil dihapus!");
      loadDataProduk();
    } else {
      alert(response.message || "Gagal menghapus produk");
    }
  } catch (err) {
    console.error("Gagal hapus produk:", err);
    alert(err.message || "Koneksi terputus saat mencoba menghapus.");
  }
}

function bukaModal() {
  const modal = document.getElementById("modal-produk");
  const card = document.getElementById("modal-card");

  modal?.classList.remove("hidden");
  setTimeout(() => {
    card?.classList.remove("scale-95", "opacity-0");
    card?.classList.add("scale-100", "opacity-100");
  }, 10);
}

function tutupModal() {
  const modal = document.getElementById("modal-produk");
  const card = document.getElementById("modal-card");

  card?.classList.remove("scale-100", "opacity-100");
  card?.classList.add("scale-95", "opacity-0");
  setTimeout(() => {
    modal?.classList.add("hidden");
  }, 300);
}