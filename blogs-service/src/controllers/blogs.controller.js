import * as BlogModel from '../models/Blog.js';

export const createBlogController = async (req, res) => {
    try {

        const { user, blog } = req.body;
        const user_id = user.id;
        const country_code = blog.country_code;
        const title = blog.title;
        const content = blog.content;

        await BlogModel.createBlog({
            user_id: user_id,
            country_code: country_code,
            title: title,
            content: content
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