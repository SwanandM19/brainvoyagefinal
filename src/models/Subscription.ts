import mongoose, { Schema, Document, Model } from 'mongoose';

export type SubStatus = 'trial' | 'active' | 'past_due' | 'cancelled' | 'pending';

export interface ISubscription extends Document {
  teacherId:              mongoose.Types.ObjectId;
  razorpaySubscriptionId?: string;
  razorpayCustomerId?:    string;
  planId:                 string;
  status:                 SubStatus;
  isActive:               boolean;
  trialEndsAt?:           Date;
  currentPeriodStart?:    Date;
  currentPeriodEnd?:      Date;
  cancelledAt?:           Date;
  createdAt:              Date;
  updatedAt:              Date;
}

const SubscriptionSchema = new Schema<ISubscription>(
  {
    teacherId:              { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    razorpaySubscriptionId: { type: String, unique: true, sparse: true },
    razorpayCustomerId:     { type: String },
    planId:                 { type: String, required: true },
    status:                 { type: String, enum: ['trial','active','past_due','cancelled','pending'], default: 'pending' },
    isActive:               { type: Boolean, default: false },
    trialEndsAt:            { type: Date },
    currentPeriodStart:     { type: Date },
    currentPeriodEnd:       { type: Date },
    cancelledAt:            { type: Date },
  },
  { timestamps: true }
);

SubscriptionSchema.index({ teacherId: 1 });
SubscriptionSchema.index({ razorpaySubscriptionId: 1 });
SubscriptionSchema.index({ status: 1 });

const Subscription: Model<ISubscription> =
  mongoose.models.Subscription ?? mongoose.model<ISubscription>('Subscription', SubscriptionSchema);

export default Subscription;
