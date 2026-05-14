const express = require('express');
const router = express.Router();
const {
  getAllPosts, getAllPostsAdmin, getPostBySlug,
  createPost, updatePost, deletePost
} = require('../controllers/blogController');
const { protect, adminOnly } = require('../middleware/authMiddleware');
const upload = require('../config/multer');

router.get('/', getAllPosts);
router.get('/all', protect, adminOnly, getAllPostsAdmin);
router.get('/:slug', getPostBySlug);
router.post('/', protect, adminOnly, upload.single('thumbnail'), createPost);
router.put('/:id', protect, adminOnly, upload.single('thumbnail'), updatePost);
router.delete('/:id', protect, adminOnly, deletePost);

module.exports = router;