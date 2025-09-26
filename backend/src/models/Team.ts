import { Schema, model, Document, Types } from 'mongoose';

export interface ITeam extends Document {
  name: string;
  event: Types.ObjectId; // Event
  members: { user: Types.ObjectId; role: 'member' | 'leader' }[];
  project?: Types.ObjectId; // Project
  createdBy: Types.ObjectId; // User
  createdAt: Date;
  updatedAt: Date;
}

const memberSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  role: { type: String, enum: ['member', 'leader'], default: 'member' }
}, { _id: false });

const teamSchema = new Schema<ITeam>({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  event: { type: Schema.Types.ObjectId, ref: 'Event', required: true, index: true },
  members: { type: [memberSchema], default: [] },
  project: { type: Schema.Types.ObjectId, ref: 'Project' },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true }
}, {
  timestamps: true
});

teamSchema.index({ name: 1, event: 1 }, { unique: true });

export default model<ITeam>('Team', teamSchema);
