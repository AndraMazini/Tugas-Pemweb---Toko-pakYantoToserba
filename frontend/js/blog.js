const EXTRA_PROMO_POSTS = [
  {
    id: "promo-extra-1",
    title: "Produk Perawatan Baru Hadir dengan Ukuran Pilihan",
    slug: "produk-perawatan-baru-hadir-dengan-ukuran-pilihan",
    thumbnail_url: "assets/blog/new-product.png",
    created_at: "2026-06-24T09:00:00",
    content: `
      <p>Toserba Pak Yanto menghadirkan produk perawatan baru dengan tampilan elegan dan kualitas pilihan untuk kebutuhan harian Anda. Produk ini hadir dengan beberapa ukuran praktis yang dapat disesuaikan dengan kebutuhan penggunaan di rumah maupun saat bepergian.</p>

      <p>Dengan desain kemasan yang modern dan sederhana, produk ini tidak hanya menarik secara visual, tetapi juga memberikan kesan bersih, premium, dan terpercaya. Cocok untuk Anda yang menyukai produk dengan tampilan eksklusif namun tetap fungsional.</p>

      <p><strong>Pilihan ukuran tersedia:</strong> 15 ml, 25 ml, dan 40 ml.<br>
      <strong>Keunggulan produk:</strong> kemasan praktis, desain premium, nyaman digunakan sehari-hari.<br>
      <strong>Periode promo:</strong> berlaku selama persediaan masih tersedia.</p>

      <p>Dapatkan produk terbaru ini sekarang juga dan lengkapi kebutuhan perawatan Anda dengan pilihan yang lebih praktis, modern, dan berkualitas bersama Toserba Pak Yanto.</p>
    `
  },
  {
    id: "promo-extra-2",
    title: "Electronic Flash Sale Spesial Minggu Ini",
    slug: "electronic-flash-sale-spesial-minggu-ini",
    thumbnail_url: "assets/blog/electronic-flash-sale.png",
    created_at: "2026-06-25T09:00:00",
    content: `
      <p>Nikmati promo spesial <strong>Electronic Flash Sale</strong> dari Toserba Pak Yanto untuk berbagai produk elektronik pilihan. Ini adalah kesempatan terbaik untuk mendapatkan produk fungsional dengan harga lebih hemat dalam waktu terbatas.</p>

      <p>Pada promo kali ini, kami menghadirkan beberapa produk unggulan seperti setrika dan smartwatch dengan penawaran harga spesial. Promo ini cocok untuk Anda yang ingin memenuhi kebutuhan rumah tangga sekaligus tetap mengikuti gaya hidup modern.</p>

      <p><strong>Produk promo:</strong><br>
      Setrika – <strong>Rp149.000</strong><br>
      Smartwatch A – <strong>Rp199.000</strong></p>

      <p><strong>Periode promo:</strong> 10 – 15 April.<br>
      <strong>Status promo:</strong> limited series / stok terbatas.<br>
      <strong>Catatan:</strong> harga promo hanya berlaku selama periode berlangsung dan selama persediaan masih ada.</p>

      <p>Jangan lewatkan kesempatan ini. Segera lakukan pemesanan sekarang dan dapatkan penawaran terbaik hanya di Toserba Pak Yanto.</p>
    `
  },
  {
    id: "promo-extra-3",
    title: "Promo Skincare Terbaru Diskon 30%",
    slug: "promo-skincare-terbaru-diskon-30-persen",
    thumbnail_url: "assets/blog/new-beauty-skincare.png",
    created_at: "2026-06-26T09:00:00",
    content: `
      <p>Toserba Pak Yanto menghadirkan promo spesial untuk produk skincare terbaru dengan potongan harga hingga <strong>30% OFF</strong>. Ini adalah kesempatan yang tepat untuk mendapatkan produk perawatan favorit dengan harga yang lebih terjangkau.</p>

      <p>Produk skincare yang tersedia dirancang untuk membantu rutinitas perawatan harian Anda, dengan kemasan modern dan tampilan premium yang memberikan kesan berkualitas sejak pertama dilihat. Promo ini sangat cocok bagi Anda yang ingin mencoba produk baru ataupun melengkapi kebutuhan perawatan pribadi.</p>

      <p><strong>Penawaran spesial:</strong> Diskon hingga 30% OFF.<br>
      <strong>Produk unggulan:</strong> serum, lotion, botol pump skincare, dan produk perawatan pilihan lainnya.<br>
      <strong>Periode promo:</strong> berlaku selama promo berlangsung dan stok masih tersedia.</p>

      <p>Segera manfaatkan promo ini sebelum berakhir. Dapatkan produk skincare favorit Anda dan rasakan pengalaman belanja yang lebih hemat dan lebih nyaman bersama Toserba Pak Yanto.</p>
    `
  }
];

document.addEventListener("DOMContentLoaded", async () => {
  initBlogDarkMode();
  await loadAllBlogs();
});

const OLD_HIDDEN_SLUGS = [
  "tips-memilih-beras-pandan-wangi-asli",
  "promo-sembako-murah-jelang-akhir-bulan"
];

function initBlogDarkMode() {
  const body = document.body;
  const toggle = document.getElementById("modeToggleBlog");
  const savedTheme = localStorage.getItem("theme");

  if (savedTheme === "dark") {
    body.classList.add("dark");
    if (toggle) toggle.innerHTML = '<i class="bi bi-sun-fill"></i>';
  } else {
    body.classList.remove("dark");
    if (toggle) toggle.innerHTML = '<i class="bi bi-moon-stars-fill"></i>';
  }

  toggle?.addEventListener("click", () => {
    body.classList.toggle("dark");
    const isDark = body.classList.contains("dark");
    localStorage.setItem("theme", isDark ? "dark" : "light");

    toggle.innerHTML = isDark
      ? '<i class="bi bi-sun-fill"></i>'
      : '<i class="bi bi-moon-stars-fill"></i>';
  });
}

