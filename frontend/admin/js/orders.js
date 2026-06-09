document.addEventListener("DOMContentLoaded", () => {
  cekLoginAdmin();
  tampilkanNamaAdmin();
  validasiRoleSuperadmin();
  loadDataOrders();
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

async function loadDataOrders() {
  const tbody = document.getElementById("tabel-orders");
  if (!tbody) return;

  try {
    const response = await getAllOrders();
    const orderList = response.data || response || [];

    if (!Array.isArray(orderList) || orderList.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" class="text-center py-10 text-slate-400">Belum ada pesanan masuk dari pelanggan.</td></tr>`;
      return;
    }

    tbody.innerHTML = "";
    orderList.forEach((order) => {
      const totalPrice = Number(order.total_price || 0);
      const itemsText = Array.isArray(order.items)
        ? order.items.map(i => `${i.name || i.product_name || "Item"} x${i.qty || i.quantity || 1}`).join(", ")
        : (order.items || "-");

      const row = document.createElement("tr");
      row.className = "hover:bg-slate-50/80 transition-colors duration-150";
      row.innerHTML = `
        <td class="py-4 px-6 text-slate-900 font-bold font-mono text-xs">${order.id || "-"}</td>
        <td class="py-4 px-6 text-slate-800 font-semibold">${order.customer_name || "-"}</td>
        <td class="py-4 px-6 text-slate-500 font-normal text-xs leading-relaxed">${itemsText}</td>
        <td class="py-4 px-6 text-slate-900 font-extrabold text-sm">Rp ${totalPrice.toLocaleString("id-ID")}</td>
        <td class="py-4 px-6 text-center">
          ${getBadgeStatus(order.status || "Pending")}
        </td>
        <td class="py-4 px-6 text-center">
          <select onchange="updateStatusPesanan('${order.id}', this.value)" 
            class="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-1.5 px-2.5 rounded-xl border-none outline-none focus:ring-2 focus:ring-orange-400 transition cursor-pointer">
            <option value="Pending" ${(order.status || "") === "Pending" ? "selected" : ""}>⏳ Pending</option>
            <option value="Diproses" ${(order.status || "") === "Diproses" ? "selected" : ""}>⚙️ Diproses</option>
            <option value="Selesai" ${(order.status || "") === "Selesai" ? "selected" : ""}>✅ Selesai</option>
            <option value="Dibatalkan" ${(order.status || "") === "Dibatalkan" ? "selected" : ""}>❌ Batal</option>
          </select>
        </td>
      `;
      tbody.appendChild(row);
    });
  } catch (err) {
    console.error(err);
    tbody.innerHTML = `<tr><td colspan="6" class="text-center py-10 text-rose-600 font-semibold">Gagal memuat koneksi order server.</td></tr>`;
  }
}

function getBadgeStatus(status) {
  switch(status) {
    case "Pending":
      return `<span class="bg-amber-50 text-amber-600 px-2.5 py-1 rounded-full text-xs font-bold border border-amber-200">Pending</span>`;
    case "Diproses":
      return `<span class="bg-blue-50 text-blue-600 px-2.5 py-1 rounded-full text-xs font-bold border border-blue-200">Diproses</span>`;
    case "Selesai":
      return `<span class="bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded-full text-xs font-bold border border-emerald-200">Selesai</span>`;
    case "Dibatalkan":
      return `<span class="bg-rose-50 text-rose-600 px-2.5 py-1 rounded-full text-xs font-bold border border-rose-200">Dibatalkan</span>`;
    default:
      return `<span class="bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full text-xs font-bold">${status}</span>`;
  }
}

async function updateStatusPesanan(id, statusBaru) {
  try {
    const result = await updateOrderStatus(id, statusBaru);

    if (result.success) {
      alert(`Pesanan ${id} sukses diubah ke status [${statusBaru}]`);
      loadDataOrders();
    } else {
      alert(result.message || "Gagal mengubah status pesanan");
    }
  } catch (err) {
    console.error(err);
    alert(err.message || "Terjadi kesalahan koneksi status ke server.");
  }
}