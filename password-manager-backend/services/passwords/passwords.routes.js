const express = require('express');
const router = express.Router();
const { 
    addPassword, 
    getPasswords, 
    deletePassword, 
    updatePassword,
    decryptPassword // Añade esta importación
} = require('./passwords.controller');

const authenticateToken = require('../../middlewares/authenticateToken');

// Rutas protegidas por el middleware de autenticación
router.post('/', authenticateToken, addPassword);
router.get('/', authenticateToken, getPasswords);
router.put('/:id', authenticateToken, updatePassword);
router.delete('/:id', authenticateToken, deletePassword);
router.get('/:id/decrypt', authenticateToken, decryptPassword); // Nueva ruta de descifrado

module.exports = router;