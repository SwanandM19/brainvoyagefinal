import mongoose, { Schema, Document, Model } from 'mongoose';

export type GameType = 'blitz' | 'memory' | 'dash';

export interface IGameScore extends Document {
  userId:           string;
  userName:         string;
  userInitials:     string;
  avatarColor:      string;
  gameType:         GameType;
  subject:          string;
  score:            number;
  streak:           number;
  accuracy:         number;
  questionsTotal:   number;
  questionsCorrect: number;
  timeTaken:        number;
  createdAt:        Date;
}

const GameScoreSchema = new Schema<IGameScore>({
  userId:           { type: String, required: true },
  userName:         { type: String, required: true },
  userInitials:     { type: String, required: true },
  avatarColor:      { type: String, default: 'from-orange-500 to-amber-600' },
  gameType:         { type: String, enum: ['blitz', 'memory', 'dash'], required: true },
  subject:          { type: String, required: true },
  score:            { type: Number, required: true, default: 0 },
  streak:           { type: Number, default: 0 },
  accuracy:         { type: Number, default: 0 },
  questionsTotal:   { type: Number, default: 0 },
  questionsCorrect: { type: Number, default: 0 },
  timeTaken:        { type: Number, default: 0 },
}, { timestamps: true });

GameScoreSchema.index({ gameType: 1, score: -1 });
GameScoreSchema.index({ gameType: 1, subject: 1, score: -1 });
GameScoreSchema.index({ userId: 1, gameType: 1 });

const GameScore: Model<IGameScore> =
  mongoose.models.GameScore ?? mongoose.model<IGameScore>('GameScore', GameScoreSchema);

export default GameScore;
