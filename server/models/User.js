const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "El nombre es obligatorio"],
      trim: true,
      maxlength: [50, "El nombre no puede exceder 50 caracteres"],
    },
    email: {
      type: String,
      required: [true, "El email es obligatorio"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Por favor ingresa un email válido"],
    },
    password: {
      type: String,
      required: [true, "La contraseña es obligatoria"],
      minlength: [6, "La contraseña debe tener al menos 6 caracteres"],
      select: false,
    },
    role: {type: String, enum: ["admin", "user"], default: "user"},
    avatar: {type: String, default: ""},
    defaultTag: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tag",
      default: null,
    },
    emailNotifications: {type: Boolean, default: false},
    appNotifications: {type: Boolean, default: true},
    isActive: {type: Boolean, default: true},
  },
  {timestamps: true},
);

// Índice en isActive para filtrar usuarios activos
userSchema.index({isActive: 1});

module.exports = mongoose.model("User", userSchema);
