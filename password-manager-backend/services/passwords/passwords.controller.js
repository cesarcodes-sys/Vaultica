const Password = require('../../models/Password');
const EncryptionService = require('./encryption.service');

// Agregar una contraseña
const addPassword = async (req, res) => {
    const userId = req.user.userId; 
    const { service, password } = req.body;

    try {
        // Encriptar la contraseña
        const encryptedPassword = EncryptionService.encrypt(password);

        // Crear una nueva contraseña
        const newPassword = new Password({
            userId,
            service,
            password: encryptedPassword.content,
            iv: encryptedPassword.iv
        });

        // Guardar en la base de datos
        await newPassword.save();

        // Responder con éxito
        res.status(201).json({ message: 'Contraseña agregada correctamente', newPassword });
    } catch (error) {
        res.status(500).json({ message: 'Error al agregar la contraseña', error: error.message });
    }
};

// Obtener todas las contraseñas de un usuario
const getPasswords = async (req, res) => {
    const userId = req.user.userId;

    try {
        // Buscar todas las contraseñas asociadas al usuario
        const passwords = await Password.find({ userId });

        // Responder con las contraseñas
        res.status(200).json(passwords);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener las contraseñas', error: error.message });
    }
};

// Actualizar una contraseña
const updatePassword = async (req, res) => {
    const { id } = req.params;
    const { service, password } = req.body;

    try {
        // Buscar la contraseña por su ID
        const existingPassword = await Password.findById(id);

        if (!existingPassword) {
            return res.status(404).json({ message: 'Contraseña no encontrada' });
        }

        // Encriptar la nueva contraseña
        const encryptedPassword = EncryptionService.encrypt(password);

        // Actualizar la contraseña
        existingPassword.service = service || existingPassword.service;
        existingPassword.password = encryptedPassword.content;
        existingPassword.iv = encryptedPassword.iv;

        // Guardar los cambios
        await existingPassword.save();

        // Responder con éxito
        res.status(200).json({ message: 'Contraseña actualizada correctamente', updatedPassword: existingPassword });
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar la contraseña', error: error.message });
    }
};

// Eliminar una contraseña por su ID
const deletePassword = async (req, res) => {
    const { id } = req.params;

    try {
        // Buscar y eliminar la contraseña
        const deletedPassword = await Password.findByIdAndDelete(id);

        if (!deletedPassword) {
            return res.status(404).json({ message: 'Contraseña no encontrada' });
        }

        // Responder con éxito
        res.status(200).json({ message: 'Contraseña eliminada correctamente', deletedPassword });
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar la contraseña', error: error.message });
    }
};

// Descifrar una contraseña específica
const decryptPassword = async (req, res) => {
    const { id } = req.params;
    const userId = req.user.userId;

    try {
        // Buscar la contraseña por su ID y verificar que pertenece al usuario
        const passwordEntry = await Password.findOne({ _id: id, userId });

        if (!passwordEntry) {
            return res.status(404).json({ message: 'Contraseña no encontrada' });
        }

        // Descifrar la contraseña
        const decryptedPassword = EncryptionService.decrypt({
            iv: passwordEntry.iv,
            content: passwordEntry.password
        });

        // Devolver la contraseña descifrada
        res.status(200).json({ password: decryptedPassword });

    } catch (error) {
        res.status(500).json({ message: 'Error al descifrar la contraseña', error: error.message });
    }
};

module.exports = { 
    addPassword, 
    getPasswords, 
    updatePassword, 
    deletePassword,
    decryptPassword 
};