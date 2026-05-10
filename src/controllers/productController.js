const db = require('../config/db');
const slugify = require('slugify');
const fs = require('fs');
const path = require('path');

// GET /api/products?category=&featured=&page=&limit=
const getAllProducts = async (req, res) => {
  try {
    const { category, featured, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT p.*, c.name as category_name, c.slug as category_slug
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE 1=1
    `;
    const params = [];

    if (category) {
      query += ' AND c.slug = ?';
      params.push(category);
    }
    if (featured === 'true') {
      query += ' AND p.is_featured = true';
    }

    query += ` ORDER BY p.created_at DESC LIMIT ${Number(limit)} OFFSET ${Number(offset)}`;

    const [rows] = await db.execute(query, params);

    // Count total
    let countQuery = `
      SELECT COUNT(*) as total FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE 1=1
    `;
    const countParams = [];
    if (category) { countQuery += ' AND c.slug = ?'; countParams.push(category); }
    if (featured === 'true') { countQuery += ' AND p.is_featured = true'; }

    const [countRows] = await db.execute(countQuery, countParams);
    const total = countRows[0].total;

    res.json({
      success: true,
      data: rows,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET /api/products/:id
const getProductById = async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT p.*, c.name as category_name FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.id = ?`,
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'Produk tidak ditemukan' });
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// POST /api/products
const createProduct = async (req, res) => {
  const { name, description, price_range, category_id, is_featured, badge } = req.body;
  if (!name) return res.status(400).json({ success: false, message: 'Nama produk wajib diisi' });

  const slug = slugify(name, { lower: true, strict: true });
  const image_url = req.file ? `/uploads/${req.file.filename}` : null;

  try {
    const [result] = await db.execute(
      `INSERT INTO products (name, slug, description, price_range, category_id, is_featured, badge, image_url)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, slug, description || null, price_range || null,
       category_id || null, is_featured === 'true' ? 1 : 0,
       badge || null, image_url]
    );
    res.status(201).json({ success: true, message: 'Produk berhasil dibuat', id: result.insertId });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ success: false, message: 'Nama produk sudah ada' });
    }
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// PUT /api/products/:id
const updateProduct = async (req, res) => {
  const { name, description, price_range, category_id, is_featured, badge } = req.body;
  if (!name) return res.status(400).json({ success: false, message: 'Nama produk wajib diisi' });

  try {
    // Cek produk ada
    const [existing] = await db.execute('SELECT * FROM products WHERE id = ?', [req.params.id]);
    if (existing.length === 0) return res.status(404).json({ success: false, message: 'Produk tidak ditemukan' });

    const slug = slugify(name, { lower: true, strict: true });
    let image_url = existing[0].image_url;

    // Kalau ada upload baru, hapus gambar lama
    if (req.file) {
      if (image_url) {
        const oldPath = path.join(__dirname, '../../', image_url);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      image_url = `/uploads/${req.file.filename}`;
    }

    await db.execute(
      `UPDATE products SET name=?, slug=?, description=?, price_range=?,
       category_id=?, is_featured=?, badge=?, image_url=? WHERE id=?`,
      [name, slug, description || null, price_range || null,
       category_id || null, is_featured === 'true' ? 1 : 0,
       badge || null, image_url, req.params.id]
    );

    res.json({ success: true, message: 'Produk berhasil diupdate' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// DELETE /api/products/:id
const deleteProduct = async (req, res) => {
  try {
    const [existing] = await db.execute('SELECT * FROM products WHERE id = ?', [req.params.id]);
    if (existing.length === 0) return res.status(404).json({ success: false, message: 'Produk tidak ditemukan' });

    // Hapus gambar juga
    if (existing[0].image_url) {
      const imgPath = path.join(__dirname, '../../', existing[0].image_url);
      if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
    }

    await db.execute('DELETE FROM products WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Produk berhasil dihapus' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { getAllProducts, getProductById, createProduct, updateProduct, deleteProduct };