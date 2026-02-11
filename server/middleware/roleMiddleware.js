// Verificar si el usuario es Admin
const isAdmin = (req, res, next) => {
  // Validar que req.user existe (debe venir del middleware protect)
  if (!req.user) {
    return res
      .status(401)
      .json({success: false, message: "Usuario no autenticado"});
  }

  if (req.user.role === "admin") {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: "Acceso denegado. Se requieren permisos de administrador.",
    });
  }
};

// Verificar si el usuario es el propietario del recurso o es admin
const isOwnerOrAdmin = (resourceUserId) => {
  return (req, res, next) => {
    // Validar que req.user existe
    if (!req.user) {
      return res
        .status(401)
        .json({success: false, message: "Usuario no encontrado"});
    }

    // Varidar que resourceUserId existe
    if (!resourceUserId) {
      return res
        .status(400)
        .json({success: false, message: "ID de recurso no proporcionado"});
    }

    // Comparar IDs de forma segura
    const isAdmin = req.user.role === "admin";
    const isOwner = req.user._id.toString() === resourceUserId.toString();

    if (isAdmin || isOwner) {
      next();
    } else {
      res.status(403).json({
        success: false,
        message: "Acceso denegado. No tienes permisos para este recurso.",
      });
    }
  };
};

module.exports = {isAdmin, isOwnerOrAdmin};
