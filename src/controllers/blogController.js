const db = require('../config/db');
const slugify = require('slugify');
const fs = require('fs');
const path = require('path');

// GET /api/blog (publik — hanya yang published)
const getAllPosts = async (req, res) => {
  try {
    const { page = 1, limit = 6 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    const [rows] = await db.execute(
      `SELECT id, title, slug, thumbnail_url, is_published, created_at
       FROM blog_posts WHERE is_published = true
       ORDER BY created_at DESC
       LIMIT ${Number(limit)} OFFSET ${Number(offset)}`
    );

    const [countRows] = await db.execute(
      'SELECT COUNT(*) as total FROM blog_posts WHERE is_published = true'
    );
    const total = countRows[0].total;

    res.json({
      success: true,
      data: rows,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit))
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET /api/blog/all (admin — semua artikel)
const getAllPostsAdmin = async (req, res) => {
  try {
    const [rows] = await db.execute(
      'SELECT id, title, slug, thumbnail_url, is_published, created_at FROM blog_posts ORDER BY created_at DESC'
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET /api/blog/:slug (publik — detail artikel)
const getPostBySlug = async (req, res) => {
  try {
    const [rows] = await db.execute(
      'SELECT * FROM blog_posts WHERE slug = ? AND is_published = true',
      [req.params.slug]
    );
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'Artikel tidak ditemukan' });
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// POST /api/blog (admin)
const createPost = async (req, res) => {
  const { title, content, is_published } = req.body;
  if (!title) return res.status(400).json({ success: false, message: 'Judul artikel wajib diisi' });

  const slug = slugify(title, { lower: true, strict: true });
  const thumbnail_url = req.file ? `/uploads/${req.file.filename}` : null;

  try {
    const [result] = await db.execute(
      'INSERT INTO blog_posts (title, slug, content, thumbnail_url, is_published) VALUES (?, ?, ?, ?, ?)',
      [title, slug, content || null, thumbnail_url, is_published === 'true' ? 1 : 0]
    );
    res.status(201).json({ success: true, message: 'Artikel berhasil dibuat', id: result.insertId });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ success: false, message: 'Judul artikel sudah ada' });
    }
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// PUT /api/blog/:id (admin)
const updatePost = async (req, res) => {
  const { title, content, is_published } = req.body;
  if (!title) return res.status(400).json({ success: false, message: 'Judul artikel wajib diisi' });

  try {
    const [existing] = await db.execute('SELECT * FROM blog_posts WHERE id = ?', [req.params.id]);
    if (existing.length === 0) return res.status(404).json({ success: false, message: 'Artikel tidak ditemukan' });

    const slug = slugify(title, { lower: true, strict: true });
    let thumbnail_url = existing[0].thumbnail_url;

    if (req.file) {
      if (thumbnail_url) {
        const oldPath = path.join(__dirname, '../../', thumbnail_url);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      thumbnail_url = `/uploads/${req.file.filename}`;
    }

    await db.execute(
      'UPDATE blog_posts SET title=?, slug=?, content=?, thumbnail_url=?, is_published=? WHERE id=?',
      [title, slug, content || null, thumbnail_url, is_published === 'true' ? 1 : 0, req.params.id]
    );
    res.json({ success: true, message: 'Artikel berhasil diupdate' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// DELETE /api/blog/:id (admin)
const deletePost = async (req, res) => {
  try {
    const [existing] = await db.execute('SELECT * FROM blog_posts WHERE id = ?', [req.params.id]);
    if (existing.length === 0) return res.status(404).json({ success: false, message: 'Artikel tidak ditemukan' });

    if (existing[0].thumbnail_url) {
      const imgPath = path.join(__dirname, '../../', existing[0].thumbnail_url);
      if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
    }

    await db.execute('DELETE FROM blog_posts WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Artikel berhasil dihapus' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { getAllPosts, getAllPostsAdmin, getPostBySlug, createPost, updatePost, deletePost };