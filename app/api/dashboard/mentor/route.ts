import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/core/auth/authOptions';
import { UserRole } from '@/models/user.model';
import dbConnect from '@/core/db/dbConnect';
import Batch from '@/models/batch.model';
import Task, { TaskStatus } from '@/models/task.model';
import Submission, { ReviewStatus } from '@/models/submission.model';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = session.user as any;
    if (user.role !== 'MENTOR' && user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const mentorId = user.id;

    const batches = await Batch.find({ mentorIds: mentorId });
    const batchIds = batches.map(b => b._id);
    
    let totalInterns = 0;
    batches.forEach(b => totalInterns += (b.internIds ? b.internIds.length : 0));

    const tasks = await Task.find({
        $or: [
            { batchId: { $in: batchIds } },
            { assignedBy: mentorId }
        ]
    }).select('_id batchId assignedTo status');
    
    const taskIds = tasks.map(t => t._id);

    const batchInternCounts: Record<string, number> = {};
    batches.forEach(b => {
        batchInternCounts[b._id.toString()] = b.internIds ? b.internIds.length : 0;
    });

    let totalExpectedSubmissions: number = 0;
    tasks.forEach((task: any) => {
        if (task.assignedTo) {
            totalExpectedSubmissions += 1;
        } else if (task.batchId && batchInternCounts[task.batchId.toString()]) {
            totalExpectedSubmissions += batchInternCounts[task.batchId.toString()];
        } else {
             totalExpectedSubmissions += 1; 
        }
    });

    const approvedSubmissions = await Submission.countDocuments({
        taskId: { $in: taskIds },
        reviewStatus: ReviewStatus.APPROVED
    });

    const pendingReviews = await Submission.countDocuments({
        taskId: { $in: taskIds },
        reviewStatus: ReviewStatus.PENDING
    });

    const completionRate = totalExpectedSubmissions > 0 
        ? Math.round((approvedSubmissions / totalExpectedSubmissions) * 100) 
        : 0;

    return NextResponse.json({
        totalInterns,
        pendingReviews,
        completionRate,
        activeBatches: batches.length,
        totalTasks: totalExpectedSubmissions
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}