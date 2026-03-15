import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/core/auth/authOptions';
import dbConnect from '@/core/db/dbConnect';
import Submission from '@/models/submission.model';
import { submissionController } from '@/server/controllers/submission.controller';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const submission = await Submission.findById(params.id)
      .populate('internId', 'name email')
      .populate('taskId', 'title description');

    if (!submission) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
    }

    return NextResponse.json(submission);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  return await submissionController.reviewSubmission(req, { params });
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || (session.user as any).role !== 'MENTOR') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { status, feedback } = await req.json();
    if (!status) return NextResponse.json({ error: 'Status is required' }, { status: 400 });

    await dbConnect();
    const submission = await Submission.findByIdAndUpdate(
      params.id,
      { reviewStatus: status, feedback, updatedAt: new Date() },
      { new: true }
    );

    if (status === 'APPROVED' && submission) {
       const Task = (await import('@/models/task.model')).default;
       await Task.findByIdAndUpdate(submission.taskId, { status: 'COMPLETED' });
    }

    return NextResponse.json(submission);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}