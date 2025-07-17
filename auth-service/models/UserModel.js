const db = require('../config/db');

// Create a new user
const createUser = async (name, email, password, gender) => {
  const [result] = await db.query(
    'INSERT INTO users (name, email, password, gender) VALUES (?, ?, ?, ?)',
    [name, email, password, gender]
  );
  return result;
};

// Find a user by email
const findUserByEmail = async (email) => {
  const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
  return rows[0];
};

// Find a user by ID
const findUserById = async (id) => {
  const [rows] = await db.query('SELECT * FROM users WHERE id = ?', [id]);
  return rows[0];
};

// Update password for a user (used in password reset)
const updateUserPassword = async (email, hashedPassword) => {
  const [result] = await db.query(
    'UPDATE users SET password = ? WHERE email = ?',
    [hashedPassword, email]
  );
  return result;
};

// Save reset token and expiration time
const saveResetToken = async (email, token, expires) => {
    const [result] = await db.query(
        'UPDATE users SET password_reset_token = ?, password_reset_expires = ? WHERE email = ?',
        [token, expires, email]
    );
    return result;
};

// Find user by reset token
const findUserByResetToken = async (token) => {
    const [rows] = await db.query(
        'SELECT * FROM users WHERE password_reset_token = ?',
        [token]
    );
    return rows[0];
};

// Update password and clear reset token and expiry
const updatePasswordAndClearToken = async (id, hashedPassword) => {
    await db.query(
        'UPDATE users SET password = ?, password_reset_token = NULL, password_reset_expires = NULL WHERE id = ?',
        [hashedPassword, id]
    );    
};

module.exports = {
  createUser,
  findUserByEmail,
  findUserById,
  updateUserPassword,
  saveResetToken,
  findUserByResetToken,
  updatePasswordAndClearToken
};
