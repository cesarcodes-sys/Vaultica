const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// Configura una clave de encriptación segura (debe ser configurada en las variables de entorno)
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || '!?i2=mz<uY]AD^iHZ6c>63t}y4uE_z)#';
const IV_LENGTH = 16; // Para AES, el vector de inicialización es siempre 16 bytes
const ENCRYPTION_ALGORITHM = 'aes-256-cbc';

// RSA Config (rutas donde guardes tus llaves)
const PUBLIC_KEY_PATH = path.join(__dirname, '../../keys/public.pem');
const PRIVATE_KEY_PATH = path.join(__dirname, '../../keys/private.pem');

// Cargar claves RSA
const PUBLIC_KEY = fs.readFileSync(PUBLIC_KEY_PATH, 'utf8');
const PRIVATE_KEY = fs.readFileSync(PRIVATE_KEY_PATH, 'utf8');

class EncryptionService {
    // Encriptar contraseña AES
    static encrypt(text) {
        try {
            // Generar un vector de inicialización aleatorio
            const iv = crypto.randomBytes(IV_LENGTH);
            
            // Crear un hash de la clave para asegurar que tenga la longitud correcta
            const key = crypto.createHash('sha256').update(ENCRYPTION_KEY).digest();
            
            // Crear el cifrador
            const cipher = crypto.createCipheriv(ENCRYPTION_ALGORITHM, key, iv);
            
            // Encriptar el texto
            let encrypted = cipher.update(text, 'utf8', 'hex');
            encrypted += cipher.final('hex');
            
            // Devolver el IV y el texto encriptado
            return {
                iv: iv.toString('hex'),
                content: encrypted
            };
        } catch (error) {
            console.error('Error al encriptar:', error);
            throw new Error('Error de encriptación');
        }
    }

    // Desencriptar contraseña AES
    static decrypt(encryption) {
        try {
            // Convertir el IV de hex a buffer
            const iv = Buffer.from(encryption.iv, 'hex');
            
            // Crear un hash de la clave para asegurar que tenga la longitud correcta
            const key = crypto.createHash('sha256').update(ENCRYPTION_KEY).digest();
            
            // Crear el descifrador
            const decipher = crypto.createDecipheriv(ENCRYPTION_ALGORITHM, key, iv);
            
            // Desencriptar el texto
            let decrypted = decipher.update(encryption.content, 'hex', 'utf8');
            decrypted += decipher.final('utf8');
            
            return decrypted;
        } catch (error) {
            console.error('Error al desencriptar:', error);
            throw new Error('Error de desencriptación');
        }
    }

    // RSA - Encriptar con clave pública
    static encryptWithRSA(data) {
        try {
            const bufferData = Buffer.from(data, 'utf8');
            const encrypted = crypto.publicEncrypt(PUBLIC_KEY, bufferData);
            return encrypted.toString('base64'); // Codificamos en base64 para almacenar
        } catch (error) {
            console.error('Error al encriptar con RSA:', error);
            throw new Error('Error de encriptación RSA');
        }
    }

    // RSA - Desencriptar con clave privada
    static decryptWithRSA(encryptedData) {
        try {
            const bufferData = Buffer.from(encryptedData, 'base64');
            const decrypted = crypto.privateDecrypt(PRIVATE_KEY, bufferData);
            return decrypted.toString('utf8');
        } catch (error) {
            console.error('Error al desencriptar con RSA:', error);
            throw new Error('Error de desencriptación RSA');
        }
    }
}

module.exports = EncryptionService;