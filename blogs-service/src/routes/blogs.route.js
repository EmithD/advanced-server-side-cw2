import express from 'express';
import { createBlogController, deleteBlogController, getAllBlogsController, getBlogByIdController, getBlogsByUserIdController, updateBlogController } from '../controllers/blogs.controller.js';

const router = express.Router();

router.post('/', createBlogController);
router.get('/', getAllBlogsController);
router.get('/:id', getBlogByIdController);
router.get('/user/:user_id', getBlogsByUserIdController);
router.delete('/:id', deleteBlogController)
router.patch('/:id', updateBlogController);

export default router;