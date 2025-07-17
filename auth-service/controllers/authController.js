const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const UserModel = require('../models/UserModel');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail');

// Controller for user signup
const signup = async (req, res) => {
    try {
        const { name, email, password, gender } = req.body;

        // Check if user exists
        const existingUser = await UserModel.findUserByEmail(email);
        if (existingUser) {
            return res.status(400).json({ message: 'Email already registered' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        await UserModel.createUser(name, email, hashedPassword, gender);

        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Controller for user login
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if user exists
        const user = await UserModel.findUserByEmail(email);
        if (!user) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        // Compare passwords
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        // Generate JWT token
        const token = jwt.sign(
            { id: user.id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.status(200).json({
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                gender: user.gender
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Controller for password reset request
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        // Check if user exists
        const user = await UserModel.findUserByEmail(email);
        if (!user) {
            return res.status(400).json({ message: 'User with this email does not exist' });
        }

        // Generate reset token (random string)
        const resetToken = crypto.randomBytes(32).toString('hex');
        const expires = new Date(Date.now() + 3600000); // 1 hour from now

        // Hash the token before saving
        const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

        // Save hashed reset token and expiration time in the database
        await UserModel.saveResetToken(email, hashedToken, expires);

        // Send reset link via email (with the plain token)
        const resetUrl = `http://localhost:5173/reset-password?token=${resetToken}`;
        const message = `You requested a password reset. Click the link below to reset your password:\n\n${resetUrl}\n\nIf you did not request this, please ignore this email.`;

        await sendEmail(email, 'Password Reset Request', message);

        res.status(200).json({ message: 'Password reset email sent' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Controller for resetting password
const resetPassword = async (req, res) => {
    try {
        const { token, newPassword } = req.body;

        // Hash the incoming token to compare safely with DB
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

        // Find user by hashed reset token
        const user = await UserModel.findUserByResetToken(hashedToken);

        // Check token validity and expiry
        if (!user || user.password_reset_expires < Date.now()) {
            return res.status(400).json({ message: 'Invalid or expired reset token' });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update password and clear reset token and expiry
        await UserModel.updatePasswordAndClearToken(user.id, hashedPassword);

        res.status(200).json({ message: 'Password has been reset successfully' });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Controller for getting user profile
const getProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await UserModel.findUserById(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({
            message: 'User profile data',
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                gender: user.gender
            }
        });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { signup, login, forgotPassword, resetPassword, getProfile };

// Export the controllers
module.exports = { signup, login, forgotPassword, resetPassword, getProfile };
