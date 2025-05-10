import db from '../config/db.js';
import { v4 as uuidv4 } from 'uuid';

export const createComment = (commentData) => {
    return new Promise(async (resolve, reject) => {
        const { user_id, blog_id, comment } = commentData;
        const id = uuidv4();
        const created_at = new Date().toISOString();

        db.run(
            'INSERT INTO comments (id, user_id, blog_id, comment, created_at) VALUES (?, ?, ?, ?, ?)',
            [id, user_id, blog_id, comment, created_at],
            function(err) {
                if (err) {
                    reject(err);
                    return;
                }

                const newComment = {
                    id,
                    user_id,
                    blog_id,
                    comment,
                    created_at
                };

                resolve(newComment);
            }
        );
    });
};

export const getCommentsByPostId = (blogId) => {
    return new Promise(async (resolve, reject) => {
        db.all(
            'SELECT * FROM comments WHERE blog_id = ?',
            [blogId],
            (err, rows) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(rows);
            }
        )
    });
};