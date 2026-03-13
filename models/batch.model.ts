import mongoose, { Schema, Document, Model } from 'mongoose';

export enum BatchStatus {
  PLANNED = 'PLANNED',
  ONGOING = 'ONGOING',
  COMPLETED = 'COMPLETED',
}

export interface IBatch extends Document {
  companyId: mongoose.Types.ObjectId;
  programDefinitionId: mongoose.Types.ObjectId;
  mentorIds: mongoose.Types.ObjectId[];
  internIds: mongoose.Types.ObjectId[];
  startDate: Date;
  endDate?: Date;
  durationInWeeks: number;
  currentStatus: BatchStatus;
  createdAt: Date;
  updatedAt: Date;
}

const BatchSchema: Schema<IBatch> = new Schema(
  {
    companyId: {
      type: Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
    },
    programDefinitionId: {
      type: Schema.Types.ObjectId,
      ref: 'ProgramDefinition',
      required: true,
    },
    mentorIds: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    internIds: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    startDate: {
      type: Date,
      required: true,
    },
    durationInWeeks: {
      type: Number,
      required: true,
    },
    currentStatus: {
      type: String,
      enum: Object.values(BatchStatus),
      default: BatchStatus.PLANNED,
    },
  },
  {
    timestamps: true,
  }
);

const Batch: Model<IBatch> = mongoose.models.Batch || mongoose.model<IBatch>('Batch', BatchSchema);

export default Batch;