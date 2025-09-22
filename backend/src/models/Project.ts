import { Schema, model, Document, Types } from 'mongoose';

export interface IProject extends Document {
  title: string;
  description: string;
  repoUrl?: string;
  demoUrl?: string;
  screenshots: string[];
  tags: string[];
  submittedBy: Types.ObjectId; // User
  event: Types.ObjectId; // Event
  team: Types.ObjectId; // Team
  likes: number;
  createdAt: Date;
  updatedAt: Date;
}

const projectSchema = new Schema<IProject>({
  title: { type: String, required: true, trim: true, maxlength: 140 },
  description: { type: String, required: true, maxlength: 5000 },
  repoUrl: String,
  demoUrl: String,
  screenshots: [{ type: String }],
  tags: [{ type: String, trim: true, lowercase: true }],
  submittedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  event: { type: Schema.Types.ObjectId, ref: 'Event', required: true, index: true },
  team: { type: Schema.Types.ObjectId, ref: 'Team', required: true, index: true },
  likes: { type: Number, default: 0 }
}, {
  timestamps: true
});

projectSchema.index({ title: 'text', description: 'text', tags: 'text' });

export default model<IProject>('Project', projectSchema);