async function loadAllBlogs() {
  const loading = document.getElementById("blog-loading");
  const list = document.getElementById("blog-list");
  const empty = document.getElementById("blog-empty");
  const error = document.getElementById("blog-error");
  const countText = document.getElementById("blog-count-text");

  try {
    let apiPosts = [];

    if (typeof getBlogPosts === "function") {
      const res = await getBlogPosts({ limit: 50 });
      if (res?.success && Array.isArray(res.data)) {
        apiPosts = res.data;
      }
    }

    apiPosts = apiPosts.filter(post => !OLD_HIDDEN_SLUGS.includes(post.slug));

    const posts = mergeBlogPosts(apiPosts);

    loading?.classList.add("d-none");

    if (!posts.length) {
      empty?.classList.remove("d-none");
      if (countText) countText.textContent = "Belum ada artikel tersedia";
      return;
    }

    if (countText) {
      countText.textContent = `${posts.length} artikel tersedia`;
    }

    list.innerHTML = posts.map(post => {
      const imageUrl = resolveBlogImage(post);
      const excerpt = buildBlogCardExcerpt(post);
      const safeDate = getSafeDate(post.created_at);

      return `
        <a href="blog-detail.html?slug=${encodeURIComponent(post.slug)}" class="blog-card">
          <img
            src="${imageUrl}"
            alt="${escapeHtml(post.title || "Artikel Blog")}"
            class="blog-img"
            onerror="this.onerror=null;this.src='${getFallbackBlogPoster(post)}';"
          />

          <div class="blog-body">
            <div class="blog-meta">
              <i class="bi bi-calendar3"></i>
              ${escapeHtml(safeDate)}
            </div>

            <div class="blog-title">${escapeHtml(post.title || "Artikel Toko")}</div>
            <p class="blog-excerpt">${escapeHtml(excerpt)}</p>
          </div>
        </a>
      `;
    }).join("");

    list.classList.remove("d-none");
  } catch (err) {
    console.error("Gagal memuat daftar blog:", err);
    loading?.classList.add("d-none");
    error?.classList.remove("d-none");
    if (countText) countText.textContent = "Terjadi kesalahan saat memuat artikel";
  }
}

function mergeBlogPosts(apiPosts = []) {
  const map = new Map();

  // promo custom selalu masuk
  EXTRA_PROMO_POSTS.forEach(post => {
    map.set(post.slug, { ...post, __priority: 1 });
  });

  // artikel dari API tetap ikut tampil semua
  apiPosts.forEach(post => {
    if (!post?.slug) return;

    if (map.has(post.slug)) {
      const existing = map.get(post.slug);
      map.set(post.slug, {
        ...post,
        title: post.title || existing.title,
        content: post.content || existing.content,
        thumbnail_url: post.thumbnail_url || existing.thumbnail_url,
        created_at: post.created_at || existing.created_at,
        __priority: existing.__priority
      });
    } else {
      map.set(post.slug, {
        ...post,
        __priority: 0
      });
    }
  });

  return Array.from(map.values()).sort((a, b) => {
    if ((b.__priority || 0) !== (a.__priority || 0)) {
      return (b.__priority || 0) - (a.__priority || 0);
    }
    return new Date(b.created_at || 0) - new Date(a.created_at || 0);
  });
}

function resolveBlogImage(post) {
  const path = String(post?.thumbnail_url || "").trim();

  if (!path) {
    return getFallbackBlogPoster(post);
  }

  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  if (
    path.startsWith("assets/") ||
    path.startsWith("./assets/") ||
    path.startsWith("../assets/")
  ) {
    return path;
  }

  if (typeof getImageUrl === "function") {
    return getImageUrl(path);
  }

  return path;
}

function getFallbackBlogPoster(post = {}) {
  const title = String(post.title || "").toLowerCase();
  const content = String(post.content || "").toLowerCase();
  const text = `${title} ${content}`;

  if (text.includes("furnitur") || text.includes("sofa") || text.includes("minimalis")) {
    return "assets/blog/new-minimalist-furniture.png";
  }

  if (text.includes("friday sale") || text.includes("material") || text.includes("peralatan")) {
    return "assets/blog/promo-friday-sale.png";
  }

  if (text.includes("perawatan") || text.includes("produk baru") || text.includes("ukuran pilihan")) {
    return "assets/blog/new-product.png";
  }

  if (text.includes("beras")) {
    return "https://images.unsplash.com/photo-1586201375761-83865001e31c?q=80&w=1200&auto=format&fit=crop";
  }

  if (text.includes("promo") || text.includes("diskon") || text.includes("murah")) {
    return "https://images.unsplash.com/photo-1488459716781-31db52582fe9?q=80&w=1200&auto=format&fit=crop";
  }

  if (text.includes("tips") || text.includes("belanja")) {
    return "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1200&auto=format&fit=crop";
  }

  return "https://via.placeholder.com/1200x700?text=Promo+Toserba";
}

function buildBlogCardExcerpt(post = {}) {
  const raw = stripHtml(post.content || "").trim();

  if (!raw) {
    return "Tips belanja, promo terbaru, dan informasi penting dari toko.";
  }

  return raw.length > 120 ? raw.slice(0, 120) + "..." : raw;
}

function stripHtml(text = "") {
  return String(text).replace(/<[^>]*>/g, " ");
}

function getSafeDate(value) {
  if (!value) return "Tanggal promo terbaru";

  if (typeof formatDate === "function") {
    const formatted = formatDate(value);
    if (formatted && formatted !== "-") return formatted;
  }

  return "Tanggal promo terbaru";
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}