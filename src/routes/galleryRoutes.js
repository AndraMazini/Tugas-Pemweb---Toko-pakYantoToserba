const express = require('express');
const router = express.Router();
const { getAllGallery, createGallery, deleteGallery } = require('../controllers/galleryController');
const { protect, adminOnly } = require('../middleware/authMiddleware');
const upload = require('../config/multer');

router.get('/', getAllGallery);
router.post('/', protect, adminOnly, upload.single('image'), createGallery);
router.delete('/:id', protect, adminOnly, deleteGallery);

module.exports = router;