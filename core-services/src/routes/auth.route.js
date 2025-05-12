import express from 'express';
import { followUserController, getProfileById, getUserProfile, loginController, logoutController, registerController } from '../controllers/auth.controller.js';
import authenticateUser from '../middleware/authUser.middleware.js';

const router = express.Router();

router.post('/register', registerController);
router.post('/login', loginController);
router.post('/logout', logoutController);
router.get('/profile', authenticateUser, getUserProfile)
router.get('/profile/:id', getProfileById)
router.post('/follow/:id', authenticateUser, followUserController);

export default router;