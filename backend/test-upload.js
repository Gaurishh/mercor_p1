require('dotenv').config();
const { uploadToCloudinary } = require('./src/utils/cloudinary');

async function testUpload() {
  console.log('Testing Cloudinary upload...');
  console.log('Environment variables:');
  console.log('CLOUDINARY_CLOUD_NAME:', process.env.CLOUDINARY_CLOUD_NAME ? 'Set' : 'Not set');
  console.log('CLOUDINARY_API_KEY:', process.env.CLOUDINARY_API_KEY ? 'Set' : 'Not set');
  console.log('CLOUDINARY_API_SECRET:', process.env.CLOUDINARY_API_SECRET ? 'Set' : 'Not set');
  console.log('CLOUDINARY_UPLOAD_PRESET:', process.env.CLOUDINARY_UPLOAD_PRESET ? 'Set' : 'Not set');
  
  // Test with a sample file path (you'll need to create this file)
  const testFilePath = './test-screenshot.png';
  
  try {
    const result = await uploadToCloudinary(testFilePath, {
      public_id: 'test_upload',
      tags: ['test']
    });
    
    if (result.success) {
      console.log('✅ Upload successful!');
      console.log('URL:', result.url);
      console.log('Size:', result.size, 'bytes');
      console.log('Format:', result.format);
    } else {
      console.log('❌ Upload failed:', result.error);
    }
  } catch (error) {
    console.log('❌ Test failed:', error.message);
  }
}

testUpload(); 