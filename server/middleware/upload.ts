import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { cloudinary } from '../config/cloudinary.js';

/** Multer + Cloudinary storage for avatar uploads */
const avatarStorage = new CloudinaryStorage({
  cloudinary,
  params: async (_req, file) => ({
    folder: 'kiet-collab/avatars',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 400, height: 400, crop: 'fill' }],
    public_id: `${Date.now()}-${file.originalname.split('.')[0]}`,
  }),
});

/** Multer + Cloudinary storage for project cover images */
const projectStorage = new CloudinaryStorage({
  cloudinary,
  params: async (_req, file) => ({
    folder: 'kiet-collab/projects',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 1200, height: 630, crop: 'fill' }],
    public_id: `${Date.now()}-${file.originalname.split('.')[0]}`,
  }),
});

export const uploadAvatar = multer({ storage: avatarStorage });
export const uploadProjectCover = multer({ storage: projectStorage });
