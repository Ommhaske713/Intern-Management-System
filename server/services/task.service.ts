import mongoose from 'mongoose';
import Task, { ITask } from '@/models/task.model';
import User, { UserRole } from '@/models/user.model';
import Batch from '@/models/batch.model';

export class TaskService {
  async createTask(data: Partial<ITask>): Promise<ITask> {
    const task = new Task(data);
    return await task.save();
  }

  async getTasksForUser(userId: string, role: string): Promise<ITask[]> {
    if (role === UserRole.ADMIN || role === UserRole.MENTOR) {
      return await Task.find()
        .sort({ createdAt: -1 })
        .populate('assignedTo', 'name email')
        .populate('assignedBy', 'name');
    }

    const userBatches = await Batch.find({ internIds: userId }).select('_id');
    const batchIds = userBatches.map(b => b._id);

    return await Task.find({
      $or: [
        { assignedTo: userId },
        { assignedTo: null, batchId: { $in: batchIds } }
      ]
    })
      .sort({ deadline: 1 })
      .populate('assignedBy', 'name');
  }

  async getTaskById(taskId: string): Promise<ITask | null> {
    return await Task.findById(taskId)
      .populate('assignedTo')
      .populate('assignedBy');
  }

  async updateTask(taskId: string, data: Partial<ITask>): Promise<ITask | null> {
    return await Task.findByIdAndUpdate(taskId, data, { new: true });
  }

  async deleteTask(taskId: string): Promise<ITask | null> {
    return await Task.findByIdAndDelete(taskId);
  }
}

export const taskService = new TaskService();