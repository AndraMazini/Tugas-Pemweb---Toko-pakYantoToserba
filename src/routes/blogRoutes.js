const express = require('express');
const router = express.Router();

// Data Penyimpanan Sementara Artikel Blog Toko Pak Yanto
let dummyBlogs = [
  {
    id: "blog-1",
    title: "Tips Memilih Beras Pandan Wangi Asli",
    slug: "tips-memilih-beras-pandan-wangi-asli",
    content: "Beras Pandan Wangi asli memiliki ciri khas aroma pandan yang alami saat dimasak. Bentuk bulirnya cenderung bulat, bukan panjang, dan warnanya sedikit bening kekuningan, bukan putih bersih hasil pemutih kimia...",
    createdAt: new Date().toISOString()
  },
  {
    id: "blog-2",
    title: "Promo Sembako Murah Jelang Akhir Bulan",
    slug: "promo-sembako-murah-jelang-akhir-bulan",
    content: "Jangan khawatir dompet menipis! Toko Pak Yanto mengadakan promo diskon hingga 20% untuk minyak goreng, mi instan, dan gula pasir khusus di pekan terakhir bulan ini. Yuk serbu sebelum kehabisan!",
    createdAt: new Date().toISOString()
  }
];

// 1. [GET] http://localhost:5000/api/blog (Untuk Landing Page - Publik)
router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: "Berhasil mengambil artikel blog publik",
    data: dummyBlogs
  });
});

// 2. [GET] http://localhost:5000/api/blog/all (Untuk Kebutuhan Tabel Admin)
router.get('/all', (req, res) => {
  res.status(200).json({
    success: true,
    message: "Berhasil mengambil semua database artikel blog",
    data: dummyBlogs
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
  const { title, content } = req.body;

  if (!title || !content) {
    return res.status(400).json({
      success: false,
      message: "Judul dan isi konten artikel tidak boleh kosong!"
    });
  }

  // Otomatis bikin slug sederhana dari judul (Huruf kecil, spasi diganti strip)
  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

  const newArticle = {
    id: `blog-${Date.now()}`,
    title: title,
    slug: slug,
    content: content,
    createdAt: new Date().toISOString()
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