let dashboardChart;

document.addEventListener("DOMContentLoaded", () => {
  cekLoginAdmin();
  validasiRoleSuperadmin();
  tampilkanNamaAdmin();
  loadStats();
  setInterval(loadStats, 10000);
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

function validasiRoleSuperadmin() {
  const user = getAdminUser();

  if ((user.role || "").toLowerCase() === "superadmin") {
    const menu = document.getElementById("menu-superadmin");
    const shortcut = document.getElementById("shortcut-superadmin");

    if (menu) menu.classList.remove("hidden");
    if (shortcut) shortcut.classList.remove("hidden");
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

function logout() {
  removeAdminToken();
  window.location.href = "./login.html";
}

function getCount(data) {
  if (!data) return 0;
  if (Array.isArray(data)) return data.length;
  return data.data?.length ?? data.length ?? 0;
}

function buildRecentOrder(order) {
  const total =
    typeof order.total_price === "number"
      ? `Rp ${order.total_price.toLocaleString("id-ID")}`
      : order.total_price || "-";

  const status = (order.status || "").toLowerCase();
  const statusClass =
    status === "selesai"
      ? "bg-emerald-100 text-emerald-700"
      : status === "diproses"
      ? "bg-amber-100 text-amber-700"
      : "bg-rose-100 text-rose-700";

  return `
    <div class="rounded-3xl bg-slate-50 p-4 border border-slate-100">
      <div class="flex items-center justify-between gap-3">
        <div>
          <div class="font-semibold text-slate-900">${order.customer_name || "Pelanggan"}</div>
          <div class="text-xs text-slate-500 mt-1">${order.items || "Detail produk tidak tersedia"}</div>
        </div>
        <span class="rounded-full px-3 py-1 text-[11px] font-semibold ${statusClass}">
          ${order.status || "Unknown"}
        </span>
      </div>
      <div class="mt-3 flex items-center justify-between text-sm text-slate-600">
        <span class="font-medium">${order.id || "-"}</span>
        <span>${total}</span>
      </div>
    </div>
  `;
}

function updateChart({ produkCount, kategoriCount, ordersTotal, pendingTestimonials, blogCount }) {
  const ctx = document.getElementById("dashboardChart");
  if (!ctx) return;

  const config = {
    type: "bar",
    data: {
      labels: ["Produk", "Kategori", "Orders", "Testimoni", "Blog"],
      datasets: [{
        label: "Jumlah",
        data: [produkCount, kategoriCount, ordersTotal, pendingTestimonials, blogCount],
        backgroundColor: ["#f59e0b", "#3b82f6", "#ef4444", "#10b981", "#8b5cf6"],
        borderColor: ["#d97706", "#2563eb", "#b91c1c", "#059669", "#7c3aed"],
        borderWidth: 1,
        borderRadius: 12,
        maxBarThickness: 44
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          mode: "index",
          intersect: false,
          backgroundColor: "#0f172a",
          titleColor: "#fff",
          bodyColor: "#fff"
        }
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: "#475569", font: { size: 12 } }
        },
        y: {
          beginAtZero: true,
          ticks: { color: "#475569", font: { size: 12 } },
          grid: { color: "#e2e8f0" }
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
  const container = document.getElementById("recent-orders");
  if (!container) return;

  if (!Array.isArray(orders) || orders.length === 0) {
    container.innerHTML =
      '<div class="rounded-3xl bg-slate-50 p-4 border border-slate-100 text-slate-500">Belum ada pesanan terbaru untuk ditampilkan.</div>';
    return;
  }

  container.innerHTML = orders.slice(0, 4).map(buildRecentOrder).join("");
}

async function loadDataKategori() {
  const tbody = document.getElementById("tabel-kategori");
  if (!tbody) return;

  try {
    const response = await getCategories();
    let kategoriList = response.data || response || [];

    if (!Array.isArray(kategoriList) || kategoriList.length === 0) {
      const productRes = await getProducts({ limit: 500 });
      const products = productRes.data || productRes || [];

      const categoryMap = new Map();

      products.forEach((p) => {
        const catName = p.category_name || "Tanpa Kategori";
        const catId = p.category_id || catName;

        if (!categoryMap.has(catId)) {
          categoryMap.set(catId, {
            id: catId,
            name: catName
          });
        }
      });

      kategoriList = Array.from(categoryMap.values());
    }

    if (!kategoriList.length) {
      tbody.innerHTML = `<tr><td colspan="3" class="text-center py-10 text-slate-400">Belum ada kategori terdaftar.</td></tr>`;
      return;
    }

    tbody.innerHTML = "";
    kategoriList.forEach((k, index) => {
      const row = document.createElement("tr");
      row.className = "hover:bg-slate-50/80 transition-colors duration-150";
      row.innerHTML = `
        <td class="py-4 px-6 text-slate-400 font-bold">${index + 1}</td>
        <td class="py-4 px-6 text-slate-900 font-bold text-base">${k.name}</td>
        <td class="py-4 px-6 text-center">
          <button onclick="hapusKategori('${k.id}', '${String(k.name).replace(/'/g, "\\'")}')" class="text-rose-500 hover:text-rose-700 text-sm font-bold bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-lg transition-all">
            🗑️ Hapus
          </button>
        </td>
      `;
      tbody.appendChild(row);
    });
  } catch (err) {
    console.error("Gagal memuat kategori:", err);
    tbody.innerHTML = `<tr><td colspan="3" class="text-center py-10 text-rose-600 font-semibold">Gagal memuat koneksi data server kategori.</td></tr>`;
  }
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
    const testimonialData = testimoni.data ?? testimoni ?? [];

    const pendingTestimonials = Array.isArray(testimonialData)
      ? testimonialData.filter(t => (t.status || "").toLowerCase() === "pending").length
      : 0;

    const finishedOrders = Array.isArray(ordersData)
      ? ordersData.filter(o => (o.status || "").toLowerCase() === "selesai").length
      : 0;

    const pendingOrders = Array.isArray(ordersData)
      ? ordersData.filter(o => (o.status || "").toLowerCase() === "pending").length
      : 0;

    document.getElementById("stat-produk").textContent = produkCount;
    document.getElementById("stat-kategori").textContent = kategoriCount;
    document.getElementById("stat-orders").textContent = ordersTotal;
    document.getElementById("stat-testimoni").textContent = pendingTestimonials;
    document.getElementById("stat-blog").textContent = blogCount;
    document.getElementById("stat-finished-orders").textContent = finishedOrders;
    document.getElementById("stat-pending-orders").textContent = pendingOrders;

    updateChart({ produkCount, kategoriCount, ordersTotal, pendingTestimonials, blogCount });
    renderRecentOrders(Array.isArray(ordersData) ? ordersData : []);
  } catch (err) {
    console.error("Gagal load stats:", err);
  }
}