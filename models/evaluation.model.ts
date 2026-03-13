import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICriteriaScore {
  criteriaKey: string;
  score: number;
}

export interface IEvaluation extends Document {
  batchId: mongoose.Types.ObjectId;
  internId: mongoose.Types.ObjectId;
  mentorId: mongoose.Types.ObjectId;
  criteriaScores: ICriteriaScore[];
  finalWeightedScore: number;
  qualitativeFeedback: string;
  evaluationCompleted: boolean;
  evaluatedAt: Date;
}

const EvaluationSchema: Schema<IEvaluation> = new Schema(
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
    mentorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    criteriaScores: [
      {
        criteriaKey: String,
        score: Number,
      },
    ],
    finalWeightedScore: {
      type: Number,
      required: true,
    },
    qualitativeFeedback: {
      type: String,
      required: true,
    },
    evaluationCompleted: {
      type: Boolean,
      default: true,
    },
    evaluatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const Evaluation: Model<IEvaluation> =
  mongoose.models.Evaluation || mongoose.model<IEvaluation>('Evaluation', EvaluationSchema);

export default Evaluation;
