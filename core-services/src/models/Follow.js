import db from '../config/db.js';
import { v4 as uuidv4 } from 'uuid';

export const createFollow = async (followerId, followingId) => {
  try {
    const existing = await new Promise((resolve, reject) => {
      db.all(
        'SELECT * FROM follows WHERE follower_id = ? AND following_id = ?',
        [followerId, followingId],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });

    if (existing && existing.length > 0) {
      await new Promise((resolve, reject) => {
        db.run(
          'DELETE FROM follows WHERE follower_id = ? AND following_id = ?',
          [followerId, followingId],
          function(err) {
            if (err) reject(err);
            else resolve(this);
          }
        );
      });
      return { success: true, action: 'unfollowed' };
    } else {
      const id = uuidv4();
      await new Promise((resolve, reject) => {
        db.run(
          'INSERT INTO follows (id, follower_id, following_id) VALUES (?, ?, ?)',
          [id, followerId, followingId],
          function(err) {
            if (err) reject(err);
            else resolve(this);
          }
        );
      });
      return { success: true, action: 'followed' };
    }
  } catch (error) {
    console.error('Error toggling follow:', error);
    return { success: false, error: error.message };
  }
};

export const getFollowers = async (userId) => {
  try {
    const followers = await new Promise((resolve, reject) => {
      db.all(
        `SELECT f.id, f.follower_id, f.following_id, f.followed_at, 
                u.display_name as display_name
         FROM follows f
         JOIN users u ON f.follower_id = u.id
         WHERE f.following_id = ?`,
        [userId],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });
    
    return followers;
  } catch (error) {
    console.error('Error fetching followers:', error);
    throw error;
  }
};

export const getFollowing = async (userId) => {
  try {
    const following = await new Promise((resolve, reject) => {
      db.all(
        `SELECT f.id, f.follower_id, f.following_id, f.followed_at, 
          u.display_name as display_name
          FROM follows f
          JOIN users u ON f.following_id = u.id
          WHERE f.follower_id = ?`,
        [userId],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });
    
    return following;
  } catch (error) {
    console.error('Error fetching following:', error);
    throw error;
  }
};