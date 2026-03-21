import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUploadLog extends Document {
  teacherId: mongoose.Types.ObjectId | string;
  period:    'day' | 'month' | 'platform-day';
  date?:     string;   // 'YYYY-MM-DD' — only on period:'day'
  month?:    string;   // 'YYYY-MM'    — only on period:'month' & 'platform-day'
  uploadsToday:   number;
  uploadsMonth:   number;
  bytesUsed:      number;
  classAOpsToday: number;
  classAOpsMonth: number;
  createdAt: Date;
  updatedAt: Date;
}

const UploadLogSchema = new Schema<IUploadLog>(
  {
    teacherId:      { type: Schema.Types.Mixed, required: true },
    period:         { type: String, enum: ['day', 'month', 'platform-day'], required: true },
    date:           { type: String },
    month:          { type: String },   // ✅ FIX: removed required:true — day records don't have month
    uploadsToday:   { type: Number, default: 0 },
    uploadsMonth:   { type: Number, default: 0 },
    bytesUsed:      { type: Number, default: 0 },
    classAOpsToday: { type: Number, default: 0 },
    classAOpsMonth: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// ✅ FIX: day uniqueness — one doc per teacher per calendar day
UploadLogSchema.index(
  { teacherId: 1, period: 1, date: 1 },
  { unique: true, sparse: true }
);

// ✅ FIX: month uniqueness — partialFilterExpression so this index ONLY
//         applies to period:'month' docs, never touches day records
UploadLogSchema.index(
  { teacherId: 1, month: 1 },
  {
    unique: true,
    partialFilterExpression: { period: 'month' },
  }
);

const UploadLog: Model<IUploadLog> =
  mongoose.models.UploadLog ?? mongoose.model<IUploadLog>('UploadLog', UploadLogSchema);

export default UploadLog;
