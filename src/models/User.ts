import mongoose, { Document, Model, Schema } from 'mongoose';

export type UserRole      = 'admin' | 'teacher' | 'student';
export type TeacherStatus = 'pending' | 'approved' | 'rejected' | 'suspended';

export interface IUser extends Document {
  _id:                  mongoose.Types.ObjectId;
  name:                 string;
  email:                string;
  image?:               string;
  role:                 UserRole;
  teacherStatus?:       TeacherStatus;
  teacherRejectionNote?: string;
  onboardingCompleted:  boolean;
  // Shared profile
  bio?:                 string;
  phone?:               string;
  city?:                string;
  state?:               string;
  // Teacher profile
  subjects?:            string[];
  classes?:             string[];
  boards?:              string[];
  qualifications?:      string;
  yearsOfExperience?:   number;
  profileVideoUrl?:     string;
  // Student profile
  studentClass?:        string;
  studentBoard?:        string;
  school?:              string;
  // Follow system — arrays for actual follow logic
  followers:            mongoose.Types.ObjectId[]; // ✅ added
  following:            mongoose.Types.ObjectId[]; // ✅ added
  // Stats — denormalized counts for fast queries (kept for leaderboards)
  followersCount:       number;
  followingCount:       number;
  totalViews:           number;
  points:               number;
  badges:               string[];
  // Auth
  emailVerified?:       Date;
  createdAt:            Date;
  updatedAt:            Date;
}

const UserSchema = new Schema<IUser>(
  {
    name:  { type: String, required: true, trim: true, maxlength: 100 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    image: { type: String },
    role: {
      type:     String,
      enum:     ['admin', 'teacher', 'student'],
      required: true,
      default:  'student',
    },
    teacherStatus: {
      type:    String,
      enum:    ['pending', 'approved', 'rejected', 'suspended'],
      default: undefined,
    },
    teacherRejectionNote: { type: String },
    onboardingCompleted:  { type: Boolean, default: false },
    // Shared
    bio:   { type: String, maxlength: 500, trim: true },
    phone: { type: String, trim: true },
    city:  { type: String, trim: true },
    state: { type: String, trim: true },
    // Teacher
    subjects:          [{ type: String, trim: true }],
    classes:           [{ type: String, trim: true }],
    boards:            [{ type: String, trim: true }],
    qualifications:    { type: String, trim: true },
    yearsOfExperience: { type: Number, min: 0, max: 60 },
    profileVideoUrl:   { type: String },
    // Student
    studentClass: { type: String, trim: true },
    studentBoard: { type: String, trim: true },
    school:       { type: String, trim: true },
    // Follow system arrays ✅
    followers: [{ type: Schema.Types.ObjectId, ref: 'User', default: [] }],
    following: [{ type: Schema.Types.ObjectId, ref: 'User', default: [] }],
    // Denormalized counts (sync these when followers/following arrays change)
    followersCount: { type: Number, default: 0, min: 0 },
    followingCount: { type: Number, default: 0, min: 0 },
    totalViews:     { type: Number, default: 0, min: 0 },
    points:         { type: Number, default: 0, min: 0 },
    badges:         [{ type: String }],
    // Auth
    emailVerified: { type: Date },
  },
  {
    timestamps: true,
    toJSON:   { virtuals: true },
    toObject: { virtuals: true },
  }
);

UserSchema.index({ email: 1 });
UserSchema.index({ role: 1, teacherStatus: 1 });
UserSchema.index({ points: -1 });
UserSchema.index({ totalViews: -1 });
UserSchema.index({ createdAt: -1 });

const User: Model<IUser> =
  mongoose.models.User ?? mongoose.model<IUser>('User', UserSchema);

export default User;
