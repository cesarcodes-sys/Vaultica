const express = require('express');
const router = express.Router();
const { generatePassword } = require('./password-generator.controller');

// Ruta para generar una contraseña
router.post('/', generatePassword);

module.exports = router;