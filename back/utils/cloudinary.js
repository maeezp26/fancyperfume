// back/utils/cloudinary.js
// Single place to configure Cloudinary — imported by product, home, about routes

const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Creates a multer instance that streams files directly to Cloudinary.
 * @param {string} folder  – subfolder under fancyperfume/ in Cloudinary
 * @param {Object} [extra] – optional extra Cloudinary params (transformation, etc.)
 */
const createUploader = (folder, extra = {}) => {
  const storage = new CloudinaryStorage({
    cloudinary,
    params: async (req, file) => ({
      folder: `fancyperfume/${folder}`,
      allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
      transformation: [{ quality: 'auto:good', fetch_format: 'auto' }],
      ...extra,
    }),
  });

  return multer({
    storage,
    limits: { fileSize: 8 * 1024 * 1024 }, // 8 MB per file
    fileFilter: (_req, file, cb) => {
      if (/\.(jpg|jpeg|png|gif|webp)$/i.test(file.originalname)) {
        cb(null, true);
      } else {
        cb(new Error('Only image files are allowed (jpg, jpeg, png, gif, webp)'));
      }
    },
  });
};

/**
 * Optionally delete an old image from Cloudinary when replacing it.
 * Pass the full URL; we extract the public_id automatically.
 */
const deleteByUrl = async (url) => {
  if (!url || !url.includes('cloudinary.com')) return;
  try {
    // Extract public_id from a URL like:
    // https://res.cloudinary.com/<cloud>/image/upload/v12345/fancyperfume/products/xyz.jpg
    const parts  = url.split('/');
    const upload = parts.indexOf('upload');
    if (upload === -1) return;
    // public_id = everything after "upload/vXXX/" without extension
    const publicParts = parts.slice(upload + 2).join('/');
    const publicId    = publicParts.replace(/\.[^/.]+$/, '');
    await cloudinary.uploader.destroy(publicId);
  } catch (err) {
    console.warn('Cloudinary delete warning:', err.message);
  }
};

module.exports = { cloudinary, createUploader, deleteByUrl };
