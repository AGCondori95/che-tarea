const jwt = require("jsonwebtoken");

const generateToken = (userId) => {
  // Validación de entrada
  if (!userId) {
    throw new Error("userId es requerido para generar el token");
  }

  // Validación de variables de entorno
  if (!process.env.JWT_SECRET) {
    throw new Error(
      "JWT_SECRET no está configurado en las variables de entorno",
    );
  }

  if (!process.env.JWT_EXPIRE) {
    throw new Error(
      "JWT_EXPIRE no está configurado en las variables de entorno",
    );
  }

  return jwt.sign({id: userId}, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

module.exports = generateToken;
