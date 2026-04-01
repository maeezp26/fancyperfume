// back/utils/cloudinary.js
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
  cloud_name:  process.env.CLOUDINARY_CLOUD_NAME,
  api_key:     process.env.CLOUDINARY_API_KEY,
  api_secret:  process.env.CLOUDINARY_API_SECRET,
});

/**
 * Creates a multer instance that uploads directly to Cloudinary.
 * @param {string} folder - Cloudinary folder name (e.g. 'products', 'home/latestProducts')
 * @returns multer instance
 */
const createUploader = (folder) => {
  const storage = new CloudinaryStorage({
    cloudinary,
    params: {
      folder:         `fancyperfume/${folder}`,
      allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
      transformation: [{ quality: 'auto', fetch_format: 'auto' }],
    },
  });

  return multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  });
};

/**
 * Delete an image from Cloudinary by its public_id (optional cleanup).
 */
const deleteImage = async (publicId) => {
  try {
    if (publicId) await cloudinary.uploader.destroy(publicId);
  } catch (err) {
    console.error('Cloudinary delete error:', err.message);
  }
};

module.exports = { cloudinary, createUploader, deleteImage };
