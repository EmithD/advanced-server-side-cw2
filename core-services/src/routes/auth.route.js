import express from 'express';
import { getProfileById, getUserProfile, loginController, registerController } from '../controllers/auth.controller.js';
import authenticateUser from '../middleware/authUser.middleware.js';

const router = express.Router();

router.post('/register', registerController);
router.post('/login', loginController);

router.get('/profile', authenticateUser, getUserProfile)
router.get('/profile/:id', authenticateUser, getProfileById)

export default router;