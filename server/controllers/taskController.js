const Task = require("../models/Task");
const User = require("../models/User");

/**
 * @desc    Obtener todas las tareas del usuario
 * @route   GET /api/tasks
 * @access  Private
 */
const getTasks = async (req, res) => {
  try {
    const {status, priority, assignedTo} = req.query;

    // Construir filtro
    let filter = {};

    // Los usuarios normales solo ven sus tareas asignadas o creadas
    // Los admins ven todas las tareas
    if (req.user.role !== "admin") {
      filter.$or = [{createdBy: req.user._id}, {assignedTo: req.user._id}];
    }

    // Filtros adicionales
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (assignedTo) filter.assignedTo = assignedTo;

    // No mostrar tareas archivadas por defecto
    if (!req.query.includeArchived) {
      filter.isArchived = false;
    }

    const tasks = await Task.find(filter)
      .populate("createdBy", "name email avatar")
      .populate("assignedTo", "name email avatar")
      .populate("tags", "name color")
      .populate("history.user", "name avatar")
      .populate("comments.user", "name avatar")
      .sort({createdAt: -1});

    res.status(200).json({success: true, count: tasks.length, data: tasks});
  } catch (error) {
    console.error("Error al obtener tareas:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener tareas",
      error: error.message,
    });
  }
};

/**
 * @desc    Obtener una tarea por ID
 * @route   GET /api/tasks/:id
 * @access  Private
 */
const getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate("createdBy", "name email avatar")
      .populate("assignedTo", "name email avatar")
      .populate("tags", "name color")
      .populate("history.user", "name avatar")
      .populate("comments.user", "name avatar");

    if (!task) {
      return res
        .status(404)
        .json({success: false, message: "Tarea no encontrada"});
    }

    // Verificar permisos
    const isCreator = task.createdBy._id.toString() == req.user._id.toString();
    const isAssignee =
      task.assignedTo &&
      task.assignedTo._id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";

    if (!isAdmin && !isCreator && !isAssignee) {
      return res.status(403).json({
        success: false,
        message: "No tienes permiso para ver esta tarea",
      });
    }

    res.status(200).json({success: true, data: task});
  } catch (error) {
    console.error("Error al obtener tarea:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener tarea",
      error: error.message,
    });
  }
};

/**
 * @desc    Crear nueva tarea
 * @route   POST /api/tasks
 * @access  Private
 */
const createTask = async (req, res) => {
  try {
    const {title, description, priority, tags, assignedTo, dueDate} = req.body;

    if (!title || !title.trim()) {
      return res
        .status(400)
        .json({success: false, message: "El título es obligatorio"});
    }

    // Validar que assignedTo sea un usuario válido si se proporciona
    if (assignedTo) {
      const assignedUser = await User.findById(assignedTo);
      if (!assignedUser) {
        return res
          .status(400)
          .json({success: false, message: "El usuario asignado no existe"});
      }
      if (!assignedUser.isActive) {
        return res.status(400).json({
          success: false,
          message: "No se puede asignar a un usuario inactivo",
        });
      }
    }

    // Crear tarea
    const task = await Task.create({
      title,
      description,
      priority: priority || "media",
      tags: tags || [],
      assignedTo: assignedTo || null,
      dueDate: dueDate || null,
      createdBy: req.user._id,
      history: [{action: "created", user: req.user._id, newValue: "por_hacer"}],
    });

    // Poblar los campos para la respuesta
    await task.populate("createdBy", "name email avatar");
    await task.populate("assignedTo", "name email avatar");
    await task.populate("tags", "name color");

    res
      .status(201)
      .json({success: true, message: "Tarea creada exitosamente", data: task});
  } catch (error) {
    console.error("Error al crear tarea:", error);
    res.status(500).json({
      success: false,
      message: "Error al crear tarea",
      error: error.message,
    });
  }
};

/**
 * @desc    Atualizar tarea
 * @route   PUT /api/tasks/:id
 * @access  Private
 */
const updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res
        .status(404)
        .json({success: false, message: "Tarea no encontrada"});
    }

    // Verificar permisos
    const isCreator = task.createdBy.toString() === req.user._id.toString();
    const isAssignee =
      task.assignedTo && task.assignedTo.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";

    if (!isAdmin && !isCreator && !isAssignee) {
      return res.status(403).json({
        success: false,
        message: "No tienes permiso para actualizar esta tarea",
      });
    }

    const {title, description, status, priority, tags, assignedTo, dueDate} =
      req.body;

    // Validar assignedTo si se proporciona
    if (assignedTo && assignedTo !== task.assignedTo?.toString()) {
      const assignedUser = await User.findById(assignedTo);
      if (!assignedUser) {
        return res
          .status(400)
          .json({success: false, message: "El usuario asignado no existe"});
      }
      if (!assignedUser.isActive) {
        return res.status(400).json({
          success: false,
          message: "No se puede asignar a un usuario inactivo",
        });
      }
    }

    // Registrar cambios en el historial
    if (status && status !== task.status) {
      task.history.push({
        action: "status_changed",
        user: req.user._id,
        previousValue: task.status,
        newValue: status,
      });
      task.status = status;
    }

    if (priority && priority !== task.priority) {
      task.history.push({
        action: "priority_changed",
        user: req.user._id,
        previousValue: task.priority,
        newValue: priority,
      });
      task.priority = priority;
    }

    if (assignedTo && assignedTo !== task.assignedTo?.toString()) {
      task.history.push({
        action: "assigned",
        user: req.user._id,
        newValue: assignedTo,
      });
      task.assignedTo = assignedTo;
    }

    // Actualizar campos simples
    if (title) task.title = title;
    if (description !== undefined) task.description = description;
    if (tags) task.tags = tags;
    if (dueDate !== undefined) task.dueDate = dueDate;

    await task.save();

    // Poblar para la respuesta
    await task.populate("createdBy", "name email avatar");
    await task.populate("assignedTo", "name email avatar");
    await task.populate("tags", "name color");
    await task.populate("history.user", "name avatar");

    res.status(200).json({
      success: true,
      message: "Tarea actualizada exitosamente",
      data: task,
    });
  } catch (error) {
    console.error("Error al actualizar tarea:", error);
    res.status(500).json({
      success: false,
      message: "Error al actualizar tarea",
      error: error.message,
    });
  }
};

/**
 * @desc    Eliminar tarea
 * @route   DELETE /api/tasks/:id
 * @access  Private
 */
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res
        .status(404)
        .json({success: false, message: "Tarea no encontrada"});
    }

    // Solo admin o el creador pueden eliminar
    if (
      req.user.role !== "admin" &&
      task.createdBy.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "No tienes permisos para eliminar esta tarea",
      });
    }

    await task.deleteOne();

    res
      .status(200)
      .json({success: true, message: "Tarea eliminada exitosamente", data: {}});
  } catch (error) {
    console.error("Error al eliminar tarea:", error);
    res.status(500).json({
      success: false,
      message: "Error al eliminar tarea",
      error: error.message,
    });
  }
};

/**
 * @desc    Agregar subtarea
 * @route   POST /api/tasks/:id/subtasks
 * @access  Private
 */
const addSubtask = async (req, res) => {
  try {
    const {title} = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        message: "El título de la subtarea es obligatorio",
      });
    }

    const task = await Task.findById(req.params.id);

    if (!task) {
      return res
        .status(404)
        .json({success: false, message: "Tarea no encontrada"});
    }

    // Verificar permisos
    const isCreator = task.createdBy.toString() === req.user._id.toString();
    const isAssignee =
      task.assignedTo && task.assignedTo.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";

    if (!isAdmin && !isCreator && !isAssignee) {
      return res.status(403).json({
        success: false,
        message: "No tienes permiso para modificar esta tarea",
      });
    }

    task.subtasks.push({title, completed: false});
    await task.save();

    await task.populate("createdBy", "name email avatar");
    await task.populate("assignedTo", "name email avatar");
    await task.populate("history.user", "name avatar");

    res.status(200).json({
      success: true,
      message: "Subtarea agregada exitosamente",
      data: task,
    });
  } catch (error) {
    console.error("Error al agregar subtarea:", error);
    res.status(500).json({
      success: false,
      message: "Error al agregar subtarea",
      error: error.message,
    });
  }
};

/**
 * @desc    Actualizar subtarea
 * @route   PUT /api/tasks/:id/subtasks/:subtaskId
 * @access  Private
 */
const updateSubtask = async (req, res) => {
  try {
    const {completed, title} = req.body;

    const task = await Task.findById(req.params.id);

    if (!task) {
      return res
        .status(404)
        .json({success: false, message: "Tarea no encontrada"});
    }

    // Verificar permisos
    const isCreator = task.createdBy.toString() === req.user._id.toString();
    const isAssignee =
      task.assignedTo && task.assignedTo.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";

    if (!isAdmin && !isCreator && !isAssignee) {
      return res.status(403).json({
        success: false,
        message: "No tienes permiso para modificar esta tarea",
      });
    }

    const subtask = task.subtasks.id(req.params.subtaskId);

    if (!subtask) {
      return res
        .status(404)
        .json({success: false, message: "Subtarea no encontrada"});
    }

    if (title) {
      const trimmedTitle = title.trim();
      if (!trimmedTitle) {
        return res
          .status(400)
          .json({success: false, message: "El título no puede estar vacío"});
      }
      subtask.title = trimmedTitle;
    }

    if (completed !== undefined) {
      subtask.completed = completed;
      subtask.completedAt = completed ? new Date() : null;
    }

    await task.save();

    await task.populate("createdBy", "name email avatar");
    await task.populate("assignedTo", "name email avatar");
    await task.populate("history.user", "name avatar");

    res.status(200).json({
      success: true,
      message: "Subtarea actualizada exitosamente",
      data: task,
    });
  } catch (error) {
    console.error("Error al actualizar subtarea:", error);
    res.status(500).json({
      success: false,
      message: "Error al actualizar subtarea",
      error: error.message,
    });
  }
};

