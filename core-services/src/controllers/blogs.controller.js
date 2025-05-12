import * as UserModel from '../models/User.js';
import * as FollowModel from '../models/Follow.js';

export const createBlogController = async (req, res) => {

    try {

        const user_id = req.user.id;
        const blog = req.body;
        const country_code = blog.country_code;
        const country_name = blog.country_name;
        const title = blog.title;
        const content = blog.content;

        const blogRes = await fetch(`${process.env.BLOG_BE_URL}/api/blogs`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                user: {
                    id: user_id
                },
                blog: {
                    country_code,
                    country_name,
                    title,
                    content
                }
            })
        });

        if (!blogRes.ok) {
            return res.status(500).json({ error: "Blog Res from 3001 failed."})
        }

        return res.status(201).json({
            success: true,
            data: "Blog created."
        });

    } catch (error) {
        console.error('Error in createBlogController:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }

};

export const getBlogsController = async (_req, res) => {
    try {

        const blogs = await fetch(`${process.env.BLOG_BE_URL}/api/blogs`);

        if (!blogs.ok) {
            return res.status(500).json({ error: "Blog Res from 3001 failed."})
        }

        const blogsJson = await blogs.json();
        const blogsData = blogsJson.data;

        for (const blog of blogsData) {
            const userID = blog.user_id;
            const user = await UserModel.findUserById(userID);
            blog.user = {
                user_id: user.id,
                display_name: user.display_name,
                email: user.email
            };
        };

        res.status(200).json({
            success: true,
            data: blogsData
        });

    } catch (error) {
        console.error('Error in getBlogsController:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

export const getBlogByIdController = async (req, res) => {
    try {
        const blogId = req.params.id;
        const blog = await fetch(`${process.env.BLOG_BE_URL}/api/blogs/${blogId}`);

        if(!blog.ok) {
            return res.status(500).json({
                error: "Blog by ID res from 3001 failed."
            });
        }
        
        const blogJson = await blog.json();
        const blogData = blogJson.data;

        const userID = blogData.user_id;
        const user = await UserModel.findUserById(userID);

        blogData.user = {
            user_id: user.id,
            display_name: user.display_name,
            email: user.email
        };

        if (blogData.comments && blogData.comments.commentedBy && blogData.comments.commentedBy.length > 0) {
            const commentUserPromises = [];
            
            for (const comment of blogData.comments.commentedBy) {
                
                const commentUserPromise = UserModel.findUserById(comment.user_id)
                    .then(commentUser => {
                        if (commentUser) {
                            comment.display_name = commentUser.display_name;
                        } else {
                            comment.display_name = "Unknown User";
                        }
                        return comment;
                    })
                    .catch(err => {
                        console.error(`Error fetching user for comment ${comment.id}:`, err);
                        comment.user_display_name = "Unknown User";
                        return comment;
                    });
                    
                commentUserPromises.push(commentUserPromise);
            }

            await Promise.all(commentUserPromises);
        }


        return res.status(200).json({
            success: true,
            data: blogData
        });

    } catch (error) {
        console.error('Error in getBlogsByIdController:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

export const likeBlogController = async (req, res) => {
    try {

        const user_id = req.user.id;
        const blog_id = req.body.blog_id;

        const likeRes = await fetch(`${process.env.BLOG_BE_URL}/api/like`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                user: {
                    id: user_id
                },
                blog: {
                    id: blog_id
                }
            })
        });

        if (!likeRes.ok) {
            return res.status(500).json({ error: "Like Res from 3001 failed."})
        }

        return res.status(200).json({
            success: true,
            data: "Blog liked."
        });

    } catch (error) {
        console.error('Error in likeBlogController:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

export const commentBlogController = async (req, res) => {

    try {

        const user_id = req.user.id;
        const blog_id = req.body.blog_id;
        const comment = req.body.comment;

        const commentRes = await fetch(`${process.env.BLOG_BE_URL}/api/comment`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                user: {
                    id: user_id
                },
                blog: {
                    id: blog_id
                },
                comment: {
                    content: comment
                }
            })
        });

        if (!commentRes.ok) {
            return res.status(500).json({ error: "Comment Res from 3001 failed."})
        }

        const commentJson = await commentRes.json();
        const commentData = commentJson.data;

        const user = await UserModel.findUserById(commentData.user_id);
        commentData.user = {
            user_id: user.id,
            display_name: user.display_name,
            email: user.email
        };

        return res.status(200).json({
            success: true,
            data: commentData
        });

    } catch (error) {
        console.error('Error in commentBlogController:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }

}

export const getBlogsByUserIdController = async (req, res) => {
    try {
        const user_id = await req.params.id;
        const blogs = await fetch(`${process.env.BLOG_BE_URL}/api/blogs/user/${user_id}`);

        if (!blogs.ok) {
            return res.status(500).json({ error: "Blog Res from 3001 failed."})
        }

        const blogsJson = await blogs.json();
        const blogsData = blogsJson.data;

        for (const blog of blogsData) {
            const userID = blog.user_id;
            const user = await UserModel.findUserById(userID);
            blog.user = {
                user_id: user.id,
                display_name: user.display_name,
                email: user.email
            };
        };

        res.status(200).json({
            success: true,
            data: blogsData
        });

    } catch (error) {
        console.error('Error in getBlogsByUserIdController:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

export const deleteBlogController = async (req, res) => {
    try {

        const user_id = req.user.id;
        const blogId = req.params.id;

        const blogRes = await fetch(`${process.env.BLOG_BE_URL}/api/blogs/${req.params.id}`);
        if (!blogRes.ok) {
            return res.status(500).json({ error: "Blog Res from 3001 failed."})
        }

        const blogJson = await blogRes.json();
        const blogData = blogJson.data;

        if (blogData.user_id !== user_id) {
            return res.status(403).json({ error: "You are not authorized to delete this blog."})
        }

        const deleteRes = await fetch(`${process.env.BLOG_BE_URL}/api/blogs/${blogId}`, {
            method: "DELETE"
        });

        if (!deleteRes.ok) {
            return res.status(500).json({ error: "Delete Res from 3001 failed."})
        }

        return res.status(200).json({
            success: true,
            data: "Blog deleted."
        });

    } catch (error) {
        console.error('Error in deleteBlogController:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

export const updateBlogController = async (req, res) => {
    try {
        const blogId = req.params.id;
        const blog = await req.body;

        const blogRes = await fetch(`${process.env.BLOG_BE_URL}/api/blogs/${blogId}`);
        if (!blogRes.ok) {
            return res.status(500).json({ error: "Blog Res from 3001 failed."})
        }
        const blogJson = await blogRes.json();
        const blogData = blogJson.data;

        if (blogData.user_id !== req.user.id) {
            return res.status(403).json({ error: "You are not authorized to update this blog."})
        }

        const updateRes = await fetch(`${process.env.BLOG_BE_URL}/api/blogs/${blogId}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                blog: {
                    country_code: blog.country_code,
                    country_name: blog.country_name,
                    title: blog.title,
                    content: blog.content
                }
            })
        });

        if (!updateRes.ok) {
            return res.status(500).json({ error: "Update Res from 3001 failed."})
        }

        return res.status(200).json({
            success: true,
            data: "Blog updated."
        });

    } catch (error) {
        console.error('Error in updateBlogController:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

export const getBlogsByFollowingController = async (req, res) => {
    try {

        const user_id = req.user.id;
        
        const following = await FollowModel.getFollowing(user_id);
        const user_ids = following.map(follow => follow.following_id);

        const blogs = await fetch(`${process.env.BLOG_BE_URL}/api/blogs/users`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                user_ids
            })
        });

        if (!blogs.ok) {
            return res.status(500).json({ error: "Blog Res from 3001 failed."})
        }

        const blogsJson = await blogs.json();
        const blogsData = blogsJson.data;

        for (const blog of blogsData) {
            const userID = blog.user_id;
            const user = await UserModel.findUserById(userID);
            blog.user = {
                user_id: user.id,
                display_name: user.display_name,
                email: user.email
            };
        };

        res.status(200).json({
            success: true,
            data: blogsData
        });

    } catch (error) {
        console.error('Error in getBlogsByUsersController:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}