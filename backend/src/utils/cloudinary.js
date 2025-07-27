const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadToCloudinary = async (filePath, options = {}) => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      upload_preset: process.env.CLOUDINARY_UPLOAD_PRESET,
      folder: 'mercor_p1_screenshots',
      resource_type: 'image',
      transformation: [
        { quality: 'auto:good' },  // Automatic quality optimization
        { fetch_format: 'auto' }   // Auto-format (WebP if supported)
      ],
      ...options
    });
    
    return {
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
      size: result.bytes,
      format: result.format,
      width: result.width,
      height: result.height,
      folder: result.folder
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

module.exports = { cloudinary, uploadToCloudinary }; 