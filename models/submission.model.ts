import mongoose, { Schema, Document, Model } from 'mongoose';
import { ProofOfWorkType } from './program.model';

export enum ReviewStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REWORK = 'REWORK',
}

export interface ISubmission extends Document {
  taskId: mongoose.Types.ObjectId;
  internId: mongoose.Types.ObjectId;
  proofOfWorkType: ProofOfWorkType;
  proofLink: string;
  explanation: string;
  reviewStatus: ReviewStatus;
  feedback?: string;
  submittedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const SubmissionSchema: Schema<ISubmission> = new Schema(
  {
    taskId: {
      type: Schema.Types.ObjectId,
      ref: 'Task',
      required: true,
    },
    internId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    proofOfWorkType: {
      type: String,
      enum: Object.values(ProofOfWorkType),
      required: true,
    },
    proofLink: {
      type: String,
      required: true,
    },
    explanation: {
      type: String,
    },
    reviewStatus: {
      type: String,
      enum: Object.values(ReviewStatus),
      default: ReviewStatus.PENDING,
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const Submission: Model<ISubmission> =
  mongoose.models.Submission || mongoose.model<ISubmission>('Submission', SubmissionSchema);

export default Submission;
