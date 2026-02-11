const express = require("express");
const router = express.Router();
const {
  getUsers,
  createUser,
  getUserById,
  updateUser,
  deleteUser,
  resetUserPassword,
} = require("../controllers/userController");
const {protect} = require("../middleware/authMiddleware");
const {isAdmin} = require("../middleware/roleMiddleware");

// Todas las rutas requieren autenticación y rol de admin
router.use(protect);
router.use(isAdmin);

// Rutas de colección
router.route("/").get(getUsers).post(createUser);

// Rutas de recurso individual
router.route("/:id").get(getUserById).put(updateUser).delete(deleteUser);

// Acciones especiales sobre un usuario
router.put("/:id/reset-password", resetUserPassword);

module.exports = router;
