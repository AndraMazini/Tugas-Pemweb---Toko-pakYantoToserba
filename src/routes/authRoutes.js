const express = require('express');
const router = express.Router();
// PERBAIKAN: Menambahkan getUsers dan deleteUser ke dalam import controller
const { login, register, getMe, registerAdmin, getUsers, deleteUser } = require('../controllers/authController');
const { protect, adminOnly, superadminOnly } = require('../middleware/authMiddleware');

// ─── AUTH ENDPOINTS ──────────────────────────────────────────

// 1. [POST] http://localhost:5000/api/auth/login (Login User/Admin)
router.post('/login', login);

// 2. [POST] http://localhost:5000/api/auth/register (Register User Baru)
router.post('/register', register);

// 3. [GET] http://localhost:5000/api/auth/me (Ambil Info User Terlogin - Butuh Token)
router.get('/me', protect, getMe);

// 4. [POST] http://localhost:5000/api/auth/register-admin (Register Admin Baru - Hanya Superadmin)
router.post('/register-admin', protect, superadminOnly, registerAdmin);

// TAMBAHAN BARU: Mengambil semua daftar user/staf pengelola (Hanya Superadmin)
router.get('/users', protect, superadminOnly, getUsers);

// TAMBAHAN BARU: Menghapus/Pecat akun staf pengelola (Hanya Superadmin)
router.delete('/users/:id', protect, superadminOnly, deleteUser);

module.exports = router;