/**
 * @desc    Eliminar subtarea
 * @route   DELETE /api/tasks/:id/subtasks/:subtaskId
 * @access  Private
 */
const deleteSubtask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Tarea no encontrada",
      });
    }

    // Verificar permisos
    const isCreator = task.createdBy.toString() === req.user._id.toString();
    const isAssignee =
      task.assignedTo && task.assignedTo.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";
    if (!isAdmin && !isCreator && !isAssignee) {
      return res.status(403).json({
        success: false,
        message: "No tienes permiso para modificar esta tarea",
      });
    }

    // Verificar que la subtarea existe antes de eliminar
    const subtask = task.subtasks.id(req.params.subtaskId);
    if (!subtask) {
      return res.status(404).json({
        success: false,
        message: "Subtarea no encontrada",
      });
    }

    task.subtasks.pull(req.params.subtaskId);
    await task.save();

    res.status(200).json({
      success: true,
      message: "Subtarea eliminada exitosamente",
      data: task,
    });
  } catch (error) {
    console.error("Error al eliminar subtarea:", error);
    res.status(500).json({
      success: false,
      message: "Error al eliminar subtarea",
      error: error.message,
    });
  }
};

/**
 * @desc    Agregar comentario
 * @route   POST /api/tasks/:id/comments
 * @access  Private
 */
const addComment = async (req, res) => {
  try {
    const {text} = req.body;

    if (!text || !text.trim()) {
      return res
        .status(400)
        .json({success: false, message: "El comentario no puede estar vacío"});
    }

    const task = await Task.findById(req.params.id);

    if (!task) {
      return res
        .status(404)
        .json({success: false, message: "Tarea no encontrada"});
    }

    // Verificar permisos
    const isCreator = task.createdBy.toString() === req.user._id.toString();
    const isAssignee =
      task.assignedTo && task.assignedTo.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";

    if (!isAdmin && !isCreator && !isAssignee) {
      return res.status(403).json({
        success: false,
        message: "No tienes permiso para comentar en esta tarea",
      });
    }

    task.comments.push({user: req.user._id, text: text.trim()});
    task.history.push({
      action: "commented",
      user: req.user._id,
      comment: text.trim(),
    });

    await task.save();
    await task.populate("comments.user", "name avatar");
    await task.populate("history.user", "name avatar");

    res.status(200).json({
      success: true,
      message: "Comentario agregado exitosamente",
      data: task,
    });
  } catch (error) {
    console.error("Error al agregar comentario:", error);
    res.status(500).json({
      success: false,
      message: "Error al agregar comentario",
      error: error.message,
    });
  }
};

/**
 * @desc    Recuperar tarea de archivo
 * @route   PUT /api/tasks/:id/restore
 * @access  Private
 */
const restoreTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res
        .status(404)
        .json({success: false, message: "Tarea no encontrada"});
    }

    // Verificar permisos
    const isCreator = task.createdBy.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";
    if (!isAdmin && !isCreator) {
      return res.status(403).json({
        success: false,
        message: "No tienes permiso para restaurar esta tarea",
      });
    }

    task.status = "por_hacer";
    task.autoDeleteAt = null;
    task.completedAt = null;
    task.isArchived = false;

    task.history.push({
      action: "status_changed",
      user: req.user._id,
      previousValue: "finalizada",
      newValue: "por_hacer",
    });

    await task.save();

    res.status(200).json({
      success: true,
      message: "Tarea recuperada exitosamente",
      data: task,
    });
  } catch (error) {
    console.error("Error al recuperar tarea:", error);
    res.status(500).json({
      success: false,
      message: "Error al recuperar tarea",
      error: error.message,
    });
  }
};

/**
 * @desc    Ejecutar limpieza manual de tareas expiradas (testing)
 * @route   POST /api/tasks/cleanup
 * @access  Private/Admin
 */
const manualCleanup = async (req, res) => {
  try {
    const {deleteExpiredTasks} = require("../utils/taskCleanup");
    const result = await deleteExpiredTasks();

    res.status(200).json({
      success: true,
      message: `Limpieza ejecutada: ${result.deletedCount} tarea(s) eliminada(s)`,
      data: result,
    });
  } catch (error) {
    console.error("Error en limpieza manual:", error);
    res.status(500).json({
      success: false,
      message: "Error al ejecutar limpieza",
      error: error.message,
    });
  }
};

module.exports = {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  addSubtask,
  updateSubtask,
  deleteSubtask,
  addComment,
  restoreTask,
  manualCleanup,
};
