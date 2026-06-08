const express = require('express');
const router = express.Router();

// Data Penyimpanan Sementara Artikel Blog Toko Pak Yanto
let dummyBlogs = [
  {
    id: "blog-1",
    title: "Tips Memilih Beras Pandan Wangi Asli",
    slug: "tips-memilih-beras-pandan-wangi-asli",
    content: "Beras Pandan Wangi asli memiliki ciri khas aroma pandan yang alami saat dimasak. Bentuk bulirnya cenderung bulat, bukan panjang, dan warnanya sedikit bening kekuningan, bukan putih bersih hasil pemutih kimia. Pilih beras dengan aroma khas, tekstur bulir yang utuh, dan simpan di tempat kering agar kualitasnya tetap terjaga.",
    thumbnail_url: "https://images.unsplash.com/photo-1586201375761-83865001e31c?q=80&w=1400&auto=format&fit=crop",
    created_at: "2026-06-20T09:00:00.000Z"
  },
  {
    id: "blog-2",
    title: "Promo Sembako Murah Jelang Akhir Bulan",
    slug: "promo-sembako-murah-jelang-akhir-bulan",
    content: "Jangan khawatir dompet menipis. Toko Pak Yanto mengadakan promo diskon hingga 20% untuk minyak goreng, mi instan, dan gula pasir khusus di pekan terakhir bulan ini. Yuk manfaatkan promo kebutuhan harian ini sebelum stok habis.",
    thumbnail_url: "https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=1400&auto=format&fit=crop",
    created_at: "2026-06-21T09:00:00.000Z"
  },
  {
    id: "blog-3",
    title: "Produk Perawatan Baru Hadir dengan Ukuran Pilihan",
    slug: "produk-perawatan-baru-hadir-dengan-ukuran-pilihan",
    content: "Toserba Pak Yanto menghadirkan produk perawatan baru dengan tampilan elegan dan kualitas pilihan untuk kebutuhan harian Anda. Produk ini hadir dengan beberapa ukuran praktis yang dapat disesuaikan dengan kebutuhan penggunaan di rumah maupun saat bepergian. Dengan desain kemasan yang modern dan sederhana, produk ini tidak hanya menarik secara visual, tetapi juga memberikan kesan bersih, premium, dan terpercaya. Pilihan ukuran tersedia 15 ml, 25 ml, dan 40 ml. Dapatkan produk terbaru ini sekarang juga dan lengkapi kebutuhan perawatan Anda dengan pilihan yang lebih praktis, modern, dan berkualitas.",
    thumbnail_url: "assets/blog/new-product.png",
    created_at: "2026-06-24T09:00:00.000Z"
  },
  {
    id: "blog-4",
    title: "Promo Friday Sale Peralatan & Material Pilihan",
    slug: "promo-friday-sale-peralatan-dan-material-pilihan",
    content: "Nikmati promo spesial Friday Sale dari Toserba Pak Yanto untuk berbagai peralatan dan material pilihan. Promo ini cocok untuk Anda yang sedang menyiapkan kebutuhan rumah, perlengkapan kerja, maupun kebutuhan proyek ringan dengan harga yang lebih hemat. Kami menghadirkan penawaran menarik untuk produk pilihan yang mendukung aktivitas rumah tangga dan kebutuhan praktis sehari-hari. Promo utama berlaku dengan diskon hingga 50% OFF selama stok masih tersedia.",
    thumbnail_url: "assets/blog/promo-friday-sale.png",
    created_at: "2026-06-25T09:00:00.000Z"
  },
  {
    id: "blog-5",
    title: "Promo Furnitur Minimalis Diskon 40%",
    slug: "promo-furnitur-minimalis-diskon-40-persen",
    content: "Hadirkan suasana rumah yang lebih nyaman dan modern dengan promo spesial furnitur minimalis dari Toserba Pak Yanto. Kami menyediakan pilihan furnitur dengan desain bersih, sederhana, dan elegan yang cocok untuk berbagai konsep hunian masa kini. Promo ini sangat cocok bagi Anda yang sedang memperbarui tampilan ruang tamu atau mencari furnitur baru yang tetap fungsional namun terlihat modern. Dapatkan diskon hingga 40% OFF selama periode promo berlangsung dan stok masih tersedia.",
    thumbnail_url: "assets/blog/new-minimalist-furniture.png",
    created_at: "2026-06-26T09:00:00.000Z"
  }
];

// 1. [GET] http://localhost:5000/api/blog (Untuk Landing Page - Publik)
router.get('/', (req, res) => {
  const sortedBlogs = [...dummyBlogs].sort(
    (a, b) => new Date(b.created_at) - new Date(a.created_at)
  );

  res.status(200).json({
    success: true,
    message: "Berhasil mengambil artikel blog publik",
    data: sortedBlogs
  });
});

// 2. [GET] http://localhost:5000/api/blog/all (Untuk Kebutuhan Tabel Admin)
router.get('/all', (req, res) => {
  const sortedBlogs = [...dummyBlogs].sort(
    (a, b) => new Date(b.created_at) - new Date(a.created_at)
  );

  res.status(200).json({
    success: true,
    message: "Berhasil mengambil semua database artikel blog",
    data: sortedBlogs
  });
});

// 3. [GET] http://localhost:5000/api/blog/:slug (Melihat Detail Artikel)
router.get('/:slug', (req, res) => {
  const { slug } = req.params;
  const article = dummyBlogs.find(b => b.slug === slug);

  if (!article) {
    return res.status(404).json({
      success: false,
      message: "Artikel tidak ditemukan."
    });
  }

  res.status(200).json({
    success: true,
    data: article
  });
});

// 4. [POST] http://localhost:5000/api/blog (Membuat Artikel Baru)
router.post('/', (req, res) => {
  const { title, content, thumbnail_url } = req.body;

  if (!title || !content) {
    return res.status(400).json({
      success: false,
      message: "Judul dan isi konten artikel tidak boleh kosong!"
    });
  }

  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');

  const newArticle = {
    id: `blog-${Date.now()}`,
    title,
    slug,
    content,
    thumbnail_url: thumbnail_url || "",
    created_at: new Date().toISOString()
  };

  dummyBlogs.push(newArticle);

  res.status(201).json({
    success: true,
    message: "Artikel blog baru berhasil diterbitkan!",
    data: newArticle
  });
});

// 5. [DELETE] http://localhost:5000/api/blog/:id (Menghapus Artikel)
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  const initialLength = dummyBlogs.length;

  dummyBlogs = dummyBlogs.filter(b => b.id !== id);

  if (dummyBlogs.length === initialLength) {
    return res.status(404).json({
      success: false,
      message: "Artikel tidak ditemukan."
    });
  }

  res.status(200).json({
    success: true,
    message: "Artikel blog berhasil dihapus."
  });
});

module.exports = router;