import mongoose, { Schema, Document, Model } from 'mongoose';

export enum TaskStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in-progress',
  SUBMITTED = 'submitted',
  NEEDS_REWORK = 'needs-rework',
  COMPLETED = 'completed',
}

export enum ProofType {
  GITHUB_LINK = 'github-link',
  DEPLOYED_URL = 'deployed-url',
  DOCUMENT = 'document',
}

export interface ITask extends Document {
  title: string;
  description: string;
  assignedTo: mongoose.Types.ObjectId; // Intern
  assignedBy: mongoose.Types.ObjectId; // Mentor
  deadline: Date;
  status: TaskStatus;
  proofType: ProofType;
  submissionRequirements?: string; // Specific instructions
  createdAt: Date;
  updatedAt: Date;
}

const TaskSchema: Schema<ITask> = new Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a task title'],
      trim: true,
      maxlength: [100, 'Title cannot be more than 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Please provide a task description'],
    },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    assignedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    deadline: {
      type: Date,
      required: [true, 'Please provide a deadline'],
    },
    status: {
      type: String,
      enum: Object.values(TaskStatus),
      default: TaskStatus.PENDING,
    },
    proofType: {
      type: String,
      enum: Object.values(ProofType),
      required: [true, 'Please specify the required proof type'],
    },
    submissionRequirements: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const Task: Model<ITask> = mongoose.models.Task || mongoose.model<ITask>('Task', TaskSchema);

export default Task;