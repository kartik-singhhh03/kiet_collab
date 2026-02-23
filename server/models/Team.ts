import mongoose, { Document, Schema } from 'mongoose';

export interface ITeam extends Document {
  name: string;
  eventId: mongoose.Types.ObjectId | null;
  leader: mongoose.Types.ObjectId;
  members: mongoose.Types.ObjectId[];
  projectId: mongoose.Types.ObjectId | null;
  isOpen: boolean;
  description: string;
}

const TeamSchema = new Schema<ITeam>(
  {
    name:       { type: String, required: true, trim: true, maxlength: 100 },
    eventId:    { type: Schema.Types.ObjectId, ref: 'Event', default: null, index: true },
    leader:     { type: Schema.Types.ObjectId, ref: 'User', required: true },
    members:    [{ type: Schema.Types.ObjectId, ref: 'User' }],
    projectId:  { type: Schema.Types.ObjectId, ref: 'Project', default: null },
    isOpen:     { type: Boolean, default: true },
    description:{ type: String, default: '', maxlength: 1000 },
  },
  { timestamps: true }
);

export default mongoose.model<ITeam>('Team', TeamSchema);
