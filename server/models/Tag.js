const mongoose = require("mongoose");

const tagSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "El nombre de la etiqueta es obligatorio"],
      trim: true,
      maxlength: [30, "El nombre no puede exceder 30 caracteres"],
    },
    color: {
      type: String,
      required: [true, "El color es obligatorio"],
      default: "#2563eb",
      match: [/^#[0-9A-Fa-f]{6}$/i, "Formato de color hexadecimal inválido"],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    isDefault: {type: Boolean, default: false},
  },
  {timestamps: true},
);

// Índice compuesto para evitar etiquetas duplicadas por usuario
tagSchema.index({name: 1, createdBy: 1}, {unique: true});

module.exports = mongoose.model("Tag", tagSchema);
