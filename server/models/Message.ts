import mongoose, { Document, Schema } from 'mongoose';

export interface IMessage extends Document {
  team_id:   mongoose.Types.ObjectId;
  sender_id: mongoose.Types.ObjectId;
  message:   string;
  timestamp: Date;
}

const MessageSchema = new Schema<IMessage>(
  {
    team_id: {
      type:     Schema.Types.ObjectId,
      ref:      'Team',
      required: [true, 'team_id is required'],
      index:    true,
    },
    sender_id: {
      type:     Schema.Types.ObjectId,
      ref:      'User',
      required: [true, 'sender_id is required'],
    },
    message: {
      type:      String,
      required:  [true, 'message is required'],
      trim:      true,
      maxlength: [2000, 'Message cannot exceed 2000 characters'],
    },
    timestamp: {
      type:    Date,
      default: () => new Date(),
    },
  },
  {
    // No auto-timestamps — we manage `timestamp` manually so the field
    // name stays exactly as specified in the schema.
    timestamps: false,
  }
);

export default mongoose.model<IMessage>('Message', MessageSchema);
