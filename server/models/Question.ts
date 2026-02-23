import mongoose, { Document, Schema } from 'mongoose';

export interface IAnswer {
  _id?: mongoose.Types.ObjectId;
  authorId: mongoose.Types.ObjectId;
  body: string;
  upvotes: mongoose.Types.ObjectId[];
  isAccepted: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IQuestion extends Document {
  title: string;
  body: string;
  tags: string[];
  authorId: mongoose.Types.ObjectId;
  answers: IAnswer[];
  upvotes: mongoose.Types.ObjectId[];
  views: number;
  isClosed: boolean;
}

const AnswerSchema = new Schema<IAnswer>(
  {
    authorId:   { type: Schema.Types.ObjectId, ref: 'User', required: true },
    body:       { type: String, required: true, maxlength: 10000 },
    upvotes:    [{ type: Schema.Types.ObjectId, ref: 'User' }],
    isAccepted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const QuestionSchema = new Schema<IQuestion>(
  {
    title:    { type: String, required: true, trim: true, maxlength: 300 },
    body:     { type: String, required: true, maxlength: 10000 },
    tags:     { type: [String], default: [], index: true },
    authorId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    answers:  [AnswerSchema],
    upvotes:  [{ type: Schema.Types.ObjectId, ref: 'User' }],
    views:    { type: Number, default: 0, min: 0 },
    isClosed: { type: Boolean, default: false },
  },
  { timestamps: true }
);

QuestionSchema.index({ title: 'text', body: 'text', tags: 1 });

export default mongoose.model<IQuestion>('Question', QuestionSchema);
