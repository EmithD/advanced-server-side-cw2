import express from 'express';
import { createBlogController, getBlogsController, getBlogByIdController, likeBlogController, commentBlogController, getBlogsByUserIdController } from '../controllers/blogs.controller.js';

const router = express.Router();

router.post('/', createBlogController);
router.get('/', getBlogsController);
router.get('/:id', getBlogByIdController);
router.post('/like', likeBlogController);
router.post('/comment', commentBlogController);
router.get('/user/:id', getBlogsByUserIdController);

export default router;