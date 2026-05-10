const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const errorHandler = require('./src/middleware/errorHandler');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static folder untuk uploads
app.use('/uploads', express.static(path.join(__dirname, 'src/uploads')));

// Routes
app.use('/api/auth', require('./src/routes/authRoutes'));

// Routes person lain akan ditambahkan di sini
// app.use('/api/products', require('./src/routes/productRoutes'));
// app.use('/api/categories', require('./src/routes/categoryRoutes'));
// app.use('/api/gallery', require('./src/routes/galleryRoutes'));
// app.use('/api/testimonials', require('./src/routes/testimonialRoutes'));
// app.use('/api/blog', require('./src/routes/blogRoutes'));
// app.use('/api/orders', require('./src/routes/orderRoutes'));

// Health check
app.get('/', (req, res) => {
  res.json({ success: true, message: 'Toko API berjalan ✅' });
});

// Error handler (harus paling bawah)
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server berjalan di http://localhost:${PORT}`);
});