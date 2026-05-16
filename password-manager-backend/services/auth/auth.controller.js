const User = require('../../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Registrar un nuevo usuario
const register = async (req, res) => {
    const { username, password, securityQuestion, securityAnswer } = req.body;

    try {
        // Validaciones
        if (!username || !password || !securityQuestion || !securityAnswer) {
            return res.status(400).json({ 
                message: 'Todos los campos son obligatorios' 
            });
        }

        if (password.length < 3) {
            return res.status(400).json({ 
                message: 'La contraseña debe tener al menos 3 caracteres' 
            });
        }

        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ 
                message: 'El usuario ya existe' 
            });
        }

        // Crear usuario (el pre-save hook se encargará del hashing)
        const user = new User({
            username,
            password,
            securityQuestion,
            securityAnswer: securityAnswer.toLowerCase() // Normalizamos a minúsculas
        });

        await user.save();
        res.status(201).json({ 
            message: 'Usuario registrado correctamente' 
        });
    } catch (error) {
        console.error("Error en registro:", error);
        res.status(500).json({ 
            message: 'Error al registrar el usuario', 
            error: error.message 
        });
    }
};

// Login
const login = async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(400).json({ 
                message: 'Credenciales inválidas' 
            });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ 
                message: 'Credenciales inválidas' 
            });
        }

        const token = jwt.sign({ userId: user._id }, 'secretkey', { expiresIn: '1h' });
        res.status(200).json({ 
            token,
            username: user.username
        });
    } catch (error) {
        console.error('Error en el login:', error);
        res.status(500).json({ 
            message: 'Error al hacer login', 
            error: error.message 
        });
    }
};

// Recuperar contraseña - Paso 1: Obtener pregunta de seguridad
const getSecurityQuestion = async (req, res) => {
    const { username } = req.body;

    try {
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(404).json({ 
                message: 'Usuario no encontrado' 
            });
        }

        res.json({ 
            securityQuestion: user.securityQuestion 
        });
    } catch (error) {
        console.error('Error al obtener pregunta:', error);
        res.status(500).json({ 
            message: 'Error al procesar la solicitud', 
            error: error.message 
        });
    }
};

// Recuperar contraseña - Paso 2: Verificar respuesta y cambiar contraseña
const verifyAndResetPassword = async (req, res) => {
    const { username, securityAnswer, newPassword } = req.body;

    try {
        // Validaciones básicas
        if (!newPassword || newPassword.length < 3) {
            return res.status(400).json({ 
                message: 'La nueva contraseña debe tener al menos 3 caracteres' 
            });
        }

        const user = await User.findOne({ username });
        if (!user) {
            return res.status(404).json({ 
                message: 'Usuario no encontrado' 
            });
        }

        // Verificar respuesta de seguridad
        const isAnswerCorrect = await bcrypt.compare(
            securityAnswer.toLowerCase(),
            user.securityAnswer
        );

        if (!isAnswerCorrect) {
            return res.status(401).json({ 
                message: 'Respuesta de seguridad incorrecta' 
            });
        }

        // Actualizar contraseña (el pre-save hook hasheará la nueva contraseña)
        user.password = newPassword;
        await user.save();

        res.json({ 
            message: 'Contraseña actualizada correctamente' 
        });
    } catch (error) {
        console.error('Error al resetear contraseña:', error);
        res.status(500).json({ 
            message: 'Error al actualizar la contraseña', 
            error: error.message 
        });
    }
};

module.exports = { 
    register, 
    login,
    getSecurityQuestion,
    verifyAndResetPassword
};