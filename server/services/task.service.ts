import mongoose from 'mongoose';
import Task, { ITask } from '@/models/task.model';
import User, { UserRole } from '@/models/user.model';
import Batch from '@/models/batch.model';
import Submission, { ISubmission } from '@/models/submission.model';
import { sendTaskAssignedEmail } from '@/lib/email';

export class TaskService {
  async createTask(data: Partial<ITask>): Promise<ITask> {
    const task = new Task(data);
    const savedTask = await task.save();

    try {
        if (data.assignedTo) {

            const intern = await User.findById(data.assignedTo);
            if (intern && intern.email) {
                await sendTaskAssignedEmail(
                    intern.email, 
                    intern.name, 
                    data.title || 'New Task', 
                    `${process.env.NEXTAUTH_URL}/dashboard/tasks/${savedTask._id}`
                );
            }
        } else if (data.batchId) {

            const batch = await Batch.findById(data.batchId).populate('internIds', 'name email');
            if (batch && batch.internIds) {
                const interns = batch.internIds as any[];
                await Promise.allSettled(interns.map(intern => {
                    if (intern.email) {
                        return sendTaskAssignedEmail(
                            intern.email, 
                            intern.name, 
                            data.title || 'New Task', 
                            `${process.env.NEXTAUTH_URL}/dashboard/tasks/${savedTask._id}`
                        );
                    }
                }));
            }
        }
    } catch (error) {
        console.error("Failed to send task notification emails:", error);
    }

    return savedTask;
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

  async getInternTasksWithStatus(userId: string): Promise<{ task: ITask, submission?: ISubmission }[]> {
    const userBatches = await Batch.find({ internIds: userId }).select('_id');
    const batchIds = userBatches.map(b => b._id);

    const tasks = await Task.find({
      $or: [
        { assignedTo: userId },
        { assignedTo: null, batchId: { $in: batchIds } }
      ]
    })
      .sort({ deadline: 1 })
      .populate('assignedBy', 'name');

    const taskIds = tasks.map(t => t._id);
    const submissions = await Submission.find({ 
        taskId: { $in: taskIds },
        internId: userId 
    });

    const submissionMap = new Map();
    submissions.forEach(s => submissionMap.set(s.taskId.toString(), s));

    return tasks.map(task => ({
        task,
        submission: submissionMap.get(task._id.toString())
    }));
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