import express from 'express';
import { createBlogController } from '../controllers/blogs.controller.js';

const router = express.Router();

router.post('/', createBlogController);

export default router;