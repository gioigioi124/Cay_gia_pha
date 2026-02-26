const express = require("express");
const router = express.Router();
const {
  getTrees,
  createTree,
  getTree,
  updateTree,
  deleteTree,
  shareTree,
} = require("../controllers/treeController");
const { protect } = require("../middleware/authMiddleware");

router.use(protect); // All tree routes require auth

router.route("/").get(getTrees).post(createTree);
router.route("/:id").get(getTree).put(updateTree).delete(deleteTree);
router.post("/:id/share", shareTree);

module.exports = router;
