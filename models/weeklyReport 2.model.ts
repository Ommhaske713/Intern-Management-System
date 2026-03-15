import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IWeeklyReport extends Document {
  batchId: mongoose.Types.ObjectId;
  internId: mongoose.Types.ObjectId;
  weekNumber: number;
  tasksWorkingOn: mongoose.Types.ObjectId[];
  workSummary: string;
  challengesFaced: string;
  learnings: string;
  mentorFeedback?: string;
  submittedAt: Date;
  status?: string;
}

const WeeklyReportSchema = new Schema<IWeeklyReport>(
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
    tasksWorkingOn: [{
      type: Schema.Types.ObjectId,
      ref: 'Task'
    }],
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
    mentorFeedback: {
      type: String,
    },
    status: {
      type: String,
      enum: ['PENDING', 'REVIEWED'],
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