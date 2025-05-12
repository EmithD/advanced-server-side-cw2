import db from '../config/db.js';
import { v4 as uuidv4 } from 'uuid';

export const createLike = (likeData) => {
    return new Promise((resolve, reject) => {
        const { user_id, blog_id } = likeData;
        const id = uuidv4();
        const liked_at = new Date().toISOString();

        db.run(
            'INSERT INTO likes (id, user_id, blog_id, liked_at) VALUES (?, ?, ?, ?)',
            [id, user_id, blog_id, liked_at],
            function(err) {
                if (err) {
                    reject(err);
                    return;
                }
                resolve({ id, user_id, blog_id });
            }
        );
    });
};

export const getLikesByPostId = (blogId) => {
    return new Promise((resolve, reject) => {
        db.all(
            'SELECT * FROM likes WHERE blog_id = ?',
            [blogId],
            (err, rows) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(rows);
            }
        );
    });
};

export const getLikeByUserAndBlog = (likeData) => {
    const { user_id, blog_id } = likeData;
    return new Promise((resolve, reject) => {
        db.get(
            'SELECT * FROM likes WHERE user_id = ? AND blog_id = ?',
            [user_id, blog_id],
            (err, row) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(row);
            }
        );
    });
};

export const deleteLikeByUserAndBlog = (likeData) => {
    const { user_id, blog_id } = likeData;
    return new Promise((resolve, reject) => {
        db.run(
            'DELETE FROM likes WHERE user_id = ? AND blog_id = ?',
            [user_id, blog_id],
            function(err) {
                if (err) {
                    reject(err);
                    return;
                }
                resolve({ 
                    success: true,
                    changes: this.changes 
                });
            }
        );
    });
};