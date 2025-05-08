import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRY = process.env.JWT_EXPIRY;

export const generateToken = (id, email, display_name) => {

  const payload = {
    id,
    email,
    display_name
  };

  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRY });
};