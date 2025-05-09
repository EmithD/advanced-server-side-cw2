import * as UserModel from '../models/User.js';

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
        } else {
            console.log("No comments found for this blog post");
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

        res.status(200).json({
            success: true,
            data: blogsData
        });

    } catch (error) {
        console.error('Error in getBlogsByUserIdController:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}