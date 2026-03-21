import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IPost extends Document {
  teacherId:   mongoose.Types.ObjectId;
  type:        'photo' | 'article';

  // ── Photo fields ──────────────────────────────
  photoUrl?:   string;   // R2 public URL
  photoKey?:   string;   // R2 object key (for deletion)
  caption?:    string;

  // ── Article fields ────────────────────────────
  title?:      string;
  body?:       string;   // rich text stored as HTML string

  // ── Common metadata ───────────────────────────
  subject?:    string;
  classes:     string[];
  boards:      string[];

  // ── Engagement ────────────────────────────────
  views:       number;
  likes:       mongoose.Types.ObjectId[];
  likesCount:  number;

  // ── Moderation ────────────────────────────────
  status:      'active' | 'pending' | 'rejected';

  createdAt:   Date;
  updatedAt:   Date;
}

const PostSchema = new Schema<IPost>(
  {
    teacherId:  { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type:       { type: String, enum: ['photo', 'article'], required: true },

    // Photo
    photoUrl:   { type: String },
    photoKey:   { type: String },
    caption:    { type: String, maxlength: 2200 },

    // Article
    title:      { type: String, maxlength: 300 },
    body:       { type: String },

    // Metadata
    subject:    { type: String, default: '' },
    classes:    { type: [String], default: [] },
    boards:     { type: [String], default: [] },

    // Engagement
    views:      { type: Number, default: 0 },
    likes:      { type: [Schema.Types.ObjectId], ref: 'User', default: [] },
    likesCount: { type: Number, default: 0 },

    // Moderation
    status:     { type: String, enum: ['active', 'pending', 'rejected'], default: 'active' },
  },
  {
    timestamps: true,
  }
);

// Compound index for fast feed queries sorted by date
PostSchema.index({ status: 1, createdAt: -1 });
PostSchema.index({ teacherId: 1, createdAt: -1 });

const Post: Model<IPost> =
  mongoose.models.Post ?? mongoose.model<IPost>('Post', PostSchema);

export default Post;
