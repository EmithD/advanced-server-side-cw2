import express from 'express';
import { createBlogController, getBlogsController, getBlogByIdController, likeBlogController, commentBlogController, getBlogsByUserIdController, deleteBlogController, updateBlogController, getBlogsByFollowingController } from '../controllers/blogs.controller.js';

const router = express.Router();

router.post('/', createBlogController);
router.get('/', getBlogsController);
router.get('/:id', getBlogByIdController);
router.post('/like', likeBlogController);
router.post('/comment', commentBlogController);
router.get('/user/:id', getBlogsByUserIdController);
router.delete('/:id', deleteBlogController);
router.patch('/:id', updateBlogController);
router.post('/users', getBlogsByFollowingController);

export default router;