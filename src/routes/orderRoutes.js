const express = require('express');
const router = express.Router();

// Data Penyimpanan Sementara Pesanan Toko Pak Yanto
let dummyOrders = [
  {
    id: "ORD-1024",
    customer_name: "Yudi Goblok",
    items: "Beras Pandan Wangi (2kg), Minyak Goreng Bimoli (1L)",
    total_price: 68000,
    status: "Pending",
    createdAt: new Date().toISOString()
  },
  {
    id: "ORD-1025",
    customer_name: "Siti Rahma",
    items: "Mie Instan Goreng (5 pcs), Susu Kental Manis (1 kaleng)",
    total_price: 32500,
    status: "Selesai",
    createdAt: new Date().toISOString()
  }
];

// 1. [GET] http://localhost:5000/api/orders (Mengambil Semua Pesanan Masuk)
router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: "Berhasil mengambil database pesanan",
    data: dummyOrders
  });
});

// 2. [PUT] http://localhost:5000/api/orders/:id/status (Mengubah Status Pesanan)
router.put('/:id/status', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const order = dummyOrders.find(o => o.id === id);

  if (!order) {
    return res.status(404).json({
      success: false,
      message: "Data pesanan tidak ditemukan."
    });
  }

  // Validasi status pilihan
  if (!['Pending', 'Diproses', 'Selesai', 'Dibatalkan'].includes(status)) {
    return res.status(400).json({
      success: false,
      message: "Status tidak valid."
    });
  }

  order.status = status;

  res.status(200).json({
    success: true,
    message: `Status Pesanan ${id} berhasil diperbarui menjadi: ${status}`,
    data: order
  });
});

module.exports = router;