import Evaluation, { IEvaluation } from '@/models/evaluation.model';
import Task, { TaskStatus } from '@/models/task.model';
import WeeklyReport from '@/models/weeklyReport.model';
import Batch from '@/models/batch.model';
import User from '@/models/user.model';
import mongoose from 'mongoose';

interface InternSummary {
  internId: string;
  name: string;
  email: string;
  tasksCompleted: number;
  tasksAssigned: number;
  reportsSubmitted: number;
  status: "PENDING" | "COMPLETED";
}

export class EvaluationService {
  
  async getInternSummaries(mentorId?: string): Promise<InternSummary[]> {

    const query = mentorId ? { mentorIds: mentorId } : {};
    const batches = await Batch.find(query).populate('internIds', 'name email');
    
    const summaries: InternSummary[] = [];
    const processedInterns = new Set<string>();

    for (const batch of batches) {
      for (const intern of (batch.internIds as any[])) {
        if (processedInterns.has(intern._id.toString())) continue;
        processedInterns.add(intern._id.toString());
        
        const totalTasks = await Task.countDocuments({
          batchId: batch._id,
          $or: [{ assignedTo: intern._id }, { assignedTo: null }]
        });

        const completedTasks = await Task.countDocuments({
          batchId: batch._id,
          $or: [{ assignedTo: intern._id }, { assignedTo: null }],
          status: TaskStatus.COMPLETED
        });

        const reportCount = await WeeklyReport.countDocuments({
          internId: intern._id,
          batchId: batch._id
        });
        
        const evaluation = await Evaluation.findOne({ 
          internId: intern._id, 
          batchId: batch._id 
        });

        summaries.push({
          internId: intern._id,
          name: intern.name,
          email: intern.email,
          tasksCompleted: completedTasks,
          tasksAssigned: totalTasks,
          reportsSubmitted: reportCount,
          status: evaluation ? "COMPLETED" : "PENDING"
        });
      }
    }

    return summaries;
  }

  async createEvaluation(data: Partial<IEvaluation>): Promise<IEvaluation> {
    const existing = await Evaluation.findOne({ internId: data.internId, batchId: data.batchId });
    if (existing) {
      throw new Error("Intern has already been evaluated for this batch.");
    }
    const evaluation = new Evaluation(data);
    return await evaluation.save();
  }
  
  async getEvaluation(internId: string, batchId: string): Promise<IEvaluation | null> {
    return await Evaluation.findOne({ internId, batchId });
  }
}

export const evaluationService = new EvaluationService();