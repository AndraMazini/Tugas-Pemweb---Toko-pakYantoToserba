const express = require('express');
const router = express.Router();

// Data Penyimpanan Sementara Galeri Toko Pak Yanto
let dummyGallery = [
  { 
    id: "gal-1", 
    image_url: "https://images.unsplash.com/photo-1604719312566-8912e9227c6a?q=80&w=600", 
    title: "Tampak Depan Toko Pak Yanto" 
  },
  { 
    id: "gal-2", 
    image_url: "https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=600", 
    title: "Rak Sembako Segar & Rapi" 
  }
];

// 1. [GET] http://localhost:5000/api/gallery
// Mengambil semua foto untuk ditampilkan ke grid card admin
router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: "Berhasil mengambil data galeri",
    data: dummyGallery
  });
});

// 2. [POST] http://localhost:5000/api/gallery
// Memproses input URL foto baru dari admin panel
router.post('/', (req, res) => {
  const { title, image_url } = req.body;

  if (!title || !image_url) {
    return res.status(400).json({
      success: false,
      message: "Judul foto dan URL Gambar wajib diisi!"
    });
  }

  const newPhoto = {
    id: `gal-${Date.now()}`,
    title: title,
    image_url: image_url
  };

  dummyGallery.push(newPhoto);

  res.status(201).json({
    success: true,
    message: "Foto baru berhasil dipajang di galeri toko!",
    data: newPhoto
  });
});

// 3. [DELETE] http://localhost:5000/api/gallery/:id
// Menghapus foto dari galeri berdasarkan ID
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  const initialLength = dummyGallery.length;
  
  dummyGallery = dummyGallery.filter(item => item.id !== id);

  if (dummyGallery.length === initialLength) {
    return res.status(404).json({
      success: false,
      message: "Foto tidak ditemukan."
    });
  }

  res.status(200).json({
    success: true,
    message: "Foto berhasil diturunkan dari galeri."
  });
});

module.exports = router;