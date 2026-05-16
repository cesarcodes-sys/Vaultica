const mongoose = require('mongoose');

/**
 * Esquema de Mongoose para almacenar contraseñas cifradas de diferentes servicios.
 *
 * Cada documento representa una contraseña asociada a un usuario para un servicio específico,
 * junto con el IV necesario para el proceso de descifrado.
 *
 * @typedef {Object} Password
 * @property {mongoose.ObjectId} userId - Referencia al usuario propietario de la contraseña.
 * @property {string} service - Nombre del servicio al que pertenece la contraseña (e.g., Gmail, Facebook).
 * @property {string} password - Contraseña cifrada del servicio.
 * @property {string} iv - Vector de inicialización utilizado para el cifrado.
 * @property {Date} createdAt - Fecha de creación del registro (agregado automáticamente por timestamps).
 * @property {Date} updatedAt - Fecha de la última actualización del registro.
 */

const PasswordSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    service: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    iv: {
        type: String,
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Password', PasswordSchema);