import * as LikeModel from '../models/Like.js';

export const createLikeController = async (req, res) => {
    try {
        const { user, blog } = req.body;
        const user_id = user.id;
        const blog_id = blog.id;

        const existingLike = await LikeModel.getLikeByUserAndBlog({
            user_id: user_id,
            blog_id: blog_id
        });

        if (existingLike) {
            await LikeModel.deleteLikeByUserAndBlog({
                user_id: user_id,
                blog_id: blog_id
            });

            return res.status(200).json({
                success: true,
                action: 'unliked',
                data: `User unliked blog ${blog_id}`
            });
        } else {
            await LikeModel.createLike({
                user_id: user_id,
                blog_id: blog_id
            });

            return res.status(201).json({
                success: true,
                action: 'liked',
                data: `User liked blog ${blog_id}`
            });
        }

    } catch (error) {
        console.error('Like controller error:', error);
        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
};