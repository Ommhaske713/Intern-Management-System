import { UserRole } from '@/models/user.model';
import User from '@/models/user.model';
import Batch, { BatchStatus } from '@/models/batch.model';
import Task, { TaskStatus } from '@/models/task.model';
import Submission, { ReviewStatus } from '@/models/submission.model';

export class DashboardService {
  async getAdminStats() {
    const totalBatches = await Batch.find().countDocuments();
    const activeBatches = await Batch.find({ currentStatus: BatchStatus.ONGOING }).countDocuments();

    const mentors = await User.find({ role: UserRole.MENTOR }).countDocuments();
    const activeInterns = await User.find({ role: UserRole.INTERN, isActive: true }).countDocuments();

    const totalSubmissions = await Submission.find().countDocuments();
    const pendingSubmissions = await Submission.find({ reviewStatus: ReviewStatus.PENDING }).countDocuments();

    const totalTasks = await Task.find().countDocuments();
    const completedTasks = await Task.find({ status: TaskStatus.COMPLETED }).countDocuments();
    
    return {
      batches: { total: totalBatches, active: activeBatches },
      users: { mentors, interns: activeInterns },
      submissions: { total: totalSubmissions, pending: pendingSubmissions },
      tasks: { total: totalTasks, completed: completedTasks, completionRate: totalTasks > 0 ? Math.round((completedTasks/totalTasks) * 100) : 0 },
    };
  }

  async getRecentActivities() {
    
    const recentSubmissions = await Submission.find()
      .sort({ submittedAt: -1 })
      .limit(5)
      .populate('internId', 'name email')
      .populate('taskId', 'title');

    return {
      recentSubmissions
    };
  }
}

export const dashboardService = new DashboardService();