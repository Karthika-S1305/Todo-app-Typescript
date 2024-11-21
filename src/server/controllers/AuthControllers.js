const User = require('../model/UserModel');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const { generateAccessToken, generateRefreshToken } = require('../utils/Jwt');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs')

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
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const otp = crypto.randomInt(100000, 999999).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    user.otp = otp;
    user.otpExpiry = otpExpiry;
    await user.save();

    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: 'karthika8849@gmail.com',
        pass: 'obslhxqqcuacpbxg',
      },
    });

    await transporter.sendMail({
      to: email,
      subject: 'OTP for Password Reset',
      text: `OTP is ${otp}. It is valid for 10 minutes.`,
    });

    res.json({ success: true, message: 'OTP sent to your email' });
  } catch (error) {
    console.error('Error in forgot-password:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

const verifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.otp !== otp || user.otpExpiry < Date.now()) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
    }

    res.json({ success: true, message: 'OTP verified' });
  } catch (error) {
    console.error('Error in verify-otp:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};


const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.otp !== otp || user.otpExpiry < Date.now()) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
    }

    user.password = newPassword;
    user.otp = null;
    user.otpExpiry = null;
    await user.save();

    res.json({ success: true, message: 'Password reset successfully' });
  } catch (error) {
    console.error('Error in reset-password:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
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
  verifyOtp,
  resetPassword,
  refreshToken, 
};