import { UserRole } from '@/models/user.model';
import User from '@/models/user.model';
import Batch, { BatchStatus } from '@/models/batch.model';
import Task, { TaskStatus } from '@/models/task.model';
import Submission, { ReviewStatus } from '@/models/submission.model';
import WeeklyReport from '@/models/weeklyReport.model';
import Evaluation from '@/models/evaluation.model';

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

  async getMentorStats(mentorId: string) {

    const mentorBatches = await Batch.find({ mentorIds: mentorId });
    const batchIds = mentorBatches.map(b => b._id);
    
    const activeBatches = mentorBatches.filter(b => b.currentStatus === BatchStatus.ONGOING).length;

    const internIds = mentorBatches.flatMap(b => b.internIds);
    const uniqueInterns = new Set(internIds.map(id => id.toString())).size;

    const batchTasks = await Task.find({ batchId: { $in: batchIds } }).select('_id');
    const taskIds = batchTasks.map(t => t._id);
    
    const totalSubmissions = await Submission.countDocuments({ taskId: { $in: taskIds } });
    const pendingSubmissions = await Submission.countDocuments({ taskId: { $in: taskIds }, reviewStatus: ReviewStatus.PENDING });
    
    return {
        batches: { total: mentorBatches.length, active: activeBatches },
        interns: { total: uniqueInterns },
        submissions: { total: totalSubmissions, pending: pendingSubmissions }
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

  async getAnalyticsData(mentorId?: string) {
    console.log("Starting getAnalyticsData with mentorId:", mentorId);
    
    let batchFilter: any = {};
    let taskFilter: any = {};
    let submissionFilter: any = {};

    if (mentorId) {

        const mentorBatches = await Batch.find({ mentorIds: mentorId }).select('_id');
        const batchIds = mentorBatches.map(b => b._id);
        
        batchFilter = { _id: { $in: batchIds } };
        taskFilter = { batchId: { $in: batchIds } };
        
        const tasks = await Task.find({ batchId: { $in: batchIds } }).select('_id');
        const taskIds = tasks.map(t => t._id);
        submissionFilter = { taskId: { $in: taskIds } };
    }

    console.log("Aggregating Task Status...");
    if (!Task) throw new Error("Task model is undefined");
    const taskStatusCounts = await Task.aggregate([
      { $match: taskFilter },
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);

    console.log("Aggregating Submission Trends...");
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    if (!Submission) throw new Error("Submission model is undefined");
    const submissionTrends = await Submission.aggregate([
      { $match: { submittedAt: { $gte: sevenDaysAgo, $exists: true }, ...submissionFilter } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$submittedAt", onNull: "N/A" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id": 1 } }
    ]);

    console.log("Aggregating Batch Performance...");
    
    if (!Batch) throw new Error("Batch model is undefined");
    const batchPerformance = await Batch.aggregate([
        { $match: { currentStatus: { $ne: BatchStatus.PLANNED }, ...batchFilter } },
        {
            $lookup: {
                from: "tasks",
                let: { batchId: "$_id" },
                pipeline: [
                    { $match: { $expr: { $eq: ["$batchId", "$$batchId"] } } }
                ],
                as: "batchTasks"
            }
        },
        {
            $project: {
                name: 1,
                totalTasks: { $size: "$batchTasks" },
                completedTasks: {
                    $size: {
                        $filter: {
                            input: "$batchTasks",
                            as: "task",
                            cond: { $eq: ["$$task.status", "COMPLETED"] }
                        }
                    }
                }
            }
        },
        { $sort: { totalTasks: -1 } },
        { $limit: 10 }
    ]);
    
    console.log("Analytics aggregation complete.");

    return {
        taskDistribution: taskStatusCounts.map(t => ({ name: t._id, value: t.count })),
        submissionTrends: submissionTrends.map(s => ({ date: s._id, count: s.count })),
        batchPerformance: batchPerformance.map(b => ({
            name: b.name,
            completionRate: b.totalTasks > 0 ? Math.round((b.completedTasks / b.totalTasks) * 100) : 0
        }))
    };
  }
}


export const dashboardService = new DashboardService();