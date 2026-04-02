import mongoose, { Schema, Document, models } from 'mongoose';

export interface IReferral extends Document {
  referrerId:     string;   // teacher who owns the code
  referredUserId: string;   // new teacher who used the code
  code:           string;
  status:         'pending' | 'credited';
  pointsAwarded:  number;
  createdAt:      Date;
}

const ReferralSchema = new Schema<IReferral>({
  referrerId:     { type: String, required: true },
  referredUserId: { type: String, required: true },
  code:           { type: String, required: true },
  status:         { type: String, enum: ['pending', 'credited'], default: 'pending' },
  pointsAwarded:  { type: Number, default: 50 },
}, { timestamps: true });

export default models.Referral || mongoose.model<IReferral>('Referral', ReferralSchema);