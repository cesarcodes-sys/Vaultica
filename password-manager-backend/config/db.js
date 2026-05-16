const mongoose = require('mongoose');

/**
 * Establece la conexión a la base de datos MongoDB.
 *
 * Usa mongoose para conectarse a una base local en el puerto 27017
 * con la base de datos llamada 'password-manager'. En caso de error,
 * muestra el mensaje en consola y termina el proceso con código 1.
 *
 * @async
 * @function connectDB
 * @returns {Promise<void>} No retorna ningún valor, pero lanza errores si la conexión falla.
 */

const connectDB = async () => {
    try {
        await mongoose.connect('mongodb://localhost:27017/password-manager', {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        });
        console.log('MongoDB connected successfully');
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1); // Salir del proceso con un código de error
    }
};

module.exports = connectDB;