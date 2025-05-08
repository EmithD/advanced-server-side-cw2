import * as UserModel from '../models/User.js';
import { generateToken } from '../utils/jwtUtils.js';

export const loginController = async (req, res) => {

    try {
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        const user = await UserModel.findUserByEmail(email);

        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const isMatch = await UserModel.verifyPassword(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const token = generateToken(user.id, user.email);

        res.status(200).json({
            success: true,
            data: {
                token,
                user: {
                    id: user.id,
                    display_name: user.display_name,
                    email: user.email,
                },
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            error: error
        });
    }

}

export const registerController = async (req, res) => {
    try {

        const { display_name, email, password } = req.body;
        
        if (!display_name || !email || !password) {
            return res.status(400).json({ error: 'DisplayName and email are required' });
        }
        
        const newUser = await UserModel.createUser({ display_name, email, password });

        res.status(201).json({
            success: true,
            data: {
                user: newUser,
            }
        });

    } catch (error) {
        if (error.message.includes('UNIQUE constraint failed')) {
            return res.status(409).json({ error: 'User already exists' });
        }
        
        res.status(500).json({
            success: false,
            error: error
        });
    }
}

export const getUserProfile = async (req, res) => {

    try {

        const userId = req.user.id;
        const user = await UserModel.findUserById(userId);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.status(200).json({
            success: true,
            data: {
                user: {
                    id: user.id,
                    display_name: user.display_name,
                    email: user.email,
                },
            }
        });

    } catch (error) {
        res.status(401).json({
            success: false,
            error: "User not authenticated"
        });
    }

}
