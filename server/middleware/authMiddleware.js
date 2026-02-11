const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Proteger rutas - verificar JWT
const protect = async (req, res, next) => {
  let token;

  // Verificar si el token existe en los headers
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Obtener token del header
      token = req.headers.authorization.split(" ")[1];

      // Validar que JWT_SECRET esté configurado
      if (!process.env.JWT_SECRET) {
        console.error("JWT_SECRET no está configurado");
        return res.status(500).json({
          success: false,
          message: "Error de configuración del servidor",
        });
      }

      // Verificar token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Obtener usuario del token (sin password)
      req.user = await User.findById(decoded.id).select("-password");

      if (!req.user) {
        return res
          .status(401)
          .json({success: false, message: "Usuario no encontrado"});
      }

      if (!req.user.isActive) {
        return res
          .status(401)
          .json({success: false, message: "Usuario inactivo"});
      }

      next();
    } catch (error) {
      console.error("Error en autenticación:", error.message);

      // Diferenciar tipos de error JWT
      if (error.name === "TokenExpiredError") {
        return res
          .status(401)
          .json({success: false, message: "Token expirado"});
      }

      if (error.name === "JsonWebTokenError") {
        return res
          .status(401)
          .json({success: false, message: "Token inválido"});
      }

      // Error genérico
      return res.status(401).json({success: false, message: "No autorizado"});
    }
  } else {
    return res
      .status(401)
      .json({success: false, message: "No autorizado, no hay token"});
  }
};

module.exports = {protect};
