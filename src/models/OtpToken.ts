import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IOtpToken extends Document {
  email:     string;
  otp:       string;    // bcrypt hashed
  expiresAt: Date;
  attempts:  number;    // max 5 before token is invalidated
  createdAt: Date;
}

const OtpTokenSchema = new Schema<IOtpToken>(
  {
    email:     { type: String, required: true, lowercase: true, trim: true },
    otp:       { type: String, required: true },
    expiresAt: { type: Date,   required: true },
    attempts:  { type: Number, default: 0 },
  },
  { timestamps: true }
);

/* TTL index: MongoDB auto-deletes expired OTP documents */
OtpTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
OtpTokenSchema.index({ email: 1 });

const OtpToken: Model<IOtpToken> =
  mongoose.models.OtpToken ?? mongoose.model<IOtpToken>('OtpToken', OtpTokenSchema);

export default OtpToken;
