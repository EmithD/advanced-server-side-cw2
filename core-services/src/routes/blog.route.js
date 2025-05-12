import express from 'express';
import { createBlogController, getBlogsController, getBlogByIdController, likeBlogController, commentBlogController, getBlogsByUserIdController, deleteBlogController, updateBlogController, getBlogsByFollowingController } from '../controllers/blogs.controller.js';
import authenticateUser from '../middleware/authUser.middleware.js';

const router = express.Router();

router.post('/', authenticateUser,createBlogController);
router.get('/', getBlogsController);
router.get('/:id', getBlogByIdController);
router.post('/like', authenticateUser, likeBlogController);
router.post('/comment', authenticateUser, commentBlogController);
router.get('/user/:id', getBlogsByUserIdController);
router.delete('/:id', authenticateUser, deleteBlogController);
router.patch('/:id', authenticateUser, updateBlogController);
router.post('/users', authenticateUser, getBlogsByFollowingController);

export default router;