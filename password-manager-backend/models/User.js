const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

/**
 * Esquema de Mongoose para usuarios del sistema.
 *
 * Este modelo almacena el nombre de usuario, contraseña cifrada, 
 * pregunta de seguridad y su respuesta (también cifrada). 
 * Antes de guardar, se aplica hashing con bcrypt a los campos sensibles.
 *
 * @typedef {Object} User
 * @property {string} username - Nombre de usuario único.
 * @property {string} password - Contraseña del usuario (almacenada de forma cifrada).
 * @property {string} securityQuestion - Pregunta de seguridad elegida por el usuario.
 * @property {string} securityAnswer - Respuesta cifrada a la pregunta de seguridad.
 */

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    securityQuestion: { type: String, required: true },
    securityAnswer: { type: String, required: true }
});

// Middleware para encriptar la contraseña y respuesta de seguridad
userSchema.pre('save', async function (next) {
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 10);
    }
    
    if (this.isModified('securityAnswer')) {
        this.securityAnswer = await bcrypt.hash(this.securityAnswer.toLowerCase(), 10);
    }
    
    next();
});

module.exports = mongoose.model('User', userSchema);