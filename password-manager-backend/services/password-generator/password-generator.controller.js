const generatePassword = (req, res) => {
  const { length = 12, useUppercase = true, useNumbers = true, useSymbols = true } = req.body;

  // Caracteres permitidos
  const lowercaseLetters = 'abcdefghijklmnopqrstuvwxyz';
  const uppercaseLetters = useUppercase ? 'ABCDEFGHIJKLMNOPQRSTUVWXYZ' : '';
  const numbers = useNumbers ? '0123456789' : '';
  const symbols = useSymbols ? '!@#$%^&*()_+-=[]{}|;:,.<>?' : '';

  // Combinar todos los caracteres permitidos
  const allCharacters = lowercaseLetters + uppercaseLetters + numbers + symbols;

  // Generar la contraseña
  let password = '';
  for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * allCharacters.length);
      password += allCharacters[randomIndex];
  }

  // Responder con la contraseña generada
  res.status(200).json({ password });
};

module.exports = { generatePassword };