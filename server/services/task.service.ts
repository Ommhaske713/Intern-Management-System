import mongoose from 'mongoose';
import Task, { ITask } from '@/models/task.model';
import User, { UserRole } from '@/models/user.model';
import Batch from '@/models/batch.model';

export class TaskService {
  async createTask(data: Partial<ITask>): Promise<ITask> {
    const task = new Task(data);
    return await task.save();
  }

  async getTasksForUser(userId: string, role: string, filters: { assignedTo?: string } = {}): Promise<ITask[]> {
    if (role === UserRole.ADMIN || role === UserRole.MENTOR) {
      const query: any = {};
      
      if (filters.assignedTo) {
        query.$or = [
            { assignedTo: filters.assignedTo },
            
        ];
      }
      
      return await Task.find(query)
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