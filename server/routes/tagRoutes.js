const express = require("express");
const router = express.Router();
const {
  getTags,
  createTag,
  getTagById,
  updateTag,
  deleteTag,
} = require("../controllers/tagController");
const {protect} = require("../middleware/authMiddleware");

// Todas las rutas requieren autenticación
router.use(protect);

router.route("/").get(getTags).post(createTag);

router.route("/:id").get(getTagById).put(updateTag).delete(deleteTag);

module.exports = router;
