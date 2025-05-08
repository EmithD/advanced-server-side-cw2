import db from '../config/db.js';
import { v4 as uuidv4 } from 'uuid';

export const createApiKey = (apiKeyData) => {
  return new Promise(async (resolve, reject) => {
    const { user_id } = apiKeyData;
    const api_key = uuidv4();
    const id = uuidv4();

    db.run(
      'INSERT INTO api_keys (id, api_key, user_id) VALUES (?, ?, ?)',
      [id, api_key, user_id],
      function(err) {
        if (err) {
          reject(err);
          return;
        }

        db.get(
          'SELECT id, api_key, user_id, created_at FROM api_keys WHERE id = ?',
          [id],
          (err, row) => {
            if (err) {
              reject(err);
              return;
            }
            
            resolve(row);
          }
        );
      }
    );
  });
};

export const getAPIKeysByUserId = (user_id) => {

  return new Promise(async (resolve, reject) => {
    db.all(
      'SELECT id, api_key, user_id, created_at FROM api_keys WHERE user_id = ?',
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

export const getAPIKeyByKey = (api_key) => {
  return new Promise(async (resolve, reject) => {
    db.get(
      'SELECT id, api_key, user_id, created_at FROM api_keys WHERE api_key = ?',
      [api_key],
      (err, row) => {
        if (err) {
          reject(err);
          return;
        }

        resolve(row);
      }
    );
  });
}

export const deleteApiKey = (id) => {
  return new Promise((resolve, reject) => {
    db.run(
      'DELETE FROM api_keys WHERE id = ?',
      [id],
      function(err) {
        if (err) {
          reject(err);
          return;
        }

        resolve(this.changes > 0);
      }
    );
  });
}