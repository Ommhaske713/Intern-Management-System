import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ITask extends Document {
  batchId: mongoose.Types.ObjectId;
  assignedBy: mongoose.Types.ObjectId;
  assignedTo?: mongoose.Types.ObjectId;
  
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
  },
  {
    timestamps: true,
  }
);

const Task: Model<ITask> = mongoose.models.Task || mongoose.model<ITask>('Task', TaskSchema);

export default Task;
