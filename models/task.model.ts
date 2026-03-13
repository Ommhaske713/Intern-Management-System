import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ITask extends Document {
  batchId: mongoose.Types.ObjectId;
  assignedBy: mongoose.Types.ObjectId; // Mentor
  assignedTo?: mongoose.Types.ObjectId; // Optional: If null = Task for entire Batch. If set = Task for specific Intern.
  
  title: string;
  description: string;
  weekNumber: number;
  deadline?: Date; 
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
      default: null, // Default null implies broadcast to entire batch
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
      type: Date, // Optional deadline
    },
  },
  {
    timestamps: true,
  }
);

const Task: Model<ITask> = mongoose.models.Task || mongoose.model<ITask>('Task', TaskSchema);

export default Task;
