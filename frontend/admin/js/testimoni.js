document.addEventListener("DOMContentLoaded", () => {
  cekLoginAdmin();
  tampilkanNamaAdmin();
  validasiRoleSuperadmin();
  loadDataTestimoni();
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

async function loadDataTestimoni() {
  const tbody = document.getElementById("tabel-testimoni");
  if (!tbody) return;

  try {
    const response = await getAllTestimonials();
    const testimonialList = response.data || response || [];

    if (!Array.isArray(testimonialList) || testimonialList.length === 0) {
      tbody.innerHTML = `<tr><td colspan="4" class="text-center py-10 text-slate-400">Belum ada testimoni masuk dari pelanggan.</td></tr>`;
      return;
    }

    tbody.innerHTML = "";
    testimonialList.forEach((item) => {
      const reviewText = item.review || item.message || "-";
      const row = document.createElement("tr");
      row.className = "hover:bg-slate-50/80 transition-colors duration-150";
      row.innerHTML = `
        <td class="py-4 px-6 text-slate-900 font-bold">👤 ${item.name || "-"}</td>
        <td class="py-4 px-6 text-slate-600 font-normal text-xs leading-relaxed italic">"${reviewText}"</td>
        <td class="py-4 px-6 text-center">
          ${getBadgeStatus(item.status || "Pending")}
        </td>
        <td class="py-4 px-6 text-center">
          <div class="flex items-center justify-center gap-2">
            <button onclick="setujuiTesti('${item.id}')" ${(item.status || "") === "Approved" ? "disabled" : ""}
              class="text-xs font-bold px-3 py-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-lg transition disabled:opacity-40 disabled:cursor-not-allowed">
              ✅ Setujui
            </button>
            <button onclick="tolakTesti('${item.id}')" ${(item.status || "") === "Rejected" ? "disabled" : ""}
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
    tbody.innerHTML = `<tr><td colspan="4" class="text-center py-10 text-rose-600 font-semibold">Gagal memuat koneksi server testimoni.</td></tr>`;
  }
}

function getBadgeStatus(status) {
  if (status === "Approved") {
    return `<span class="bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded-full text-xs font-bold border border-emerald-200">Tampil</span>`;
  } else if (status === "Rejected") {
    return `<span class="bg-rose-50 text-rose-600 px-2.5 py-1 rounded-full text-xs font-bold border border-rose-200">Ditolak</span>`;
  }
  return `<span class="bg-amber-50 text-amber-600 px-2.5 py-1 rounded-full text-xs font-bold border border-amber-200">Pending</span>`;
}

async function setujuiTesti(id) {
  try {
    const response = await approveTestimonial(id);
    if (response.success) {
      alert("Testimoni berhasil dipublikasikan!");
      loadDataTestimoni();
    } else {
      alert(response.message || "Gagal menyetujui testimoni");
    }
  } catch (err) {
    console.error(err);
    alert(err.message || "Koneksi terputus ke server.");
  }
}

async function tolakTesti(id) {
  try {
    const response = await rejectTestimonial(id);
    if (response.success) {
      alert("Testimoni berhasil ditolak & disembunyikan.");
      loadDataTestimoni();
    } else {
      alert(response.message || "Gagal menolak testimoni");
    }
  } catch (err) {
    console.error(err);
    alert(err.message || "Koneksi terputus ke server.");
  }
}