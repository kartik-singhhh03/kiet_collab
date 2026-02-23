import mongoose, { Document, Schema } from "mongoose";

export type NotificationType =
  | "team_invite"
  | "invite_accepted"
  | "invite_rejected"
  | "announcement"
  | "new_message"
  | "badge_earned";

export interface INotification extends Document {
  recipient: mongoose.Types.ObjectId;
  sender: mongoose.Types.ObjectId | null;
  type: NotificationType;
  message: string;
  related_invite: mongoose.Types.ObjectId | null;
  related_team: mongoose.Types.ObjectId | null;
  related_event: mongoose.Types.ObjectId | null;
  is_read: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    recipient: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    sender: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    type: {
      type: String,
      enum: [
        "team_invite",
        "invite_accepted",
        "invite_rejected",
        "announcement",
        "new_message",
        "badge_earned",
      ] as NotificationType[],
      required: true,
      index: true,
    },
    message: {
      type: String,
      required: true,
      maxlength: 500,
    },
    related_invite: {
      type: Schema.Types.ObjectId,
      ref: "Invite",
      default: null,
    },
    related_team: { type: Schema.Types.ObjectId, ref: "Team", default: null },
    related_event: { type: Schema.Types.ObjectId, ref: "Event", default: null },
    is_read: { type: Boolean, default: false, index: true },
  },
  { timestamps: true },
);

// Compound index — fetch unread for a user quickly
NotificationSchema.index({ recipient: 1, is_read: 1, createdAt: -1 });

export default mongoose.model<INotification>(
  "Notification",
  NotificationSchema,
);
