const express = require('express');
const router = express.Router();

// Data Penyimpanan Sementara Akun Admin Toko Pak Yanto
let dummyAdmins = [
  {
    id: "adm-1",
    name: "Pak Yanto",
    email: "yanto@tokopakyanto.com",
    role: "superadmin",
    createdAt: new Date().toISOString()
  },
  {
    id: "adm-2",
    name: "Agus Pratama",
    email: "agus@tokopakyanto.com",
    role: "admin",
    createdAt: new Date().toISOString()
  }
];

// 1. [GET] http://localhost:5000/api/auth/users (Mengambil Semua Daftar Admin)
router.get('/users', (req, res) => {
  res.status(200).json({
    success: true,
    message: "Berhasil mengambil daftar akun admin",
    data: dummyAdmins
  });
});

// 2. [POST] http://localhost:5000/api/auth/register (Mendaftarkan Admin Baru)
router.post('/register', (req, res) => {
  const { name, email, role } = req.body;

  if (!name || !email || !role) {
    return res.status(400).json({ success: false, message: "Semua data wajib diisi!" });
  }

  const newAdmin = {
    id: `adm-${Date.now()}`,
    name,
    email,
    role,
    createdAt: new Date().toISOString()
  };

  dummyAdmins.push(newAdmin);

  res.status(201).json({
    success: true,
    message: "Akun staf baru berhasil didaftarkan!",
    data: newAdmin
  });
});

// 3. [DELETE] http://localhost:5000/api/auth/users/:id (Menghapus Akun Admin)
router.delete('/users/:id', (req, res) => {
  const { id } = req.params;
  
  // Proteksi: Jangan biarkan admin utama (Pak Yanto) terhapus secara tidak sengaja
  if (id === "adm-1") {
    return res.status(400).json({ success: false, message: "Akun utama pemilik toko tidak dapat dihapus!" });
  }

  dummyAdmins = dummyAdmins.filter(u => u.id !== id);

  res.status(200).json({
    success: true,
    message: "Akun staf berhasil dihapus dari sistem."
  });
});

module.exports = router;