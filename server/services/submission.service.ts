import Submission, { ReviewStatus } from '../../models/submission.model';
import Task, { TaskStatus } from '../../models/task.model';
import { ISubmission } from '../../models/submission.model';

export class SubmissionService {
  
  async createSubmission(data: Partial<ISubmission>): Promise<ISubmission> {
    const submission = new Submission(data);
    const savedSubmission = await submission.save();

    if (data.taskId) {
      await Task.findByIdAndUpdate(data.taskId, { status: TaskStatus.SUBMITTED });
    }

    return savedSubmission;
  }

  async getSubmissionsForTask(taskId: string): Promise<ISubmission[]> {
    return await Submission.find({ taskId }).populate('internId', 'name email').sort({ createdAt: -1 });
  }

  async getSubmissionsForIntern(internId: string): Promise<ISubmission[]> {
    return await Submission.find({ internId }).populate('taskId', 'title deadline').sort({ createdAt: -1 });
  }

  async getAllSubmissions(): Promise<ISubmission[]> {
    return await Submission.find()
      .populate('taskId', 'title deadline')
      .populate('internId', 'name email')
      .sort({ createdAt: -1 })
      .limit(100);
  }

  async reviewSubmission(id: string, status: ReviewStatus, feedback?: string): Promise<ISubmission | null> {
    const submission = await Submission.findByIdAndUpdate(
      id,
      {
        reviewStatus: status,
        feedback: feedback,
      },
      { new: true }
    )
    .populate('internId', 'name email')
    .populate('taskId', 'title');

    if (submission) {
      const taskId = (submission.taskId as any)._id || submission.taskId;

      if (status === ReviewStatus.APPROVED) {

        await Task.findByIdAndUpdate(taskId, { status: TaskStatus.COMPLETED });
      } else if (status === ReviewStatus.REWORK) {
        
        await Task.findByIdAndUpdate(taskId, { status: TaskStatus.IN_PROGRESS });
      }
    }

    return submission;
  }
}

export const submissionService = new SubmissionService();