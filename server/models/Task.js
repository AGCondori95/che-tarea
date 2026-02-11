const mongoose = require("mongoose");

const subtaskSchema = new mongoose.Schema({
  title: {type: String, required: true, trim: true, maxlength: 200},
  completed: {type: Boolean, default: false},
  completedAt: {type: Date, default: null},
});

const historyEntrySchema = new mongoose.Schema({
  action: {
    type: String,
    required: true,
    enum: [
      "created",
      "status_changed",
      "priority_changed",
      "assigned",
      "commented",
    ],
  },
  user: {type: mongoose.Schema.Types.ObjectId, ref: "User", required: true},
  previousValue: {type: String, default: null},
  newValue: {type: String, default: null},
  comment: {type: String, default: null},
  timestamp: {type: Date, default: Date.now},
});

const commentSchema = new mongoose.Schema({
  user: {type: mongoose.Schema.Types.ObjectId, ref: "User", required: true},
  text: {type: String, required: true, trim: true, maxlength: 500},
  createdAt: {type: Date, default: Date.now},
});

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "El título es obligatorio"],
      trim: true,
      maxlength: [100, "El título no puede exceder 100 caracteres"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, "La descripción no puede exceder 1000 caracteres"],
      default: "",
    },
    status: {
      type: String,
      enum: ["por_hacer", "en_progreso", "pendiente_revision", "finalizada"],
      default: "por_hacer",
    },
    priority: {type: String, enum: ["alta", "media", "baja"], default: "media"},
    tags: [{type: mongoose.Schema.Types.ObjectId, ref: "Tag"}],
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    subtasks: [subtaskSchema],
    history: [historyEntrySchema],
    comments: [commentSchema],
    dueDate: {type: Date, default: null},
    completedAt: {type: Date, default: null},
    autoDeleteAt: {type: Date, default: null},
    isArchived: {type: Boolean, default: false},
  },
  {timestamps: true},
);

// Índices para mejorar performance de queries
taskSchema.index({status: 1, createdBy: 1});
taskSchema.index({assignedTo: 1, status: 1});
taskSchema.index({autoDeleteAt: 1}, {sparse: true});
taskSchema.index({createdAt: -1});
taskSchema.index({dueDate: 1}, {sparse: true});

// Método para calcular el progreso de subtareas
taskSchema.methods.getSubtaskProgress = function () {
  if (this.subtasks.length === 0) {
    return {completed: 0, total: 0, percentage: 0};
  }

  const completed = this.subtasks.filter((st) => st.completed).length;
  const total = this.subtasks.length;
  const percentage = Math.round((completed / total) * 100);

  return {completed, total, percentage};
};

// Middleware: cuando una tarea pasa a "finalizada", establecer autoDeleteAt
taskSchema.pre("save", function () {
  if (
    this.isModified("status") &&
    this.status === "finalizada" &&
    !this.autoDeleteAt
  ) {
    // Establecer fecha de eliminación automática en 10 días
    const deleteDate = new Date();
    deleteDate.setDate(deleteDate.getDate() + 10);
    this.autoDeleteAt = deleteDate;
    this.completedAt = new Date();
  }

  // Si la tarea vuelve a un estado anterior, remover autoDeleteAt
  if (
    this.isModified("status") &&
    this.status !== "finalizada" &&
    this.autoDeleteAt
  ) {
    this.autoDeleteAt = null;
    this.completedAt = null;
  }
});

module.exports = mongoose.model("Task", taskSchema);
