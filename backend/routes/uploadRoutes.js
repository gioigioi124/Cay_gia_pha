const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  upload,
  uploadMemberAvatar,
  uploadUserAvatar,
} = require("../controllers/uploadController");

// Upload avatar cho thành viên
router.post(
  "/member-avatar/:memberId",
  protect,
  upload.single("avatar"),
  uploadMemberAvatar,
);

// Upload avatar cho user
router.post("/user-avatar", protect, upload.single("avatar"), uploadUserAvatar);

module.exports = router;
