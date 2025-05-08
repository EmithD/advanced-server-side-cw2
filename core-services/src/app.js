import express from 'express';
import apiKeyRoutes from './routes/apiKeys.route.js';
import authRoutes from './routes/auth.route.js';
import coreApiRoutes from './routes/coreApi.route.js';
import usageRoutes from './routes/keyUsage.route.js';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import authenticateUser from './middleware/authUser.middleware.js';

dotenv.config();
const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use(helmet());

// Routes
app.use(`/api/auth`, authRoutes);
app.use(`/api/api-keys`, authenticateUser, apiKeyRoutes);
app.use(`/api/countries`, authenticateUser, coreApiRoutes);
app.use(`/api/usage`, authenticateUser, usageRoutes);

export default app;