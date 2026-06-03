const express = require('express');
const router = express.Router();

// Data Penyimpanan Sementara (Stateful Dummy) agar data yang kamu tambah bisa langsung muncul di tabel
let dummyCategories = [
  { id: 1, name: "Sembako" },
  { id: 2, name: "Minuman" },
  { id: 4, name: "Rumah Tangga" },
  { id: 5, name: "Mainan" }
];

// 1. [GET] http://localhost:3000/api/categories
// Rute untuk memuat semua kategori ke tabel & dropdown produk
router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: "Berhasil mengambil daftar kategori",
    data: dummyCategories
  });
});

// 2. [POST] http://localhost:3000/api/categories
// Rute untuk memproses input dari tombol "Simpan Kategori"
router.post('/', (req, res) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({
      success: false,
      message: "Nama kategori tidak boleh kosong!"
    });
  }

  // Membuat ID tiruan baru
  const newCategory = {
  id: Date.now(),
  name: name
  };

  // Masukkan ke array dummy agar tabel di frontend otomatis bertambah saat direfresh
  dummyCategories.push(newCategory);

  res.status(201).json({
    success: true,
    message: `Kategori "${name}" berhasil didaftarkan ke sistem!`,
    data: newCategory
  });
});

// 3. [DELETE] http://localhost:5000/api/categories/:id
// Rute untuk memproses aksi klik tombol "Hapus" kategori
router.delete('/:id', (req, res) => {
  const { id } = req.params;

  // Filter out data yang dihapus dari array dummy
  const initialLength = dummyCategories.length;
  dummyCategories = dummyCategories.filter(cat => cat.id !== id);

  if (dummyCategories.length === initialLength) {
    return res.status(404).json({
      success: false,
      message: "Kategori tidak ditemukan atau gagal dihapus."
    });
  }

  res.status(200).json({
    success: true,
    message: "Kategori sukses dihapus dari sistem dummy."
  });
});

module.exports = router;