import db from '../config/db.js';
import { v4 as uuidv4 } from 'uuid';

export const createBlog = (blogData) => {
    return new Promise(async (resolve, reject) => {
        const { user_id, country_code, country_name, title, content } = blogData;
        const id = uuidv4();

        db.run(
            'INSERT INTO blogs (id, user_id, country_code, country_name, title, content) VALUES (?, ?, ?, ?, ?, ?)',
            [id, user_id, country_code, country_name, title, content],
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