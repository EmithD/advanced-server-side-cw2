import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = process.env.DB_PATH || path.join(__dirname, '../../database.sqlite');

const initDb = async () => {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('Error opening database', err.message);
        return reject(err);
      }

      console.log('Connected to SQLite database');

      const tables = [
        `CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY,
          display_name TEXT UNIQUE NOT NULL,
          email TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`,

        `CREATE TABLE IF NOT EXISTS api_keys (
          id TEXT PRIMARY KEY,
          api_key TEXT NOT NULL UNIQUE,
          user_id TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users (id)
        )`,

        `CREATE TABLE IF NOT EXISTS api_key_usage (
          id TEXT PRIMARY KEY,
          api_key TEXT NOT NULL,
          endpoint TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (api_key) REFERENCES api_keys (api_key) ON DELETE CASCADE
        )`,

        `CREATE TABLE IF NOT EXISTS follows (
          id TEXT PRIMARY KEY,
          follower_id TEXT NOT NULL,
          following_id TEXT NOT NULL,
          followed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (follower_id) REFERENCES users (id) ON DELETE CASCADE,
          FOREIGN KEY (following_id) REFERENCES users (id) ON DELETE CASCADE,
          CHECK (follower_id <> following_id)
        )`
      ];

      const countriesTable = [
        `CREATE TABLE IF NOT EXISTS countries (
          id TEXT PRIMARY KEY,
          common_name TEXT,
          official_name TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`
      ];

      db.serialize(() => {
        const allQueries = [...tables, ...countriesTable];

        let completed = 0;
        allQueries.forEach((sql, index) => {
          db.run(sql, (err) => {
            if (err) {
              console.error(`Error executing SQL #${index + 1}:`, err.message);
              return reject(err);
            }

            completed++;
            if (completed === allQueries.length) {
              console.log('All tables initialized');
              resolve(db);
            }
          });
        });
      });
    });
  });
};

const db = await initDb();

export default db;
