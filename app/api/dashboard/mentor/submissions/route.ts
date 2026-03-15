import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/core/auth/authOptions';
import dbConnect from '@/core/db/dbConnect';
import Batch from '@/models/batch.model';
import Task from '@/models/task.model';
import Submission, { ReviewStatus } from '@/models/submission.model';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userRole = (session.user as any).role;
    if (userRole !== 'MENTOR' && userRole !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    await dbConnect();

    const mentorId = (session.user as any).id;

    const myBatches = await Batch.find({ mentorIds: mentorId }).select('_id');
    const batchIds = myBatches.map(b => b._id);

    const tasks = await Task.find({
      $or: [
        { batchId: { $in: batchIds } },
        { assignedBy: mentorId }
      ]
    }).select('_id');
    
    const taskIds = tasks.map(t => t._id);

    const submissions = await Submission.find({ 
      taskId: { $in: taskIds },
    })
    .sort({ submittedAt: -1 })
    .populate('internId', 'name email')
    .populate('taskId', 'title weekNumber')
    .limit(50);

    return NextResponse.json(submissions);

  } catch (error: any) {
    console.error("Error fetching mentor submissions:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}