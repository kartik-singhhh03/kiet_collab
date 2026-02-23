import { Schema, model, Document } from "mongoose";
import bcrypt from "bcryptjs";

export interface IUser extends Document {
  _id: string;
  email: string;
  password?: string;
  googleId?: string;
  name: string;
  avatar?: string;
  bio?: string;
  /** Lowercase branch code parsed from email — e.g. "csit" */
  branch?: string;
  /** 4-digit prefix from email — e.g. "2327" */
  library_prefix?: string;
  /** 4-digit suffix from email — e.g. "1113" */
  library_suffix?: string;
  /** Uppercase full library ID — e.g. "2327CSIT1113" */
  library_id?: string;
  /** e.g. 2023 — derived from first 2 digits of library_prefix */
  batch_start_year?: number;
  /** e.g. 2027 — derived from last 2 digits of library_prefix */
  batch_end_year?: number;
  skills: string[];
  role: "student" | "faculty" | "admin";
  isEmailVerified: boolean;
  lastActive: Date;
  preferences: {
    theme: "light" | "dark";
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

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^[a-zA-Z]+\.([0-9]{4})([a-zA-Z]+)([0-9]{4})@kiet\.edu$/i,
        "Email must follow KIET format: firstname.YYYYbranchNNNN@kiet.edu",
      ],
    },
    password: {
      type: String,
      minlength: 8,
      select: false,
    },
    googleId: {
      type: String,
      sparse: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    avatar: {
      type: String,
      default: "",
    },
    bio: {
      type: String,
      maxlength: 500,
      default: "",
    },
    /** Lowercase branch code — e.g. "csit". Auto-populated from email. */
    branch: {
      type: String,
      lowercase: true,
      trim: true,
    },
    /** e.g. "2327" — first segment after dot in email */
    library_prefix: { type: String, trim: true },
    /** e.g. "1113" — last segment before @kiet.edu */
    library_suffix: { type: String, trim: true },
    /** e.g. "2327CSIT1113" — unique institutional identifier */
    library_id: {
      type: String,
      unique: true,
      sparse: true,
      uppercase: true,
      trim: true,
    },
    /** e.g. 2023 */
    batch_start_year: { type: Number },
    /** e.g. 2027 */
    batch_end_year: { type: Number },
    skills: [
      {
        type: String,
        trim: true,
      },
    ],
    role: {
      type: String,
      enum: ["student", "faculty", "admin"],
      default: "student",
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    lastActive: {
      type: Date,
      default: Date.now,
    },
    preferences: {
      theme: {
        type: String,
        enum: ["light", "dark"],
        default: "light",
      },
      notifications: {
        email: { type: Boolean, default: true },
        push: { type: Boolean, default: true },
        chat: { type: Boolean, default: true },
      },
    },
    socialLinks: {
      github: String,
      linkedin: String,
      portfolio: String,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret) {
        delete ret.password;
        delete (ret as any).__v;
        return ret;
      },
    },
  },
);

// Indexes
// Note: email and library_id already have unique:true on the field definition.
// Additional compound/query indexes only:
userSchema.index({ role: 1 });
userSchema.index({ skills: 1 });
userSchema.index({ branch: 1 });
userSchema.index({ batch_start_year: 1 });
userSchema.index({ lastActive: -1 });

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password") || !this.password) {
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
userSchema.methods.comparePassword = async function (
  candidatePassword: string,
): Promise<boolean> {
  if (!this.password) {
    return false;
  }
  return bcrypt.compare(candidatePassword, this.password);
};

// Update last active timestamp
userSchema.methods.updateLastActive = function () {
  this.lastActive = new Date();
  return this.save();
};

export default model<IUser>("User", userSchema);
