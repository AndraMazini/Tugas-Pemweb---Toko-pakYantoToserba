const db = require('../config/db');
const fs = require('fs');
const path = require('path');

// GET /api/gallery
const getAllGallery = async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM gallery ORDER BY created_at DESC');
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// POST /api/gallery
const createGallery = async (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: 'Gambar wajib diupload' });

  const { caption } = req.body;
  const image_url = `/uploads/${req.file.filename}`;

  try {
    const [result] = await db.execute(
      'INSERT INTO gallery (image_url, caption) VALUES (?, ?)',
      [image_url, caption || null]
    );
    res.status(201).json({ success: true, message: 'Foto berhasil diupload', id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// DELETE /api/gallery/:id
const deleteGallery = async (req, res) => {
  try {
    const [existing] = await db.execute('SELECT * FROM gallery WHERE id = ?', [req.params.id]);
    if (existing.length === 0) return res.status(404).json({ success: false, message: 'Foto tidak ditemukan' });

    // Hapus file gambar
    const imgPath = path.join(__dirname, '../../', existing[0].image_url);
    if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);

    await db.execute('DELETE FROM gallery WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Foto berhasil dihapus' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { getAllGallery, createGallery, deleteGallery };