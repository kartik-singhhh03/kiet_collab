import { v2 as cloudinary } from 'cloudinary';

/**
 * Configure Cloudinary.
 * Reads CLOUDINARY_URL env variable automatically when set.
 * Format: cloudinary://api_key:api_secret@cloud_name
 */
export function configureCloudinary(): void {
  if (!process.env.CLOUDINARY_URL) {
    console.warn('⚠️  CLOUDINARY_URL not set — file uploads will be disabled');
    return;
  }
  cloudinary.config({ secure: true });
  console.log('✅  Cloudinary configured');
}

export { cloudinary };
