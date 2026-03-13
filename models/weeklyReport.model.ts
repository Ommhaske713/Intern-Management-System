import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IWeeklyReport extends Document {
  batchId: mongoose.Types.ObjectId;
  internId: mongoose.Types.ObjectId;
  weekNumber: number;
  workSummary: string;
  challengesFaced: string;
  learnings: string;
  submittedAt: Date;
  status?: string;
}

const WeeklyReportSchema: Schema<IWeeklyReport> = new Schema(
  {
    batchId: {
      type: Schema.Types.ObjectId,
      ref: 'Batch',
      required: true,
    },
    internId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    weekNumber: {
      type: Number,
      required: true,
    },
    workSummary: {
      type: String,
      required: true,
    },
    challengesFaced: {
      type: String,
      required: true,
    },
    learnings: {
      type: String,
      required: true,
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      default: 'PENDING', 
    },
  },
  {
    timestamps: true,
  }
);


WeeklyReportSchema.index({ batchId: 1, internId: 1, weekNumber: 1 }, { unique: true });

const WeeklyReport: Model<IWeeklyReport> =
  mongoose.models.WeeklyReport || mongoose.model<IWeeklyReport>('WeeklyReport', WeeklyReportSchema);

export default WeeklyReport;
