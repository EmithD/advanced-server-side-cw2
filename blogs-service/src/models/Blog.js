import db from '../config/db.js';
import { v4 as uuidv4 } from 'uuid';

export const createBlog = (blogData) => {
    return new Promise(async (resolve, reject) => {
        const { user_id, country_code, country_name, title, content } = blogData;
        const id = uuidv4();
        const created_at = new Date().toISOString();

        db.run(
            'INSERT INTO blogs (id, user_id, country_code, country_name, title, content, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [id, user_id, country_code, country_name, title, content, created_at],
            function(err) {
                if (err) {
                    reject(err);
                    return;
                }
                resolve();
            }
        );
    });
};

export const getAllBlogs = () => {
    return new Promise(async (resolve, reject) => {
        db.all(
            'SELECT * FROM blogs',
            [],
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

export const getBlogById = (id) => {
    return new Promise(async (resolve, reject) => {
        db.get(
            'SELECT * FROM blogs WHERE id = ?',
            [id],
            (err, row) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(row);
            }
        )
    });
};

export const getBlogsByUserId = (user_id) => {
    return new Promise(async (resolve, reject) => {
        db.all(
            'SELECT * FROM blogs WHERE user_id = ?',
            [user_id],
            (err, rows) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(rows);
            }
        );
    });
}

export const getBlogsByUsers = (user_ids) => {
    return new Promise(async (resolve, reject) => {
        if (!Array.isArray(user_ids) || user_ids.length === 0) {
            return resolve([]);
        }

        const placeholders = user_ids.map(() => '?').join(',');
        db.all(
            `SELECT * FROM blogs WHERE user_id IN (${placeholders})`,
            user_ids,
            (err, rows) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(rows);
            }
        );
    });
}

export const deleteBlog = (id) => {
    return new Promise(async (resolve, reject) => {
        db.run('BEGIN TRANSACTION', (transErr) => {
            if (transErr) {
                reject(transErr);
                return;
            }

            db.run('DELETE FROM likes WHERE blog_id = ?', [id], (likesErr) => {
                if (likesErr) {
                    db.run('ROLLBACK', () => reject(likesErr));
                    return;
                }

                db.run('DELETE FROM comments WHERE blog_id = ?', [id], (commentsErr) => {
                    if (commentsErr) {
                        db.run('ROLLBACK', () => reject(commentsErr));
                        return;
                    }

                    db.run('DELETE FROM blogs WHERE id = ?', [id], function(blogErr) {
                        if (blogErr) {
                            db.run('ROLLBACK', () => reject(blogErr));
                            return;
                        }

                        db.run('COMMIT', (commitErr) => {
                            if (commitErr) {
                                db.run('ROLLBACK', () => reject(commitErr));
                                return;
                            }
                            resolve();
                        });
                    });
                });
            });
        });
    });
};

export const updateBlog = async (id, blogData) => {
    if (!blogData || Object.keys(blogData).length === 0) {
        return Promise.resolve({ changes: 0 });
    }

    const fields = Object.keys(blogData);
    const values = fields.map(field => blogData[field]);

    const setClause = fields.map(field => `${field} = ?`).join(', ');

    values.push(id);
    
    return new Promise((resolve, reject) => {
        db.run(
            `UPDATE blogs SET ${setClause} WHERE id = ?`,
            values,
            function (err) {
                if (err) {
                    reject(err);
                    return;
                }
                resolve({ changes: this.changes });
            }
        );
    });
};

