const db = require('../config/db');
const slugify = require('slugify');

// GET /api/categories
const getAllCategories = async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM categories ORDER BY created_at DESC');
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET /api/categories/:id
const getCategoryById = async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM categories WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'Kategori tidak ditemukan' });
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// POST /api/categories
const createCategory = async (req, res) => {
  const { name, icon } = req.body;
  if (!name) return res.status(400).json({ success: false, message: 'Nama kategori wajib diisi' });

  const slug = slugify(name, { lower: true, strict: true });

  try {
    const [result] = await db.execute(
      'INSERT INTO categories (name, slug, icon) VALUES (?, ?, ?)',
      [name, slug, icon || null]
    );
    res.status(201).json({ success: true, message: 'Kategori berhasil dibuat', id: result.insertId });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ success: false, message: 'Nama kategori sudah ada' });
    }
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// PUT /api/categories/:id
const updateCategory = async (req, res) => {
  const { name, icon } = req.body;
  if (!name) return res.status(400).json({ success: false, message: 'Nama kategori wajib diisi' });

  const slug = slugify(name, { lower: true, strict: true });

  try {
    const [result] = await db.execute(
      'UPDATE categories SET name = ?, slug = ?, icon = ? WHERE id = ?',
      [name, slug, icon || null, req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'Kategori tidak ditemukan' });
    res.json({ success: true, message: 'Kategori berhasil diupdate' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// DELETE /api/categories/:id
const deleteCategory = async (req, res) => {
  try {
    const [result] = await db.execute('DELETE FROM categories WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'Kategori tidak ditemukan' });
    res.json({ success: true, message: 'Kategori berhasil dihapus' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { getAllCategories, getCategoryById, createCategory, updateCategory, deleteCategory };