import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function uploadReceiptToCloudinary(
  buffer: Buffer,
  fileName: string
): Promise<string> {
  try {
    console.log('📤 Uploading receipt to Cloudinary...');

    // Upload buffer to Cloudinary
    const result = await new Promise<any>((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          resource_type: 'raw',
          public_id: `receipts/${fileName}`,
          format: 'pdf',
          folder: 'trustinn/receipts',
        },
        (error, result) => {
          if (error) {
            console.error('Cloudinary upload error:', error);
            reject(error);
          } else {
            resolve(result);
          }
        }
      ).end(buffer);
    });

    console.log('✅ Receipt uploaded to Cloudinary:', result.secure_url);
    return result.secure_url;
  } catch (error) {
    console.error('❌ Failed to upload receipt to Cloudinary:', error);
    throw error;
  }
}