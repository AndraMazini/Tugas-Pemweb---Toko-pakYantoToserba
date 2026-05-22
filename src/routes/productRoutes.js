const express = require('express');
const router = express.Router();

// Data Dummy Produk agar Frontend bisa menampilkan data sementara
const dummyProducts = [
  {
    id: "prod-1",
    name: "Beras Pandan Wangi Super 5kg",
    price: 78000,
    stock: 25,
    category_name: "Sembako",
    category_id: "cat-1",
    image_url: "https://images.unsplash.com/photo-1586201375761-83865001e31c?q=80&w=200&auto=format&fit=crop",
    description: "Beras pilihan keluarga Pak Yanto, pulen murni tanpa pemutih buatan."
  },
  {
    id: "prod-2",
    name: "Minyak Goreng Bimoli 2 Liter",
    price: 36500,
    stock: 4,
    category_name: "Kebutuhan Dapur",
    category_id: "cat-2",
    image_url: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?q=80&w=200&auto=format&fit=crop",
    description: "Minyak goreng kelapa sawit berkualitas tinggi, panasnya merata."
  },
  {
    id: "prod-3",
    name: "Indomie Goreng Spesial (Per Dus)",
    price: 112000,
    stock: 15,
    category_name: "Makanan Instan",
    category_id: "cat-3",
    image_url: "https://images.unsplash.com/photo-1612927601601-6638404737ce?q=80&w=200&auto=format&fit=crop",
    description: "Satu dus isi 40 pcs. Stok wajib untuk anak kos dan rumahtangga."
  }
];

// [GET] http://localhost:3000/api/products
// Rute untuk mengambil semua data produk ke tabel frontend
router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: "Berhasil mengambil data produk dummy",
    data: dummyProducts
  });
});

// [POST] http://localhost:3000/api/products
// Rute penampung ketika tombol "Simpan Barang" di modal diklik
router.post('/', (req, res) => {
  const { name, price, stock, category_id, image_url, description } = req.body;
  
  // Simulasi sukses menyimpan data ke database
  res.status(201).json({
    success: true,
    message: `Produk "${name}" berhasil didaftarkan ke sistem database!`
  });
});

// [DELETE] http://localhost:3000/api/products/:id
// Rute penampung ketika tombol "Hapus" diklik
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  
  res.status(200).json({
    success: true,
    message: `Produk dengan ID ${id} berhasil dihapus dari sistem.`
  });
});

module.exports = router;