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
        `CREATE TABLE IF NOT EXISTS blogs (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          title TEXT NOT NULL,
          country_code TEXT NOT NULL,
          country_name TEXT NOT NULL,
          content TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`,
        `CREATE TABLE IF NOT EXISTS comments (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          blog_id TEXT NOT NULL,
          comment TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (blog_id) REFERENCES blogs (id)
        )`,
        `CREATE TABLE IF NOT EXISTS likes (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          blog_id TEXT NOT NULL,
          liked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (blog_id) REFERENCES blogs (id)
        )`,
      ];

      db.serialize(() => {
        const allQueries = [...tables];

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
