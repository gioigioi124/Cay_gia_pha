const cloudinary = require("cloudinary").v2;
const dotenv = require("dotenv");

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Upload image to Cloudinary
// @param {string} filePath - URL, base64 data URI, or local path
// @param {object|string} options - Cloudinary upload options or folder string (legacy)
const uploadImage = async (filePath, options = {}) => {
  try {
    // Support legacy call: uploadImage(path, 'folder-name')
    const uploadOptions =
      typeof options === "string"
        ? { folder: options, resource_type: "image" }
        : { resource_type: "image", ...options };

    const result = await cloudinary.uploader.upload(filePath, uploadOptions);
    return {
      url: result.secure_url,
      secure_url: result.secure_url,
      publicId: result.public_id,
      public_id: result.public_id,
    };
  } catch (error) {
    throw new Error("Image upload failed: " + error.message);
  }
};

// Delete image from Cloudinary
const deleteImage = async (publicId) => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error("Image deletion failed:", error.message);
  }
};

module.exports = { uploadImage, deleteImage, cloudinary };
