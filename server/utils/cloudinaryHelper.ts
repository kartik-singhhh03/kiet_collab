import { cloudinary } from '../config/cloudinary.js';

/**
 * Delete an asset from Cloudinary by its public_id.
 * Silently logs on failure (non-critical cleanup).
 */
export async function deleteFromCloudinary(publicId: string): Promise<void> {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (err) {
    console.error('Cloudinary delete error:', err);
  }
}

/**
 * Extract Cloudinary public_id from a full URL.
 * e.g. "https://res.cloudinary.com/demo/image/upload/v123/folder/file.jpg"
 *      → "folder/file"
 */
export function extractPublicId(url: string): string {
  const parts = url.split('/');
  const uploadIndex = parts.indexOf('upload');
  // skip version segment (vXXXX) if present
  const startIndex =
    uploadIndex !== -1 && /^v\d+$/.test(parts[uploadIndex + 1] ?? '')
      ? uploadIndex + 2
      : uploadIndex + 1;
  const filename = parts.slice(startIndex).join('/');
  return filename.replace(/\.[^/.]+$/, ''); // strip extension
}
