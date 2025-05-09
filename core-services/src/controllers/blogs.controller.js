export const createBlogController = async (req, res) => {

    try {

        const user_id = req.user.id;
        const blog = req.body;
        const country_code = blog.country_code;
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