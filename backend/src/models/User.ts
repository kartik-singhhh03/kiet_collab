import { Schema, model, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  _id: string;
  email: string;
  password?: string;
  googleId?: string;
  name: string;
  avatar?: string;
  bio?: string;
  year?: number;
  branch?: string;
  skills: string[];
  role: 'student' | 'faculty' | 'admin';
  isEmailVerified: boolean;
  lastActive: Date;
  preferences: {
    theme: 'light' | 'dark';
    notifications: {
      email: boolean;
      push: boolean;
      chat: boolean;
    };
  };
  socialLinks: {
    github?: string;
    linkedin?: string;
    portfolio?: string;
  };
  comparePassword(candidatePassword: string): Promise<boolean>;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - email
 *         - name
 *       properties:
 *         _id:
 *           type: string
 *           description: Unique user identifier
 *         email:
 *           type: string
 *           format: email
 *           description: User's KIET email address
 *         name:
 *           type: string
 *           description: User's full name
 *         avatar:
 *           type: string
 *           description: Profile picture URL
 *         bio:
 *           type: string
 *           description: User biography
 *         year:
 *           type: number
 *           description: Academic year
 *         branch:
 *           type: string
 *           description: Academic branch/department
 *         skills:
 *           type: array
 *           items:
 *             type: string
 *           description: User's technical skills
 *         role:
 *           type: string
 *           enum: [student, faculty, admin]
 *           description: User role
 *         isEmailVerified:
 *           type: boolean
 *           description: Email verification status
 */

const userSchema = new Schema<IUser>({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    match: [/^[^\s@]+@kiet\.edu$/, 'Email must be a valid KIET email address']
  },
  password: {
    type: String,
    minlength: 8,
    select: false
  },
  googleId: {
    type: String,
    sparse: true
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  avatar: {
    type: String,
    default: ''
  },
  bio: {
    type: String,
    maxlength: 500,
    default: ''
  },
  year: {
    type: Number,
    min: 1,
    max: 4
  },
  branch: {
    type: String,
    enum: ['CSE', 'IT', 'ECE', 'EEE', 'ME', 'CE', 'MBA', 'MCA'],
    uppercase: true
  },
  skills: [{
    type: String,
    trim: true
  }],
  role: {
    type: String,
    enum: ['student', 'faculty', 'admin'],
    default: 'student'
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  lastActive: {
    type: Date,
    default: Date.now
  },
  preferences: {
    theme: {
      type: String,
      enum: ['light', 'dark'],
      default: 'light'
    },
    notifications: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
      chat: { type: Boolean, default: true }
    }
  },
  socialLinks: {
    github: String,
    linkedin: String,
    portfolio: String
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      delete ret.password;
      delete (ret as any).__v;
      return ret;
    }
  }
});

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ skills: 1 });
userSchema.index({ branch: 1 });
userSchema.index({ lastActive: -1 });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password') || !this.password) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  if (!this.password) {
    return false;
  }
  return bcrypt.compare(candidatePassword, this.password);
};

// Update last active timestamp
userSchema.methods.updateLastActive = function() {
  this.lastActive = new Date();
  return this.save();
};

export default model<IUser>('User', userSchema);