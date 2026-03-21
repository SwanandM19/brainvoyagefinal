import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IQuestion extends Document {
  subject:      string;
  topic:        string;
  question:     string;
  options:      string[];
  correctIndex: number;
  difficulty:   'easy' | 'medium' | 'hard';
  explanation?: string;
  gameTypes:    string[]; // 'blitz' | 'dash' | 'memory'
}

const QuestionSchema = new Schema<IQuestion>({
  subject:      { type: String, required: true },
  topic:        { type: String, required: true },
  question:     { type: String, required: true },
  options:      [{ type: String }],
  correctIndex: { type: Number, required: true, min: 0, max: 3 },
  difficulty:   { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
  explanation:  { type: String },
  gameTypes:    [{ type: String }],
}, { timestamps: true });

QuestionSchema.index({ subject: 1, difficulty: 1 });
QuestionSchema.index({ gameTypes: 1 });

const Question: Model<IQuestion> =
  mongoose.models.Question ?? mongoose.model<IQuestion>('Question', QuestionSchema);

export default Question;
