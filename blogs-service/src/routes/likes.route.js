import express from 'express';
import { createLikeController } from '../controllers/likes.controller.js';

const router = express.Router();

router.post('/', createLikeController);

export default router;