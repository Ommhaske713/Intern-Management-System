import mongoose, { Schema, Document, Model } from 'mongoose';
import { ProofOfWorkType } from './program.model';

export enum TaskPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
}

export enum TaskStatus {
  ASSIGNED = 'ASSIGNED',
  IN_PROGRESS = 'IN_PROGRESS',
  SUBMITTED = 'SUBMITTED',
  COMPLETED = 'COMPLETED',
  OVERDUE = 'OVERDUE',
}

export interface ITask extends Document {
  batchId: mongoose.Types.ObjectId;
  assignedBy: mongoose.Types.ObjectId;
  assignedTo?: mongoose.Types.ObjectId;
  
  title: string;
  description: string;
  weekNumber: number;
  deadline?: Date;
  priority: TaskPriority;
  requiredProofType: ProofOfWorkType;
  status: TaskStatus;
  
  createdAt: Date;
  updatedAt: Date;
}

const TaskSchema: Schema<ITask> = new Schema(
  {
    batchId: {
      type: Schema.Types.ObjectId,
      ref: 'Batch',
      required: true,
    },
    assignedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    weekNumber: {
      type: Number,
      required: true,
    },
    deadline: {
      type: Date,
    },
    priority: {
      type: String,
      enum: Object.values(TaskPriority),
      default: TaskPriority.MEDIUM,
      required: true,
    },
    requiredProofType: {
      type: String,
      enum: Object.values(ProofOfWorkType),
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(TaskStatus),
      default: TaskStatus.ASSIGNED,
    },
  },
  {
    timestamps: true,
  }
);

const Task: Model<ITask> = mongoose.models.Task || mongoose.model<ITask>('Task', TaskSchema);

export default Task;