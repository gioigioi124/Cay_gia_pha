const cloudinary = require("../utils/cloudinary");
const Member = require("../models/Member");
const User = require("../models/User");
const multer = require("multer");

// Multer: lưu file vào memory (không lưu disk)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Chỉ chấp nhận file ảnh"), false);
    }
  },
});

// @desc  Upload avatar cho thành viên
// @route POST /api/upload/member-avatar/:memberId
// @access Private
const uploadMemberAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "Không có file được gửi lên" });
    }

    // Chuyển buffer → base64 data URI
    const b64 = Buffer.from(req.file.buffer).toString("base64");
    const dataURI = `data:${req.file.mimetype};base64,${b64}`;

    // Upload lên Cloudinary
    const result = await cloudinary.uploadImage(dataURI, {
      folder: "gia-pha/members",
      public_id: `member-${req.params.memberId}-${Date.now()}`,
      transformation: [
        { width: 400, height: 400, crop: "thumb", gravity: "face" },
        { quality: "auto", fetch_format: "auto" },
      ],
    });

    // Cập nhật avatar trong DB
    const member = await Member.findByIdAndUpdate(
      req.params.memberId,
      { avatar: result.secure_url },
      { new: true },
    );

    if (!member) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy thành viên" });
    }

    res.json({
      success: true,
      data: { avatarUrl: result.secure_url, member },
    });
  } catch (error) {
    next(error);
  }
};

// @desc  Upload avatar cho user (hồ sơ cá nhân)
// @route POST /api/upload/user-avatar
// @access Private
const uploadUserAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "Không có file được gửi lên" });
    }

    const b64 = Buffer.from(req.file.buffer).toString("base64");
    const dataURI = `data:${req.file.mimetype};base64,${b64}`;

    const result = await cloudinary.uploadImage(dataURI, {
      folder: "gia-pha/users",
      public_id: `user-${req.user._id}-${Date.now()}`,
      transformation: [
        { width: 200, height: 200, crop: "thumb", gravity: "face" },
        { quality: "auto", fetch_format: "auto" },
      ],
    });

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { avatar: result.secure_url },
      { new: true },
    );

    res.json({
      success: true,
      data: { avatarUrl: result.secure_url, user },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { upload, uploadMemberAvatar, uploadUserAvatar };
