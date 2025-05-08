import db from '../config/db.js';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';

export const createUser = (userData) => {
  return new Promise(async (resolve, reject) => {
    const { display_name, email, password } = userData;
    const id = uuidv4();

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    db.run(
      'INSERT INTO users (id, display_name, email, password) VALUES (?, ?, ?, ?)',
      [id, display_name, email, hashedPassword],
      function(err) {
        if (err) {
          reject(err);
          return;
        }
        
        resolve({
          id,
          email,
          display_name
        });
      }
    );
  });
};

export const findUserByEmail = (email) => {
  return new Promise(async (resolve, reject) => {
    db.get(
      'SELECT id, display_name, email, password, created_at FROM users WHERE email = ?',
      [email],
      (err, row) => {
        if (err) {
          reject(err);
          return;
        }

        if (!row) {
          resolve(null);
          return;
        }

        resolve({
          id: row.id,
          display_name: row.display_name,
          email: row.email,
          password: row.password,
          created_at: row.created_at
        });
      }
    );
  });
};

export const findUserById = (id) => {
  return new Promise(async (resolve, reject) => {
    db.get(
      'SELECT id, display_name, email, password, created_at FROM users WHERE id = ?',
      [id],
      (err, row) => {
        if (err) {
          reject(err);
          return;
        }

        if (!row) {
          resolve(null);
          return;
        }

        resolve({
          id: row.id,
          display_name: row.display_name,
          email: row.email,
          password: row.password,
          created_at: row.created_at
        });
      }
    );
  });
};

export const userExists = async (email) => {
  try {
    const user = await findUserByEmail(email);
    return user !== null;
  } catch (error) {
    throw error;
  }
};

export const verifyPassword = async (plainPassword, hashedPassword) => {
  return await bcrypt.compare(plainPassword, hashedPassword);
};