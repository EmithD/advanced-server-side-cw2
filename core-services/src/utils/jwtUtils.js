import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRY = process.env.JWT_EXPIRY;
const COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000; 

export const generateToken = (id, email, display_name) => {

  const payload = {
    id,
    email,
    display_name
  };

  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRY });
};

export const setAuthCookie = (res, token) => {

  res.cookie('authToken', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: COOKIE_MAX_AGE,
    path: '/'
  });

};