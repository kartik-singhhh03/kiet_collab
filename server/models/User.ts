import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcrypt';

// ─── Enums ────────────────────────────────────────────────────────────────────
export type AvailabilityStatus = 'available' | 'busy' | 'away';
export type UserRole           = 'student' | 'faculty' | 'judge' | 'admin';
export type Gender             = 'male' | 'female' | 'other' | 'prefer_not_to_say';

export const BRANCHES = [
  'CSE', 'CSE-AI', 'CSE-DS', 'IT', 'ECE', 'EEE',
  'ME', 'CE', 'BT', 'MBA', 'MCA', 'Other',
] as const;
export type Branch = (typeof BRANCHES)[number];

export const YEARS = [1, 2, 3, 4] as const;
export type Year = (typeof YEARS)[number];

// ─── Interface ────────────────────────────────────────────────────────────────
export interface IUser extends Document {
  // Identification
  name:                string;
  email:               string;
  password:            string;
  avatar:              string;
  role:                UserRole;

  // Profile
  gender:              Gender;
  branch:              Branch | string;
  year:                number;
  department:          string;   // kept for faculty / non-student users
  bio:                 string;

  // Skills & interests
  skills:              string[];
  interests:           string[];

  // Status
  availability_status: AvailabilityStatus;
  lastActive:          Date;

  // Gamification
  points:              number;
  badges:              string[];

  comparePassword(candidate: string): Promise<boolean>;
}

// ─── Schema ───────────────────────────────────────────────────────────────────
const UserSchema = new Schema<IUser>(
  {
    // Identification
    name:   { type: String, required: true, trim: true, maxlength: 100 },
    email:  {
      type: String, required: true, unique: true, lowercase: true, trim: true,
      validate: {
        validator: (v: string) => v.endsWith('@kiet.edu'),
        message:   'Email must end with @kiet.edu',
      },
    },
    password: { type: String, required: true, minlength: 6, select: false },
    avatar:   { type: String, default: '' },
    role: {
      type:    String,
      enum:    ['student', 'faculty', 'judge', 'admin'] as UserRole[],
      default: 'student',
      index:   true,
    },

    // Profile
    gender: {
      type:    String,
      enum:    ['male', 'female', 'other', 'prefer_not_to_say'] as Gender[],
      default: 'prefer_not_to_say',
    },
    branch:     { type: String, trim: true, default: '' },
    year:       { type: Number, enum: [1, 2, 3, 4], default: 1 },
    department: { type: String, trim: true, default: '' },
    bio:        { type: String, default: '', maxlength: 1000 },

    // Skills & interests
    skills:    { type: [String], default: [] },
    interests: { type: [String], default: [] },

    // Status
    availability_status: {
      type:    String,
      enum:    ['available', 'busy', 'away'] as AvailabilityStatus[],
      default: 'available',
      index:   true,
    },
    lastActive: { type: Date, default: Date.now },

    // Gamification
    points: { type: Number, default: 0, min: 0 },
    badges: { type: [String], default: [] },
  },
  { timestamps: true }
);

// ─── Hooks ────────────────────────────────────────────────────────────────────
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err: any) {
    next(err);
  }
});

// ─── Methods ──────────────────────────────────────────────────────────────────
UserSchema.methods.comparePassword = function (candidate: string): Promise<boolean> {
  return bcrypt.compare(candidate, this.password);
};

// ─── Indexes ──────────────────────────────────────────────────────────────────
UserSchema.index({ skills: 1, availability_status: 1 });
UserSchema.index({ branch: 1, year: 1 });

export default mongoose.model<IUser>('User', UserSchema);
