const express = require('express');
const router = express.Router();
const {
  createOrder, getAllOrders, getOrderById,
  updateOrderStatus, deleteOrder, generateWaLink
} = require('../controllers/orderController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// Publik
router.post('/', createOrder);

// Admin
router.get('/', protect, adminOnly, getAllOrders);
router.get('/generate-wa/:id', protect, adminOnly, generateWaLink);
router.get('/:id', protect, adminOnly, getOrderById);
router.put('/:id/status', protect, adminOnly, updateOrderStatus);
router.delete('/:id', protect, adminOnly, deleteOrder);

module.exports = router;