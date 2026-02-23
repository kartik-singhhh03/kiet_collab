import mongoose, { Document, Schema } from 'mongoose';

export type InviteStatus = 'pending' | 'accepted' | 'declined';

export interface IInvite extends Document {
  fromUserId: mongoose.Types.ObjectId;
  toUserId: mongoose.Types.ObjectId;
  eventId: mongoose.Types.ObjectId | null;
  message: string;
  status: InviteStatus;
}

const InviteSchema = new Schema<IInvite>(
  {
    fromUserId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    toUserId:   { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    eventId:    { type: Schema.Types.ObjectId, ref: 'Event', default: null, index: true },
    message:    { type: String, default: '', maxlength: 1000 },
    status:     { type: String, enum: ['pending', 'accepted', 'declined'] as InviteStatus[], default: 'pending', index: true },
  },
  { timestamps: true }
);

InviteSchema.index({ toUserId: 1, status: 1, createdAt: -1 });

export default mongoose.model<IInvite>('Invite', InviteSchema);
