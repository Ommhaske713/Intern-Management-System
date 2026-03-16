import { certificateService } from './certificate.service';
import Task, { TaskPriority, TaskStatus } from '@/models/task.model';
import Submission, { ISubmission, ReviewStatus } from '@/models/submission.model';

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

        const updatedTask = await Task.findByIdAndUpdate(taskId, { status: TaskStatus.COMPLETED });
        
        if (updatedTask && updatedTask.priority === TaskPriority.FINAL) {
            import('./certificate.service').then(m => {
                const internId = (submission.internId as any)._id || submission.internId;
                m.certificateService.issueCertificateForTask(taskId.toString(), internId.toString())
                    .catch(err => console.error("Auto-issue certificate failed", err));
            });
        }

      } else if (status === ReviewStatus.REWORK) {

        await Task.findByIdAndUpdate(taskId, { status: TaskStatus.IN_PROGRESS });
      }
    }

    return submission;
  }
}

export const submissionService = new SubmissionService();