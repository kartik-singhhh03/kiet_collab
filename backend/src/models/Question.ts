import { Schema, model, Document, Types } from 'mongoose';

export interface IAnswer {
  _id: Types.ObjectId;
  content: string;
  author: Types.ObjectId; // User
  votes: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IQuestion extends Document {
  title: string;
  content: string;
  tags: string[];
  author: Types.ObjectId; // User
  answers: IAnswer[];
  acceptedAnswer?: Types.ObjectId;
  votes: number;
  createdAt: Date;
  updatedAt: Date;
}

const answerSchema = new Schema<IAnswer>({
  content: { type: String, required: true, maxlength: 5000 },
  author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  votes: { type: Number, default: 0 }
}, { timestamps: true });

const questionSchema = new Schema<IQuestion>({
  title: { type: String, required: true, trim: true, maxlength: 140 },
  content: { type: String, required: true, maxlength: 10000 },
  tags: [{ type: String, trim: true, lowercase: true }],
  author: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  answers: { type: [answerSchema], default: [] },
  acceptedAnswer: { type: Schema.Types.ObjectId },
  votes: { type: Number, default: 0 }
}, { timestamps: true });

questionSchema.index({ title: 'text', content: 'text', tags: 'text' });

export default model<IQuestion>('Question', questionSchema);
