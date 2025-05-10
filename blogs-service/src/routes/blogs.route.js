import express from 'express';
import { createBlogController, getAllBlogsController, getBlogByIdController, getBlogsByUserIdController } from '../controllers/blogs.controller.js';

const router = express.Router();

router.post('/', createBlogController);
router.get('/', getAllBlogsController);
router.get('/:id', getBlogByIdController);
router.get('/user/:user_id', getBlogsByUserIdController);

export default router;