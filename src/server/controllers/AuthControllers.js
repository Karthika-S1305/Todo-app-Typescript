const User = require('../model/UserModel');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const { generateAccessToken, generateRefreshToken } = require('../utils/Jwt');
const jwt = require('jsonwebtoken');

// Register User
const registerUser = async (req, res) => {
  const { name, email, password } = req.body; 

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({ name, email, password });

    if (user) {
      return res.status(201).json({ success: true, message: 'User registered successfully!' });    }
     else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Registration failed.' });
  }
};

// Login User
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      const accessToken = generateAccessToken(user._id);
      const refreshToken = generateRefreshToken(user._id);
      return res.status(200).json({
        success: true,
        message: 'Login successful!',
        accessToken,
        refreshToken,
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid credentials.' });

  }
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: 'No account with that email address exists' });
    }

    // Generate reset token
    const token = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000; 

    // Save user with the reset token and expiration
    await user.save();

    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: 'karthika8849@gmail.com',
        pass: 'hubnsjawtqsxcpli', 
      },
    });

    const mailOptions = {
      to: user.email,
      from: 'karthika8849@gmail.com',
      subject: 'Password Reset',
      text: `You are receiving this because you requested a password reset.
             Click this link to reset your password: 
             http://localhost:3000/api/reset-password/${token}`
    };

    await transporter.sendMail(mailOptions);
    res.json({ message: 'Password reset email sent' });
  } catch (error) {
    console.error('Error during password reset request:', error.message);
    res.status(500).json({ message: 'Error occurred. Please try again.' });
  }
};


const resetPassword = async (req, res) => {
  const { password } = req.body;
  const { token } = req.params;

  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

  if (!passwordRegex.test(password)) {
    return res.status(400).json({
      message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, one special character, and be at least 8 characters long.',
    });
  }

  try {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() } 
    });

    if (!user) {
      return res.status(400).json({ message: 'Password reset token is invalid or has expired' });
    }

    user.password = password;

    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save(); 

    res.json({ message: 'Password reset successfully. You can now log in with your new password.' });
  } catch (error) {
    console.error('Error resetting password:', error.message);
    res.status(500).json({ message: 'Error occurred during password reset.' });
  }
};

// Refresh Token Handler
const refreshToken = (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(401).json({ message: "No refresh token provided" });
  }
  jwt.verify(token, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: "Invalid refresh token" });
    }
    const newAccessToken = generateAccessToken(decoded.id);
    console.log(newAccessToken);
    res.json({ message: "New access token generated" });
  });
};




module.exports = {
  registerUser, 
  loginUser,
  forgotPassword, 
  resetPassword,
  refreshToken, 
};