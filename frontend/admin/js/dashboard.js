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

function getArrayData(payload) {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload.data)) return payload.data;
  return [];
}

function buildCategoryFallbackFromProducts(products = []) {
  const map = new Map();

  products.forEach((p) => {
    const rawName = (p.category_name || "").trim();
    const rawId = p.category_id || rawName;

    if (!rawName) return;

    if (!map.has(rawId)) {
      map.set(rawId, {
        id: rawId,
        name: rawName
      });
    }
  });

  return Array.from(map.values());
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
      : status === "dibatalkan"
      ? "bg-rose-100 text-rose-700"
      : "bg-slate-100 text-slate-700";

  const itemText = Array.isArray(order.items)
    ? order.items.map(i => `${i.name || i.product_name || "Item"} x${i.qty || i.quantity || 1}`).join(", ")
    : (order.items || "Detail produk tidak tersedia");

  return `
    <div class="rounded-3xl bg-slate-50 p-4 border border-slate-100">
      <div class="flex items-center justify-between gap-3">
        <div>
          <div class="font-semibold text-slate-900">${order.customer_name || "Pelanggan"}</div>
          <div class="text-xs text-slate-500 mt-1">${itemText}</div>
        </div>
        <span class="rounded-full px-3 py-1 text-[11px] font-semibold ${statusClass}">
          ${order.status || "Pending"}
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

async function loadStats() {
  try {
    const [produkRes, kategoriRes, ordersRes, testimoniRes, blogsRes] = await Promise.all([
      getProducts({ limit: 500 }),
      getCategories(),
      getAllOrders(),
      getAllTestimonials(),
      getAllBlogPosts()
    ]);

    const produkList = getArrayData(produkRes);
    let kategoriList = getArrayData(kategoriRes);
    const ordersList = getArrayData(ordersRes);
    const testimonialList = getArrayData(testimoniRes);
    const blogList = getArrayData(blogsRes);

    // fallback kategori dari produk jika endpoint kategori kosong / tidak sinkron
    if (!kategoriList.length) {
      kategoriList = buildCategoryFallbackFromProducts(produkList);
    }

    const produkCount = produkList.length;
    const kategoriCount = kategoriList.length;
    const ordersTotal = ordersList.length;
    const blogCount = blogList.length;

    const pendingTestimonials = testimonialList.filter(t => {
      const status = String(t.status || "").toLowerCase();
      return status === "pending";
    }).length;

    const finishedOrders = ordersList.filter(o => {
      const status = String(o.status || "").toLowerCase();
      return status === "selesai";
    }).length;

    const pendingOrders = ordersList.filter(o => {
      const status = String(o.status || "").toLowerCase();
      return status === "pending";
    }).length;

    const statProduk = document.getElementById("stat-produk");
    const statKategori = document.getElementById("stat-kategori");
    const statOrders = document.getElementById("stat-orders");
    const statTestimoni = document.getElementById("stat-testimoni");
    const statBlog = document.getElementById("stat-blog");
    const statFinishedOrders = document.getElementById("stat-finished-orders");
    const statPendingOrders = document.getElementById("stat-pending-orders");

    if (statProduk) statProduk.textContent = produkCount;
    if (statKategori) statKategori.textContent = kategoriCount;
    if (statOrders) statOrders.textContent = ordersTotal;
    if (statTestimoni) statTestimoni.textContent = pendingTestimonials;
    if (statBlog) statBlog.textContent = blogCount;
    if (statFinishedOrders) statFinishedOrders.textContent = finishedOrders;
    if (statPendingOrders) statPendingOrders.textContent = pendingOrders;

    updateChart({
      produkCount,
      kategoriCount,
      ordersTotal,
      pendingTestimonials,
      blogCount
    });

    renderRecentOrders(ordersList);
  } catch (err) {
    console.error("Gagal load stats:", err);
  }
}