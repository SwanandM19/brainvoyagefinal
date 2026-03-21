import mongoose, { Schema, Document, Model } from "mongoose";

export interface IStudent extends Document {
  name: string;
  email: string;
  password?: string;
  studentClass: string;
  board: string;
  points: number;
  badges: string[];
  following: mongoose.Types.ObjectId[];
  savedVideos: mongoose.Types.ObjectId[];
  createdAt: Date;
}

const StudentSchema = new Schema<IStudent>(
  {
    name:         { type: String, required: true, trim: true },
    email:        { type: String, required: true, unique: true, lowercase: true },
    password:     { type: String },
    studentClass: { type: String, required: true },
    board:        { type: String, required: true },
    points:       { type: Number, default: 0 },
    badges:       { type: [String], default: [] },
    following:    { type: [Schema.Types.ObjectId], ref: "Teacher", default: [] },
    savedVideos:  { type: [Schema.Types.ObjectId], ref: "Video", default: [] },
  },
  { timestamps: true }
);

const Student: Model<IStudent> =
  mongoose.models.Student ?? mongoose.model<IStudent>("Student", StudentSchema);

export default Student;
