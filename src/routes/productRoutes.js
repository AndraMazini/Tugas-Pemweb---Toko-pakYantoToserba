const express = require('express');
const router = express.Router();
const db = require('../config/db');

// [GET] /api/products
router.get('/', async (req, res) => {
  try {
    const { category = '', limit = 10 } = req.query;

    let sql = `
      SELECT
        p.id,
        p.name,
        p.slug,
        p.description,
        p.price_range,
        p.image_url,
        p.is_featured,
        p.badge,
        p.category_id,
        p.created_at,
        c.name AS category_name,
        c.slug AS category_slug
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
    `;

    const params = [];

    if (category) {
      sql += ` WHERE c.slug = ? `;
      params.push(category);
    }

    sql += ` ORDER BY p.id DESC LIMIT ? `;
    params.push(Number(limit));

    const [rows] = await db.query(sql, params);

    res.status(200).json({
      success: true,
      message: 'Berhasil mengambil daftar produk',
      data: rows,
      pagination: {
        currentPage: 1,
        pageSize: Number(limit),
        totalItems: rows.length,
        totalPages: 1
      }
    });
  } catch (error) {
    console.error('GET /api/products error:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil data produk',
      error: error.message
    });
  }
});

// [GET] /api/products/:id
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const sql = `
      SELECT
        p.id,
        p.name,
        p.slug,
        p.description,
        p.price_range,
        p.image_url,
        p.is_featured,
        p.badge,
        p.category_id,
        p.created_at,
        c.name AS category_name,
        c.slug AS category_slug
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.id = ?
      LIMIT 1
    `;

    const [rows] = await db.query(sql, [id]);

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Produk tidak ditemukan'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Berhasil mengambil detail produk',
      data: rows[0]
    });
  } catch (error) {
    console.error('GET /api/products/:id error:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil detail produk',
      error: error.message
    });
  }
});

// [POST] /api/products
router.post('/', async (req, res) => {
  try {
    const {
      category_id,
      name,
      slug,
      description,
      price_range,
      image_url,
      is_featured = false,
      badge = null
    } = req.body;

    const sql = `
      INSERT INTO products
      (category_id, name, slug, description, price_range, image_url, is_featured, badge)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await db.query(sql, [
      category_id,
      name,
      slug,
      description,
      price_range,
      image_url,
      is_featured ? 1 : 0,
      badge
    ]);

    res.status(201).json({
      success: true,
      message: 'Produk berhasil ditambahkan',
      data: {
        id: result.insertId
      }
    });
  } catch (error) {
    console.error('POST /api/products error:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal menambahkan produk',
      error: error.message
    });
  }
});

// [PUT] /api/products/:id
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      category_id,
      name,
      slug,
      description,
      price_range,
      image_url,
      is_featured = false,
      badge = null
    } = req.body;

    const sql = `
      UPDATE products
      SET
        category_id = ?,
        name = ?,
        slug = ?,
        description = ?,
        price_range = ?,
        image_url = ?,
        is_featured = ?,
        badge = ?
      WHERE id = ?
    `;

    const [result] = await db.query(sql, [
      category_id,
      name,
      slug,
      description,
      price_range,
      image_url,
      is_featured ? 1 : 0,
      badge,
      id
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Produk tidak ditemukan'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Produk berhasil diperbarui'
    });
  } catch (error) {
    console.error('PUT /api/products/:id error:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal memperbarui produk',
      error: error.message
    });
  }
});

// [DELETE] /api/products/:id
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await db.query('DELETE FROM products WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Produk tidak ditemukan'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Produk berhasil dihapus'
    });
  } catch (error) {
    console.error('DELETE /api/products/:id error:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal menghapus produk',
      error: error.message
    });
  }
});

module.exports = router;