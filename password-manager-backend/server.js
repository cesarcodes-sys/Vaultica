const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./services/auth/auth.routes');
const passwordRoutes = require('./services/passwords/passwords.routes');
const passwordGeneratorRoutes = require('./services/password-generator/password-generator.routes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/passwords', passwordRoutes);
app.use('/api/password-generator', passwordGeneratorRoutes);

// Conexión a MongoDB (usa variables de entorno)
const DB_URL = process.env.DB_URL || 'mongodb://localhost:27017/password-manager';

mongoose.connect(DB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('Conectado a MongoDB'))
.catch(err => console.error('Error de conexión a MongoDB:', err));

// Iniciar servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});