const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const AVAILABILITY = ['available', 'busy', 'away'];
const ROLES = ['student', 'faculty', 'admin'];

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 8, select: false },
    avatar: { type: String, default: '' },
    department: { type: String, trim: true, default: '' },
    skills: { type: [String], default: [] },
    bio: { type: String, default: '', maxlength: 1000 },
    availability: { type: String, enum: AVAILABILITY, default: 'available', index: true },
    role: { type: String, enum: ROLES, default: 'student', index: true },
    points: { type: Number, default: 0, min: 0 }
  },
  { timestamps: true }
);

UserSchema.pre('save', async function save(next) {
  try {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    return next();
  } catch (err) {
    return next(err);
  }
});

UserSchema.methods.comparePassword = async function comparePassword(candidate) {
  if (!this.password) return false;
  return bcrypt.compare(candidate, this.password);
};

module.exports = mongoose.model('User', UserSchema);
