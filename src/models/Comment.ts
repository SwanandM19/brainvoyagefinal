import mongoose, { Schema, Document } from 'mongoose';

export interface IComment extends Document {
  videoId:      mongoose.Types.ObjectId;
  userId:       string;                    // ✅ String — works with any auth provider
  userName:     string;
  userInitials: string;
  text:         string;
  likes:        string[];                  // ✅ Array of userId strings
  createdAt:    Date;
}

const CommentSchema = new Schema<IComment>({
  videoId:      { type: Schema.Types.ObjectId, ref: 'Video', required: true, index: true },
  userId:       { type: String, required: true },   // ✅ no ObjectId cast
  userName:     { type: String, required: true },
  userInitials: { type: String, required: true },
  text:         { type: String, required: true, maxlength: 500 },
  likes:        [{ type: String }],                 // ✅ array of userId strings
}, { timestamps: true });

export default mongoose.models.Comment ||
  mongoose.model<IComment>('Comment', CommentSchema);
