import { Schema, model, Document, Types } from 'mongoose';

export interface IEvent extends Document {
  title: string;
  description: string;
  banner?: string;
  rules?: string;
  prizes?: string;
  tags: string[];
  startDate: Date;
  endDate: Date;
  status: 'draft' | 'published' | 'closed';
  organizers: Types.ObjectId[]; // User refs
  registrations: {
    user: Types.ObjectId; // User
    team?: Types.ObjectId; // Team
    registeredAt: Date;
  }[];
  teams: Types.ObjectId[]; // Team refs
  createdBy: Types.ObjectId; // User
  createdAt: Date;
  updatedAt: Date;
}

const registrationSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  team: { type: Schema.Types.ObjectId, ref: 'Team' },
  registeredAt: { type: Date, default: Date.now }
}, { _id: false });

const eventSchema = new Schema<IEvent>({
  title: { type: String, required: true, trim: true, maxlength: 140 },
  description: { type: String, required: true, maxlength: 5000 },
  banner: String,
  rules: String,
  prizes: String,
  tags: [{ type: String, trim: true, lowercase: true }],
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  status: { type: String, enum: ['draft', 'published', 'closed'], default: 'draft', index: true },
  organizers: [{ type: Schema.Types.ObjectId, ref: 'User', index: true }],
  registrations: { type: [registrationSchema], default: [] },
  teams: [{ type: Schema.Types.ObjectId, ref: 'Team' }],
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true }
}, {
  timestamps: true
});

// Indexes for queries
eventSchema.index({ startDate: 1 });
eventSchema.index({ endDate: 1 });
eventSchema.index({ title: 'text', description: 'text', tags: 'text' });

export default model<IEvent>('Event', eventSchema);
