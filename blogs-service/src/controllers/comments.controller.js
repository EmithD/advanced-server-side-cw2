import * as CommentModel from '../models/Comment.js';

export const createCommentController = async (req, res) => {
    try {

        const { user, blog, comment } = req.body;
        const user_id = user.id;
        const blog_id = blog.id;
        const commentText = comment.content;

        const newComment = await CommentModel.createComment({
            user_id: user_id,
            blog_id: blog_id,
            comment: commentText
        })

        return res.status(201).json({
            success: true,
            action: 'commented',
            data: newComment
        });

    } catch (error) {
        console.error('Comment controller error:', error);
        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
}