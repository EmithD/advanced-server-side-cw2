import db from '../config/db.js';
import { v4 as uuidv4 } from 'uuid';

export const getUsageByApiKey = (api_key) => {

    return new Promise(async (resolve, reject) => {
        db.all(
            `SELECT * FROM api_key_usage WHERE api_key = ?`,
            [api_key],
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

export const createUsageRecord = (api_key, endpoint) => {
    return new Promise(async (resolve, reject) => {
        const id = uuidv4();

        db.run(
            `INSERT INTO api_key_usage (id, api_key, endpoint) VALUES (?, ?, ?)`,
            [id, api_key, endpoint],
            function (err) {
                if (err) {
                    reject(err);
                    return;
                }
                
                db.get(
                    `SELECT * FROM api_key_usage WHERE id = ?`,
                    [id],
                    (err, row) => {
                        if (err) {
                            reject(err);
                            return;
                        }
                        resolve(row);
                    }
                )
            }
        );
    });
}