const express = require('express');
const router = express.Router();

// Data Penyimpanan Sementara Testimoni Toko Pak Yanto
let dummyTestimonials = [
  {
    id: "testi-1",
    name: "Budi Santoso",
    review: "Belanja di Toko Pak Yanto pelayanannya ramah banget, berasnya juga selalu pulen dan bersih. Sukses terus Pak!",
    status: "Approved", // Sudah disetujui
    createdAt: new Date().toISOString()
  },
  {
    id: "testi-2",
    name: "Agus Kopling",
    review: "Minyak gorengnya murah, tapi kemarin pas antre kasir agak panjang aja. Tapi gapapa tetep langganan di sini.",
    status: "Pending", // Menunggu moderasi admin
    createdAt: new Date().toISOString()
  }
];

// 1. [GET] http://localhost:5000/api/testimonials (Untuk Publik/Landing Page - Hanya yang Approved)
router.get('/', (req, res) => {
  const approvedOnly = dummyTestimonials.filter(t => t.status === 'Approved');
  res.status(200).json({
    success: true,
    data: approvedOnly
  });
});

// 2. [GET] http://localhost:5000/api/testimonials/all (Untuk Tabel Admin - Semua Status)
router.get('/all', (req, res) => {
  res.status(200).json({
    success: true,
    message: "Berhasil mengambil semua data testimoni",
    data: dummyTestimonials
  });
});

// 3. [PUT] http://localhost:5000/api/testimonials/:id/approve (Menyetujui Testimoni)
router.put('/:id/approve', (req, res) => {
  const { id } = req.params;
  const testimonial = dummyTestimonials.find(t => t.id === id);

  if (!testimonial) {
    return res.status(404).json({ success: false, message: "Testimoni tidak ditemukan." });
  }

  testimonial.status = 'Approved';
  res.status(200).json({
    success: true,
    message: `Testimoni dari ${testimonial.name} berhasil disetujui!`,
    data: testimonial
  });
});

// 4. [PUT] http://localhost:5000/api/testimonials/:id/reject (Menolak/Menyembunyikan Testimoni)
router.put('/:id/reject', (req, res) => {
  const { id } = req.params;
  const testimonial = dummyTestimonials.find(t => t.id === id);

  if (!testimonial) {
    return res.status(404).json({ success: false, message: "Testimoni tidak ditemukan." });
  }

  testimonial.status = 'Rejected';
  res.status(200).json({
    success: true,
    message: `Testimoni dari ${testimonial.name} telah ditolak.`,
    data: testimonial
  });
});

module.exports = router;