import mongoose, { Document, Schema } from 'mongoose';

export interface IEvent extends Document {
  title: string;
  description: string;
  banner: string;
  startDate: Date;
  endDate: Date;
  venue: string;
  isOnline: boolean;
  maxTeamSize: number;
  minTeamSize: number;
  organizer: mongoose.Types.ObjectId;
  registrations: mongoose.Types.ObjectId[];
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
}

const EventSchema = new Schema<IEvent>(
  {
    title:       { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, default: '', maxlength: 10000 },
    banner:      { type: String, default: '' },
    startDate:   { type: Date, required: true },
    endDate:     { type: Date, required: true },
    venue:       { type: String, default: '' },
    isOnline:    { type: Boolean, default: false },
    maxTeamSize: { type: Number, default: 4, min: 1 },
    minTeamSize: { type: Number, default: 1, min: 1 },
    organizer:   { type: Schema.Types.ObjectId, ref: 'User', required: true },
    registrations: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    status: {
      type: String,
      enum: ['upcoming', 'ongoing', 'completed', 'cancelled'],
      default: 'upcoming',
      index: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model<IEvent>('Event', EventSchema);
