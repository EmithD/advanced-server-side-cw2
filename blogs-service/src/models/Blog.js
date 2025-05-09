import db from '../config/db.js';
import { v4 as uuidv4 } from 'uuid';

export const createBlog = (blogData) => {
    return new Promise(async (resolve, reject) => {
        const { user_id, country_code, title, content } = blogData;
        const id = uuidv4();
        console.log(id)

        db.run(
            'INSERT INTO blogs (id, user_id, country_code, title, content) VALUES (?, ?, ?, ?, ?)',
            [id, user_id, country_code, title, content],
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