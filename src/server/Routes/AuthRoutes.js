const express = require('express');
const { registerUser, loginUser, forgotPassword, resetPassword, refreshToken, verifyOtp} = require('../controllers/AuthControllers');
const { protect } = require('../middleware/Middleware');

const router = express.Router();


//register
router.post('/api/register', registerUser);

//login
router.post('/api/login', loginUser);

//protected route
router.get('/api/protected-route', protect, (req, res) => {
    res.status(200).send({ message: 'Access granted to protected route', userId: req.userId });
  });

//forgot password
router.post('/api/forgot-password', forgotPassword);

router.post('/api/verify-otp', verifyOtp);

//resetpassword
router.post('/api/reset-password/', resetPassword);

//refresh token
router.post('/api/refresh-token', (req, res) => {
    const { token } = req.body;  
    refreshToken(req, res, { token });
});

module.exports = router;