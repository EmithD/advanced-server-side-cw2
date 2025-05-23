import * as UserModel from '../models/User.js';
import * as FollowModel from '../models/Follow.js';
import { generateToken, setAuthCookie } from '../utils/jwtUtils.js';

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

    setAuthCookie(res, token);

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
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

export const logoutController = async (req, res) => {
  try {
    res.clearCookie('authToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/'
    });

    return res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

export const registerController = async (req, res) => {
  try {
    const { display_name, email, password } = req.body;
    
    if (!display_name || !email || !password) {
      return res.status(400).json({ error: 'DisplayName, email, and password are required' });
    }
    
    const newUser = await UserModel.createUser({ display_name, email, password });

    const token = generateToken(newUser.id, newUser.email);
    setAuthCookie(res, token);

    res.status(201).json({
      success: true,
      data: {
        user: {
          id: newUser.id,
          display_name: newUser.display_name,
          email: newUser.email,
        },
      }
    });

  } catch (error) {
    if (error.message.includes('UNIQUE constraint failed')) {
      return res.status(409).json({ error: 'User already exists' });
    }
    
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

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

export const getProfileById = async (req, res) => {

    try {

        const userId = await req.params.id;
        const user = await UserModel.findUserById(userId);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const followers = await FollowModel.getFollowers(userId);
        const following = await FollowModel.getFollowing(userId);

        res.status(200).json({
            success: true,
            data: {
                user: {
                    id: user.id,
                    display_name: user.display_name,
                    email: user.email,
                    followers: followers,
                    following: following,
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

export const followUserController = async (req, res) => {

    try {

        const userId = await req.params.id;
        const followerId = await req.user.id;

        const result = await FollowModel.createFollow(followerId, userId);

        if (result.success) {
            res.status(200).json({
                success: true,
                data: {
                    action: result.action,
                }
            });
        } else {
            res.status(500).json({
                success: false,
                error: 'Failed to follow/unfollow user'
            });
        }

    } catch (error) {
        res.status(500).json({
            success: false,
            error: error
        });
    }

}