import express from 'express';
import { createCommentController } from '../controllers/comments.controller.js';

const router = express.Router();

router.post('/', createCommentController);

export default router;