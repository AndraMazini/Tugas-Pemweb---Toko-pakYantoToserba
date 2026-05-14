const express = require('express');
const router = express.Router();
const {
  getAllTestimonials, getAllTestimonialsAdmin,
  createTestimonial, approveTestimonial, rejectTestimonial
} = require('../controllers/testimonialController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.get('/', getAllTestimonials);
router.get('/all', protect, adminOnly, getAllTestimonialsAdmin);
router.post('/', createTestimonial);
router.put('/:id/approve', protect, adminOnly, approveTestimonial);
router.put('/:id/reject', protect, adminOnly, rejectTestimonial);

module.exports = router;