import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ITeacher extends Document {
  userId:            string;
  name:              string;
  email:             string;
  image:             string | null;

  // Profile
  bio:               string;
  city:              string;
  state:             string;
  yearsOfExperience: number;

  // Teaching info
  subjects:          string[];
  classes:           string[];
  boards:            string[];

  // Account status
  teacherStatus:     'pending' | 'active' | 'rejected' | 'suspended';

  // Social
  followers:         string[];

  // Referral
  referralCode:      string | null;
  referralPoints:    number;
  freeMonthsEarned:  number;
  usedReferralCode:  string | null;
  pendingFreeMonths: number;          // ✅ NEW

  createdAt:         Date;
  updatedAt:         Date;
}

const TeacherSchema = new Schema<ITeacher>(
  {
    userId:            { type: String, required: true, unique: true },
    name:              { type: String, required: true, trim: true },
    email:             { type: String, required: true, trim: true, lowercase: true },
    image:             { type: String, default: null },

    // Profile
    bio:               { type: String, default: '' },
    city:              { type: String, default: '' },
    state:             { type: String, default: '' },
    yearsOfExperience: { type: Number, default: 0 },

    // Teaching info
    subjects:          { type: [String], default: [] },
    classes:           { type: [String], default: [] },
    boards:            { type: [String], default: [] },

    // Account status
    teacherStatus: {
      type:    String,
      enum:    ['pending', 'active', 'rejected', 'suspended'],
      default: 'pending',
    },

    // Social
    followers:         { type: [String], default: [] },

    // Referral
    referralCode:      { type: String, default: undefined, unique: true, sparse: true },
    referralPoints:    { type: Number, default: 0 },
    freeMonthsEarned:  { type: Number, default: 0 },
    usedReferralCode:  { type: String, default: null },
    pendingFreeMonths: { type: Number, default: 0 },   // ✅ NEW
  },
  {
    timestamps: true,
  }
);

const Teacher: Model<ITeacher> =
  mongoose.models.Teacher ?? mongoose.model<ITeacher>('Teacher', TeacherSchema);

export default Teacher;