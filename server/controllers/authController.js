const User = require("../models/User");
const Tag = require("../models/Tag");
const bcrypt = require("bcryptjs");
const generateToken = require("../utils/generateToken");

/**
 * @desc    Registrar nuevo usuario
 * @route   POST /api/auth/register
 * @access  Public
 */
const register = async (req, res) => {
  try {
    const {name, email, password, role} = req.body;

    // Validar campos requeridos
    if (!name || !email || !password) {
      return res
        .status(400)
        .json({success: false, message: "Por favor completa todos los campos"});
    }

    // Validar longitud de contraseña
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "La contraseña debe tener al menos 6 caracteres",
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
      role: role || "user", // Por defecto 'user', puede ser 'admin'
    });

    // Generar token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: "Usuario registrado exitosamente",
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        token,
      },
    });
  } catch (error) {
    console.error("Error en registro:", error);

    // Manejar error de email duplicado (índice único)
    if (error.code === 11000) {
      return res
        .status(400)
        .json({success: false, message: "El email ya está registrado"});
    }

    res.status(500).json({
      success: false,
      message: "Error al registrar usuario",
      error: error.message,
    });
  }
};

/**
 * @desc    Login de usuario
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res) => {
  try {
    const {email, password} = req.body;

    // Validar campos
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Por favor ingresa email y contraseña",
      });
    }

    // Buscar usuario (incluir password para comparar)
    const user = await User.findOne({email: email.toLowerCase()}).select(
      "+password",
    );

    if (!user) {
      return res
        .status(401)
        .json({success: false, message: "Credenciales inválidas"});
    }

    // Verificar si ei el usuario está activo ANTES de validar contraseña
    if (!user.isActive) {
      return res
        .status(401)
        .json({success: false, message: "Credenciales inválidas"});
    }

    // Verificar contraseña
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res
        .status(401)
        .json({success: false, message: "Credenciales inválidas"});
    }

    // Generar token
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: "Login exitoso",
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        emailNotifications: user.emailNotifications,
        appNotifications: user.appNotifications,
        token,
      },
    });
  } catch (error) {
    console.error("Error en login", error);
    res.status(500).json({
      success: false,
      message: "Error al iniciar sesión",
      error: error.message,
    });
  }
};

/**
 * @desc    Obtener usuario actual
 * @route   GET /api/auth/me
 * @access  Private
 */
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate("defaultTag");

    if (!user) {
      return res
        .status(404)
        .json({success: false, message: "Usuario no encontrado"});
    }

    res.status(200).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        defaultTag: user.defaultTag,
        emailNotifications: user.emailNotifications,
        appNotifications: user.appNotifications,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("Error al obtener usuario:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener información del usuario",
      error: error.message,
    });
  }
};

/**
 * @desc    Actualizar perfil de usuario
 * @route   PUT /api/auth/profile
 * @access  Provate
 */
const updateProfile = async (req, res) => {
  try {
    const {name, avatar, defaultTag, emailNotifications, appNotifications} =
      req.body;

    const user = await User.findById(req.user._id);

    if (!user) {
      return res
        .status(404)
        .json({success: false, message: "Usuario no encontrado"});
    }

    // Actualizar campos si fueron proporcionados
    if (name) user.name = name;
    if (avatar !== undefined) user.avatar = avatar;
    if (defaultTag !== undefined) user.defaultTag = defaultTag;
    if (emailNotifications !== undefined)
      user.emailNotifications = emailNotifications;
    if (appNotifications !== undefined)
      user.appNotifications = appNotifications;

    await user.save();

    res.status(200).json({
      success: true,
      message: "Perfil actualizado exitosamente",
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        defaultTag: user.defaultTag,
        emailNotifications: user.emailNotifications,
        appNotifications: user.appNotifications,
      },
    });
  } catch (error) {
    console.error("Error al actualizar perfil:", error);
    res.status(500).json({
      success: false,
      message: "Error al actualizar perfil",
      error: error.message,
    });
  }
};

/**
 * @desc    Cambiar contraseña
 * @route   PUT /api/auth/change-password
 * @access  Private
 */
const changePassword = async (req, res) => {
  try {
    const {currentPassword, newPassword} = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Por favor proporciona la contraseña actual y la nueva",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "La nueva contraseña debe tener al menos 6 caracteres",
      });
    }

    const user = await User.findById(req.user._id).select("+password");

    if (!user) {
      return res
        .status(404)
        .json({success: false, message: "Usuario no encontrado"});
    }

    // Verificar la contraseña actual
    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password,
    );

    if (!isPasswordValid) {
      return res
        .status(401)
        .json({success: false, message: "Contraseña actual incorrecta"});
    }

    // Hash de la nueva contraseña
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    await user.save();

    res
      .status(200)
      .json({success: true, message: "Contraseña actualizada exitosamente"});
  } catch (error) {
    console.error("Error al cambiar contraseña:", error);
    res.status(500).json({
      success: false,
      message: "Error al cambiar contraseña",
      error: error.message,
    });
  }
};

module.exports = {register, login, getMe, updateProfile, changePassword};
