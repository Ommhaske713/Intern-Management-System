import Submission, { ISubmission, ReviewStatus } from '@/models/submission.model';

export class SubmissionService {
  
  async createSubmission(data: Partial<ISubmission>): Promise<ISubmission> {
    const submission = new Submission(data);
    return await submission.save();
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
    return await Submission.findByIdAndUpdate(
      id,
      {
        reviewStatus: status,
        feedback: feedback,
      },
      { new: true }
    );
  }
}

export const submissionService = new SubmissionService();