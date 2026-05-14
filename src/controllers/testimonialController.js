const db = require('../config/db');

// GET /api/testimonials (publik — hanya yang approved)
const getAllTestimonials = async (req, res) => {
  try {
    const [rows] = await db.execute(
      'SELECT * FROM testimonials WHERE is_approved = true ORDER BY created_at DESC'
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET /api/testimonials/all (admin — semua testimoni)
const getAllTestimonialsAdmin = async (req, res) => {
  try {
    const [rows] = await db.execute(
      'SELECT * FROM testimonials ORDER BY created_at DESC'
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// POST /api/testimonials (publik — kirim testimoni)
const createTestimonial = async (req, res) => {
  const { name, message, rating } = req.body;

  if (!name || !message) {
    return res.status(400).json({ success: false, message: 'Nama dan pesan wajib diisi' });
  }
  if (rating && (rating < 1 || rating > 5)) {
    return res.status(400).json({ success: false, message: 'Rating harus antara 1 sampai 5' });
  }

  try {
    const [result] = await db.execute(
      'INSERT INTO testimonials (name, message, rating) VALUES (?, ?, ?)',
      [name, message, rating || 5]
    );
    res.status(201).json({
      success: true,
      message: 'Testimoni berhasil dikirim, menunggu persetujuan admin',
      id: result.insertId
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// PUT /api/testimonials/:id/approve (admin)
const approveTestimonial = async (req, res) => {
  try {
    const [existing] = await db.execute('SELECT * FROM testimonials WHERE id = ?', [req.params.id]);
    if (existing.length === 0) return res.status(404).json({ success: false, message: 'Testimoni tidak ditemukan' });

    await db.execute('UPDATE testimonials SET is_approved = true WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Testimoni berhasil disetujui' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// PUT /api/testimonials/:id/reject (admin)
const rejectTestimonial = async (req, res) => {
  try {
    const [existing] = await db.execute('SELECT * FROM testimonials WHERE id = ?', [req.params.id]);
    if (existing.length === 0) return res.status(404).json({ success: false, message: 'Testimoni tidak ditemukan' });

    await db.execute('DELETE FROM testimonials WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Testimoni berhasil ditolak dan dihapus' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { getAllTestimonials, getAllTestimonialsAdmin, createTestimonial, approveTestimonial, rejectTestimonial };