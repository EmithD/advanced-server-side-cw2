import express from 'express';
import { getUserProfile, loginController, registerController } from '../controllers/auth.controller.js';
import authenticateUser from '../middleware/authUser.middleware.js';

const router = express.Router();

router.post('/register', registerController);
router.post('/login', loginController);

router.get('/profile', authenticateUser, getUserProfile)

export default router;