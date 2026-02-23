import mongoose, { Document, Schema } from 'mongoose';

export interface IProject extends Document {
  title: string;
  description: string;
  techStack: string[];
  repoUrl: string;
  demoUrl: string;
  coverImage: string;
  ownerId: mongoose.Types.ObjectId;
  teamId: mongoose.Types.ObjectId | null;
  eventId: mongoose.Types.ObjectId | null;
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  likes: mongoose.Types.ObjectId[];
  views: number;
}

const ProjectSchema = new Schema<IProject>(
  {
    title:       { type: String, required: true, trim: true, maxlength: 150 },
    description: { type: String, default: '', maxlength: 5000 },
    techStack:   { type: [String], default: [] },
    repoUrl:     { type: String, default: '' },
    demoUrl:     { type: String, default: '' },
    coverImage:  { type: String, default: '' },
    ownerId:     { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    teamId:      { type: Schema.Types.ObjectId, ref: 'Team', default: null },
    eventId:     { type: Schema.Types.ObjectId, ref: 'Event', default: null, index: true },
    status: {
      type: String,
      enum: ['draft', 'submitted', 'approved', 'rejected'],
      default: 'draft',
      index: true,
    },
    likes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    views: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

ProjectSchema.index({ title: 'text', description: 'text' });

export default mongoose.model<IProject>('Project', ProjectSchema);
