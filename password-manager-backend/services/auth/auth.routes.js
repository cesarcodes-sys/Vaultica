const express = require('express');
const router = express.Router();
const { 
    register, 
    login,
    getSecurityQuestion,
    verifyAndResetPassword
} = require('./auth.controller');

// Registro y login
router.post('/register', register);
router.post('/login', login);

// Recuperación de contraseña
router.post('/get-security-question', getSecurityQuestion);
router.post('/reset-password', verifyAndResetPassword);

module.exports = router;