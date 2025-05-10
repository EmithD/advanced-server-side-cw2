import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import _db from './config/db.js';
import blogroutes from './routes/blogs.route.js'
import likeRoutes from './routes/likes.route.js'
import commentRoutes from './routes/comments.route.js'

dotenv.config();
const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use(helmet());

// Routes
app.use(`/api/blogs`, blogroutes);
app.use(`/api/like`, likeRoutes);
app.use(`/api/comment`, commentRoutes);

export default app;