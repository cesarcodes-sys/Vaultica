const jwt = require('jsonwebtoken');

/**
 * Middleware para autenticar tokens JWT en las solicitudes HTTP.
 * 
 * Este middleware verifica si la cabecera `Authorization` contiene un token válido.
 * Si el token es válido, se extrae la información y se almacena en `req.user`.
 * Si no hay token o es inválido, se responde con el estado correspondiente.
 * 
 * @param {Object} req - Objeto de solicitud HTTP de Express.
 * @param {Object} res - Objeto de respuesta HTTP de Express.
 * @param {Function} next - Función que pasa el control al siguiente middleware.
 */


function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.sendStatus(401); // No autorizado

    jwt.verify(token, 'secretkey', (err, decoded) => {
        if (err) return res.sendStatus(403); // Token inválido o expirado
        req.user = decoded; // Aquí se guarda la información extraída del token
        next();
    });
}

module.exports = authenticateToken;
