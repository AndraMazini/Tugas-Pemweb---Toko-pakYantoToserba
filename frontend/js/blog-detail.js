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

document.addEventListener("DOMContentLoaded", loadDetail);

async function loadDetail() {
  const params = new URLSearchParams(window.location.search);
  const slug = params.get("slug");

  if (!slug) {
    showError();
    return;
  }

  try {
    const localPost = EXTRA_PROMO_POSTS.find(post => post.slug === slug);

    if (localPost) {
      renderPost(localPost);
      return;
    }

    if (typeof getBlogBySlug !== "function") {
      showError();
      return;
    }

    const res = await getBlogBySlug(slug);

    if (!res?.success || !res.data) {
      showError();
      return;
    }

    renderPost(res.data);
  } catch (error) {
    console.error("Gagal memuat detail blog:", error);
    showError();
  }
}

function renderPost(post) {
  document.title = `${post.title || "Artikel"} | Toserba Pak Yanto`;

  const img = document.getElementById("blog-thumbnail");
  const title = document.getElementById("blog-title");
  const date = document.getElementById("blog-date");
  const excerpt = document.getElementById("blog-excerpt");
  const body = document.getElementById("blog-body");
  const badge = document.getElementById("blog-badge");

  if (img) {
    img.src = resolveBlogImage(post);
    img.alt = post.title || "Artikel";
    img.classList.remove("d-none");
    img.onerror = function () {
      this.onerror = null;
      this.src = getFallbackBlogPoster(post);
    };
  }

  if (title) {
    title.textContent = post.title || "Artikel";
  }

  if (date) {
    date.innerHTML = `<i class="bi bi-calendar3"></i> ${escapeHtml(getSafeDate(post.created_at))}`;
  }

  if (badge) {
    badge.innerHTML = `<i class="bi bi-journal-text"></i> Promo & Artikel Pilihan`;
  }

  if (excerpt) {
    excerpt.textContent = buildExcerpt(post);
  }

  if (body) {
    body.innerHTML = formatBlogContent(post.content);
  }

  document.getElementById("blog-loading")?.classList.add("d-none");
  document.getElementById("blog-error")?.classList.add("d-none");
  document.getElementById("blog-content")?.classList.remove("d-none");
}

function showError() {
  document.getElementById("blog-loading")?.classList.add("d-none");
  document.getElementById("blog-content")?.classList.add("d-none");
  document.getElementById("blog-error")?.classList.remove("d-none");
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
    return "https://images.unsplash.com/photo-1586201375761-83865001e31c?q=80&w=1400&auto=format&fit=crop";
  }

  if (text.includes("promo") || text.includes("diskon") || text.includes("murah")) {
    return "https://images.unsplash.com/photo-1488459716781-31db52582fe9?q=80&w=1400&auto=format&fit=crop";
  }

  if (text.includes("tips") || text.includes("belanja")) {
    return "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1400&auto=format&fit=crop";
  }

  return "https://via.placeholder.com/1400x800?text=Promo+Toserba";
}

function buildExcerpt(post = {}) {
  const raw = stripHtml(post.content || "").trim();

  if (!raw) {
    return "Temukan informasi promo, penawaran menarik, dan tips belanja harian terbaik dari Toserba Pak Yanto.";
  }

  return raw.length > 180 ? raw.slice(0, 180) + "..." : raw;
}

function formatBlogContent(content) {
  const clean = String(content || "").trim();

  if (!clean) {
    return `<p>Konten artikel belum tersedia.</p>`;
  }

  const looksLikeHtml = /<\/?[a-z][\s\S]*>/i.test(clean);

  if (looksLikeHtml) {
    return clean;
  }

  const paragraphs = clean
    .split(/\n\s*\n/)
    .map(p => p.trim())
    .filter(Boolean);

  if (!paragraphs.length) {
    return `<p>${escapeHtml(clean)}</p>`;
  }

  return paragraphs
    .map(paragraph => `<p>${escapeHtml(paragraph)}</p>`)
    .join("");
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