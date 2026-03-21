import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IVideo extends Document {
  teacherId:      mongoose.Types.ObjectId;
  title:          string;
  description:    string;
  videoUrl:       string;
  r2Key:          string;          // ← NEW: R2 object key for deletion
  thumbnail:      string;
  r2ThumbnailKey: string;          // ← NEW: R2 thumbnail key for deletion
  subject:        string;
  classes:        string[];
  boards:         string[];
  tags:           string[];
  views:          number;
  likes:          mongoose.Types.ObjectId[];
  rating:         number;
  ratingCount:    number;
  duration:       number;
  status:         'active' | 'pending' | 'rejected';
  createdAt:      Date;
  updatedAt:      Date;
}

const VideoSchema = new Schema<IVideo>(
  {
    teacherId:   { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title:       { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, default: '', maxlength: 1000 },
    videoUrl:    { type: String, default: '' },
    r2Key:          { type: String, default: '' },   // ← NEW
    thumbnail:      { type: String, default: '' },
    r2ThumbnailKey: { type: String, default: '' },   // ← NEW
    subject:     { type: String, required: true },
    classes:     [{ type: String }],
    boards:      [{ type: String }],
    tags:        [{ type: String }],
    views:       { type: Number, default: 0 },
    likes:       [{ type: Schema.Types.ObjectId, ref: 'User' }],
    rating:      { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },
    duration:    { type: Number, default: 0 },
    status: {
      type:    String,
      enum:    ['active', 'pending', 'rejected'],
      default: 'active',   // ✅ videos go live immediately
    },
  },
  { timestamps: true }
);

VideoSchema.index({ teacherId: 1 });
VideoSchema.index({ subject: 1 });
VideoSchema.index({ status: 1 });
VideoSchema.index({ classes: 1 });
VideoSchema.index({ boards: 1 });
VideoSchema.index({ views: -1 });
VideoSchema.index({ createdAt: -1 });
VideoSchema.index({ teacherId: 1, status: 1 });  // ← NEW: for leaderboard aggregation

const Video: Model<IVideo> =
  mongoose.models.Video ?? mongoose.model<IVideo>('Video', VideoSchema);

export default Video;
