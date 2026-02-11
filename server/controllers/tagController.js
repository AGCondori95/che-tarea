const Tag = require("../models/Tag");

/**
 * @desc    Obtener todas las etiquetas
 * @route   GET /api/tags
 * @access  Private
 */
const getTags = async (req, res) => {
  try {
    // Los usuarios pueden ver sus propias etiquetas o las predeterminadas
    let filter = {};

    if (req.user.role !== "admin") {
      filter.$or = [{createdBy: req.user._id}, {isDefault: true}];
    }

    const tags = await Tag.find(filter)
      .populate("createdBy", "name email")
      .sort({createdAt: -1});

    res.status(200).json({success: true, count: tags.length, data: tags});
  } catch (error) {
    console.error("Error al obtener etiquetas:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener etiquetas",
      error: error.message,
    });
  }
};

/**
 * @desc    Obtener etiqueta por ID
 * @route   GET /api/tags/:id
 * @access  Private
 */
const getTagById = async (req, res) => {
  try {
    const tag = await Tag.findById(req.params.id).populate(
      "createdBy",
      "name email",
    );

    if (!tag) {
      return res
        .status(404)
        .json({success: false, message: "Etiqueta no encontrada"});
    }

    // Verificar permisos: solo el creador, admin o si es default
    if (
      req.user.role !== "admin" &&
      tag.createdBy._id.toString() !== req.user._id.toString() &&
      !tag.isDefault
    ) {
      return res.status(403).json({
        success: false,
        message: "No tienes permiso para ver esta etiqueta",
      });
    }

    res.status(200).json({success: true, data: tag});
  } catch (error) {
    console.error("Error al obtener etiqueta:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener etiqueta",
      error: error.message,
    });
  }
};

/**
 * @desc    Crear nueva etiqueta
 * @route   POST /api/tags
 * @access  Private
 */
const createTag = async (req, res) => {
  try {
    const {name, color, isDefault} = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "El nombre de la etiqueta es obligatoria",
      });
    }

    // Verificar si ya existe una etiqueta con el mismo nombre para este usuario
    const existingTag = await Tag.findOne({
      name: name.trim(),
      createdBy: req.user._id,
    });

    if (existingTag) {
      return res.status(400).json({
        success: false,
        message: "Ya tienes una etiqueta con este nombre",
      });
    }

    // Solo admins pueden crear etiquetas predeterminadas
    const tagData = {
      name: name.trim(),
      color: color || "#2563eb",
      createdBy: req.user._id,
      isDefault: req.user.role === "admin" && isDefault ? true : false,
    };

    const tag = await Tag.create(tagData);
    await tag.populate("createdBy", "name email");

    res.status(201).json({
      success: true,
      message: "Etiqueta creada exitosamente",
      data: tag,
    });
  } catch (error) {
    console.error("Error al crear etiqueta:", error);

    // Error de duplicado por índice único
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Ya existe una etiqueta con ese nombre",
      });
    }

    res.status(500).json({
      success: false,
      message: "Error al crear etiqueta",
      error: error.message,
    });
  }
};

/**
 * @desc    Actualizar etiqueta
 * @route   PUT /api/tags/:id
 * @access  Private
 */
const updateTag = async (req, res) => {
  try {
    const tag = await Tag.findById(req.params.id);

    if (!tag) {
      return res
        .status(404)
        .json({success: false, message: "Etiqueta no encontrada"});
    }

    // Solo el creador o admin pueden actualizar
    if (
      req.user.role !== "admin" &&
      tag.createdBy.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "No tienes permiso para actualizar esta etiqueta",
      });
    }

    const {name, color, isDefault} = req.body;

    if (name) {
      const trimmedName = name.trim();
      if (!trimmedName) {
        return res
          .status(400)
          .json({success: false, message: "El nombre no puede estar vacío"});
      }
      tag.name = trimmedName;
    }

    if (color) tag.color = color;

    // Solo admin puede cambiar isDefault
    if (req.user.role === "admin" && isDefault !== undefined) {
      tag.isDefault = isDefault;
    }

    await tag.save();

    res.status(200).json({
      success: true,
      message: "Etiqueta actualizada exitosamente",
      data: tag,
    });
  } catch (error) {
    console.error("Error al actualizar etiqueta:", error);

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Ya existe una etiqueta con ese nombre",
      });
    }

    res.status(500).json({
      success: false,
      message: "Error al actualizar etiqueta",
      error: error.message,
    });
  }
};

/**
 * @desc    Eliminar etiqueta
 * @route   DELETE /api/tags/:id
 * @access  Private
 */
const deleteTag = async (req, res) => {
  try {
    const tag = await Tag.findById(req.params.id);

    if (!tag) {
      return res
        .status(404)
        .json({success: false, message: "Etiqueta no encontrada"});
    }

    // Solo el creador o admin pueden eliminar
    if (
      req.user.role !== "admin" &&
      tag.createdBy.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "No tienes permiso para eliminar esta etiqueta",
      });
    }

    // No permitir eliminar etiquetas predeterminadas
    if (tag.isDefault && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "No puedes eliminar etiquetas predeterminadas",
      });
    }

    await tag.deleteOne();

    res.status(200).json({
      success: true,
      message: "Etiqueta eliminada exitosamente",
      data: {},
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error al eliminar etiqueta",
      error: error.message,
    });
  }
};

module.exports = {getTags, getTagById, createTag, updateTag, deleteTag};
