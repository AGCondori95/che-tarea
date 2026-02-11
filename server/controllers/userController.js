const User = require("../models/User");
const bcrypt = require("bcryptjs");

/**
 * @desc    Obtener todos los usuarios
 * @route   GET /api/users
 * @access  Private/Admin
 */
const getUsers = async (req, res) => {
  try {
    const {search, role, isActive} = req.query;

    let filter = {};

    // Filtro de búsqueda por nombre o email
    if (search) {
      filter.$or = [
        {name: {$regex: search, $options: "i"}},
        {email: {$regex: search, $options: "i"}},
      ];
    }

    if (role) filter.role = role;
    if (isActive !== undefined) filter.isActive = isActive === "true";

    const users = await User.find(filter)
      .select("-password")
      .populate("defaultTag", "name color")
      .sort({createdAt: -1});

    res.status(200).json({success: true, count: users.length, data: users});
  } catch (error) {
    console.error("Error al obtener usuarios:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener usuarios",
      error: error.message,
    });
  }
};

/**
 * @desc    Obtener usuario por ID
 * @route   GET /api/users/:id
 * @access  Private/Admin
 */
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select("-password")
      .populate("defaultTag", "name color");

    if (!user) {
      return res
        .status(404)
        .json({success: false, message: "Usuario no encontrado"});
    }

    res.status(200).json({success: true, data: user});
  } catch (error) {
    console.error("Error al obtener usuario:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener usuario",
      error: error.message,
    });
  }
};

/**
 * @desc    Crear nuevo usuario (Invitación)
 * @route   POST /api/users
 * @access  Private/Admin
 */
const createUser = async (req, res) => {
  try {
    const {name, email, password, role} = req.body;

    // Validar campos requeridos
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Por favor completa todos los campos obligatorios",
      });
    }

    // Validar longitud de contraseña
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "La contraseña sebe tener al menos 6 caracteres",
      });
    }

    // Verificar si el usuario ya existe
    const userExists = await User.findOne({email: email.toLowerCase()});
    if (userExists) {
      return res
        .status(400)
        .json({success: false, message: "El email ya está registrado"});
    }

    // Hash de la contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Crear usuario
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: role || "user",
    });

    res.status(201).json({
      success: true,
      message: "Usuario creado exitosamente",
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    console.error("Error al crear usuario:", error);

    // Manejar error de email duplicado
    if (error.code === 11000) {
      return res
        .status(400)
        .json({success: false, message: "El email ya está registrado"});
    }

    res.status(500).json({
      success: false,
      message: "Error al crear usuario",
      error: error.message,
    });
  }
};

/**
 * @desc    Actualizar usuario
 * @route   PUT /api/users/:id
 * @access  Private/Admin
 */
const updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res
        .status(404)
        .json({success: false, message: "Usuario no encontrado"});
    }

    const {name, email, role, isActive, avatar, defaultTag} = req.body;

    // Actualizar campos
    if (name) user.name = name;

    if (email) {
      // Verificar si el nuevo email ya existe
      const emailExists = await User.findOne({
        email: email.toLowerCase(),
        _id: {$ne: user._id},
      });

      if (emailExists) {
        return res
          .status(400)
          .json({success: false, message: "El email ya está en uso"});
      }

      user.email = email.toLowerCase();
    }

    if (role) user.role = role;
    if (isActive !== undefined) user.isActive = isActive;
    if (avatar !== undefined) user.avatar = avatar;
    if (defaultTag !== undefined) user.defaultTag = defaultTag;

    await user.save();

    res.status(200).json({
      success: false,
      message: "Usuario actualizado exitosamente",
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        avatar: user.avatar,
        defaultTag: user.defaultTag,
      },
    });
  } catch (error) {
    console.error("Error al actualizar usuario:", error);

    // Manejar error de email duplicado
    if (error.code === 11000) {
      return res
        .status(400)
        .json({success: false, message: "El email ya está registrado"});
    }

    res.status(500).json({
      success: false,
      message: "Error al actualizar usuario",
      error: error.message,
    });
  }
};

/**
 * @desc    Eliminar usuario (desactivar)
 * @route   DELETE /api/users/:id
 * @access  Private/Admin
 */
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res
        .status(404)
        .json({success: false, message: "Usuario no encontrado"});
    }

    // No permitir que un admin se elimine a sí mismo
    if (user._id.toString() === req.user._id.toString()) {
      return res
        .status(400)
        .json({success: false, message: "No puedes eliminar tu propia cuenta"});
    }

    // Desactivar usuario en lugar de eliminarlo
    user.isActive = false;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Usuario desactivado exitosamente",
      data: {},
    });
  } catch (error) {
    console.error("Error al eliminar usuario:", error);
    res.status(500).json({
      success: false,
      message: "Error al eliminar usuario",
      error: error.message,
    });
  }
};

/**
 * @desc    Restablecer contraseña de usuario
 * @route   PUT /api/users/:id/reset-password
 * @access  Private/Admin
 */
const resetUserPassword = async (req, res) => {
  try {
    const {newPassword} = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "La contraseña debe tener al menos 6 caracteres",
      });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res
        .status(404)
        .json({success: false, message: "Usuario no encontrado"});
    }

    // Hash de la nueva contraseña
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    await user.save();

    res
      .status(200)
      .json({success: true, message: "Contraseña restablecida exitosamente"});
  } catch (error) {
    console.error("Error al eliminar usuario:", error);
    res.status(500).json({
      success: false,
      message: "Error al eliminar usuario",
      error: error.message,
    });
  }
};

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  resetUserPassword,
};
