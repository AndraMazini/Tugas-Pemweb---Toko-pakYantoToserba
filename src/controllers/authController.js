const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: '1d' }
  );
};

// POST /api/auth/register (Register User Baru)
const register = async (req, res) => {
  const { name, email, password } = req.body;
  
  console.log('📝 Register attempt:', { name, email }); // Debug log
  
  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: 'Semua field wajib diisi' });
  }
  try {
    const [existing] = await db.execute('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'Email sudah digunakan' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await db.execute(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name, email, hashedPassword, 'user']
    );

    console.log('✅ User registered:', { id: result.insertId, name, email }); // Debug log

    res.status(201).json({
      success: true,
      message: 'Registrasi berhasil',
      user: { id: result.insertId, name, email, role: 'user' }
    });
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    res.status(500).json({
      success: false,
      message: "Server error: " + err.message
    });
  }
}

// POST /api/auth/login (Login User/Admin)
const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email dan password wajib diisi' });
  }
  try {
    const [rows] = await db.execute('SELECT id, name, email, password, role FROM users WHERE email = ?', [email]);
    if (rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Email atau password salah' });
    }
    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Email atau password salah' });
    }

    const token = generateToken(user);
    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET /api/auth/me (Ambil Info User Terlogin)
const getMe = async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT id, name, email, role FROM users WHERE id = ?', [req.user.id]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User tidak ditemukan' });
    }
    res.json({ success: true, user: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// POST /api/auth/register-admin (Sesuai dengan kodingan aslimu)
const registerAdmin = async (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password || !role) {
    return res.status(400).json({ success: false, message: 'Semua field wajib diisi' });
  }
  try {
    const [existing] = await db.execute('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'Email sudah digunakan' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await db.execute(
      `INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)`,
      [name, email, hashedPassword, role]
    );
    res.status(201).json({
      success: true,
      message: `Berhasil menambahkan ${role} baru!`,
      user: { id: result.insertId, name, email, role }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─── TAMBAHAN BARU DI PALING BAWAH ────────────────────────────

// GET /api/auth/users (Mengambil data pengelola manajemen toko)
const getUsers = async (req, res) => {
  try {
    // Hanya ambil akun dengan role admin atau superadmin.
    const [rows] = await db.execute(
      "SELECT id, name, email, role FROM users WHERE role IN ('admin', 'superadmin')"
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// DELETE /api/auth/users/:id (Menghapus/Pecat pengelola)
const deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    await db.execute('DELETE FROM users WHERE id = ?', [id]);
    res.json({ success: true, message: 'Akun staf berhasil dihapus' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Pastikan getUsers dan deleteUser didaftarkan ke export module
module.exports = { register, login, getMe, registerAdmin, getUsers, deleteUser };