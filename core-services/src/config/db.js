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
          FOREIGN KEY (api_key) REFERENCES api_keys (api_key)
        )`
      ];

      db.serialize(() => {
        tables.forEach((sql, index) => {
          db.run(sql, (err) => {
            if (err) {
              console.error(`Error creating table #${index + 1}:`, err.message);
              return reject(err);
            }
            
            console.log(`Table #${index + 1} initialized`);

            if (index === tables.length - 1) {
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