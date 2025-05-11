import * as BlogModel from '../models/Blog.js';
import * as LikeModel from '../models/Like.js';
import * as CommentModel from '../models/Comment.js';

export const createBlogController = async (req, res) => {
    try {

        const { user, blog } = req.body;
        const user_id = user.id;
        const country_code = blog.country_code;
        const country_name = blog.country_name;
        const title = blog.title;
        const content = blog.content;

        await BlogModel.createBlog({
            user_id: user_id,
            country_code: country_code,
            country_name: country_name,
            title: title,
            content: content,
        });

        res.status(201).json({
            success:true,
            data: "New Blog created."
        });

    } catch (error) {
		res.status(500).json({
			success: false,
			error: error.message
		});
    }

};

export const getAllBlogsController = async (_req, res) => {
    try {

        const blogs = await BlogModel.getAllBlogs();

        for (const blog of blogs) {
            const likes = await LikeModel.getLikesByPostId(blog.id);
            const comments = await CommentModel.getCommentsByPostId(blog.id);
            blog.likes = {
                count: likes.length,
            };
            blog.comments = {
                count: comments.length,
            }
        }

        res.status(200).json({
            success: true,
            data: blogs
        });

    } catch (error) {
        res.status(500).json({
            success: false,
			error: error.message
        });
    }
};

export const getBlogByIdController = async (req, res) => {
    try {

        const blogId = req.params.id;
        const blog = await BlogModel.getBlogById(blogId);
        if (!blog) {
            return res.status(404).json({
                success: false,
                error: "Blog not found."
            });
        } else {
            const likes = await LikeModel.getLikesByPostId(blog.id);
            const comments = await CommentModel.getCommentsByPostId(blog.id);
            blog.likes = {
                count: likes.length,
                likedBy: likes
            };
            blog.comments = {
                count: comments.length,
                commentedBy: comments
            };
        }

        return res.status(200).json({
            success: true,
            data: blog
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
			error: error.message
        });
    }
};

export const getBlogsByUserIdController = async (req, res) => {
    try {

        const userId = req.params.user_id;
        const blogs = await BlogModel.getBlogsByUserId(userId);

        for (const blog of blogs) {
            const likes = await LikeModel.getLikesByPostId(blog.id);
            const comments = await CommentModel.getCommentsByPostId(blog.id);
            blog.likes = {
                count: likes.length,
            };
            blog.comments = {
                count: comments.length,
            }
        }

        return res.status(200).json({
            success: true,
            data: blogs
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

export const deleteBlogController = async (req, res) => {
    try {

        const blogId = req.params.id;
        const blog = await BlogModel.getBlogById(blogId);
        if (!blog) {
            return res.status(404).json({
                success: false,
                error: "Blog not found."
            });
        } else {
            await BlogModel.deleteBlog(blogId);
        }

        return res.status(200).json({
            success: true,
            data: "Blog deleted successfully."
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

export const updateBlogController = async (req, res) => {
    try {
        const blogId = req.params.id;
        const blog = await BlogModel.getBlogById(blogId);

        if (!blog) {
            return res.status(404).json({
                success: false,
                error: "Blog not found."
            });
        }

        const updateData = {};
        const blogData = req.body.blog;

        if (blogData.title !== undefined) updateData.title = blogData.title;
        if (blogData.content !== undefined) updateData.content = blogData.content;
        if (blogData.country_code !== undefined) updateData.country_code = blogData.country_code;
        if (blogData.country_name !== undefined) updateData.country_name = blogData.country_name;

        if (Object.keys(updateData).length > 0) {
            await BlogModel.updateBlog(blogId, updateData);
        }

        return res.status(200).json({
            success: true,
            data: "Blog updated successfully."
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

export const getBlogsByUsersController = async (req, res) => {
    try {
        const userIds = req.body.user_ids;
        const blogs = await BlogModel.getBlogsByUsers(userIds);

        for (const blog of blogs) {
            const likes = await LikeModel.getLikesByPostId(blog.id);
            const comments = await CommentModel.getCommentsByPostId(blog.id);
            blog.likes = {
                count: likes.length,
            };
            blog.comments = {
                count: comments.length,
            }
        }

        return res.status(200).json({
            success: true,
            data: blogs
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
}
