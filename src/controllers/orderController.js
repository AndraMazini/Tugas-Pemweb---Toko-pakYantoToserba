const db = require('../config/db');

// POST /api/orders — kirim inquiry (publik)
const createOrder = async (req, res) => {
  const { customer_name, phone, product_interest, message } = req.body;

  if (!customer_name || !phone) {
    return res.status(400).json({ success: false, message: 'Nama dan nomor HP wajib diisi' });
  }

  // Validasi format nomor HP
  const phoneRegex = /^(\+62|62|0)[0-9]{8,13}$/;
  if (!phoneRegex.test(phone)) {
    return res.status(400).json({ success: false, message: 'Format nomor HP tidak valid' });
  }

  try {
    const [result] = await db.execute(
      `INSERT INTO orders (customer_name, phone, product_interest, message)
       VALUES (?, ?, ?, ?)`,
      [customer_name, phone.trim(), product_interest || null, message || null]
    );

    // Generate link WhatsApp otomatis
    const waNumber = process.env.WA_NUMBER || '6281234567890';
    const waMessage = encodeURIComponent(
      `Halo! Saya ${customer_name} ingin bertanya tentang:\n` +
      `Produk: ${product_interest || '-'}\n` +
      `Pesan: ${message || '-'}`
    );
    const waLink = `https://wa.me/${waNumber}?text=${waMessage}`;

    res.status(201).json({
      success: true,
      message: 'Inquiry berhasil dikirim',
      id: result.insertId,
      wa_link: waLink
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET /api/orders — list semua inquiry (admin)
const getAllOrders = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    let query = 'SELECT * FROM orders WHERE 1=1';
    const params = [];

    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }

    query += ` ORDER BY created_at DESC LIMIT ${Number(limit)} OFFSET ${Number(offset)}`;

    const [rows] = await db.execute(query, params);

    // Count total
    let countQuery = 'SELECT COUNT(*) as total FROM orders WHERE 1=1';
    const countParams = [];
    if (status) { countQuery += ' AND status = ?'; countParams.push(status); }

    const [countRows] = await db.execute(countQuery, countParams);
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

// GET /api/orders/:id — detail inquiry (admin)
const getOrderById = async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM orders WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'Order tidak ditemukan' });
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// PUT /api/orders/:id/status — update status (admin)
const updateOrderStatus = async (req, res) => {
  const { status } = req.body;
  const validStatus = ['new', 'read', 'done'];

  if (!status || !validStatus.includes(status)) {
    return res.status(400).json({
      success: false,
      message: `Status tidak valid. Pilihan: ${validStatus.join(', ')}`
    });
  }

  try {
    const [existing] = await db.execute('SELECT * FROM orders WHERE id = ?', [req.params.id]);
    if (existing.length === 0) return res.status(404).json({ success: false, message: 'Order tidak ditemukan' });

    await db.execute('UPDATE orders SET status = ? WHERE id = ?', [status, req.params.id]);
    res.json({ success: true, message: `Status order berhasil diubah ke '${status}'` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// DELETE /api/orders/:id — hapus order (admin)
const deleteOrder = async (req, res) => {
  try {
    const [existing] = await db.execute('SELECT * FROM orders WHERE id = ?', [req.params.id]);
    if (existing.length === 0) return res.status(404).json({ success: false, message: 'Order tidak ditemukan' });

    await db.execute('DELETE FROM orders WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Order berhasil dihapus' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET /api/orders/generate-wa/:id — generate ulang link WA (admin)
const generateWaLink = async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM orders WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'Order tidak ditemukan' });

    const order = rows[0];
    const waNumber = process.env.WA_NUMBER || '6281234567890';
    const waMessage = encodeURIComponent(
      `Halo! Saya ${order.customer_name} ingin bertanya tentang:\n` +
      `Produk: ${order.product_interest || '-'}\n` +
      `Pesan: ${order.message || '-'}`
    );
    const waLink = `https://wa.me/${waNumber}?text=${waMessage}`;

    res.json({ success: true, wa_link: waLink, order });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { createOrder, getAllOrders, getOrderById, updateOrderStatus, deleteOrder, generateWaLink };