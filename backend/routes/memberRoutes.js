const express = require("express");
const router = express.Router();
const {
  getMembers,
  addMember,
  getMember,
  updateMember,
  deleteMember,
  addRelationship,
} = require("../controllers/memberController");
const { protect } = require("../middleware/authMiddleware");

router.use(protect); // All member routes require auth

router.route("/:treeId/members").get(getMembers).post(addMember);

router
  .route("/:treeId/members/:id")
  .get(getMember)
  .put(updateMember)
  .delete(deleteMember);

router.post("/:treeId/members/:id/relationship", addRelationship);

module.exports = router;
