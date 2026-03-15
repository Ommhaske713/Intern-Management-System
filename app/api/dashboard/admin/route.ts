import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/core/auth/authOptions';
import { UserRole } from '@/models/user.model';
import dbConnect from '@/core/db/dbConnect';
import Batch from '@/models/batch.model';
import Task, { TaskStatus } from '@/models/task.model';
import Submission, { ReviewStatus } from '@/models/submission.model';
import User from '@/models/user.model';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || (session.user as any).role !== UserRole.ADMIN) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const totalBatches = await Batch.countDocuments();
    const activeBatches = await Batch.countDocuments({ currentStatus: 'ONGOING' });
    const mentors = await User.countDocuments({ role: UserRole.MENTOR });
    const interns = await User.countDocuments({ role: UserRole.INTERN, isActive: true });

    const totalTasks = await Task.countDocuments();
    const completedTasks = await Task.countDocuments({ status: TaskStatus.COMPLETED });
    const submissionCount = await Submission.countDocuments();

    const recentSubmissions = await Submission.find({ reviewStatus: 'PENDING' })
        .sort({ submittedAt: -1 })
        .limit(5)
        .populate('internId', 'name email')
        .populate('taskId', 'title');

    return NextResponse.json({
      batches: { total: totalBatches, active: activeBatches },
      users: { mentors, interns },
      tasks: { total: totalTasks, completed: completedTasks },
      submissions: { total: submissionCount },
      recentActivity: recentSubmissions
    });

  } catch (error: any) {
    console.error("Dashboard Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}