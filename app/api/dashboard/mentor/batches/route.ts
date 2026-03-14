import { NextResponse } from 'next/server';
import dbConnect from '@/core/db/dbConnect';
import Batch from '@/models/batch.model';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/core/auth/authOptions';
import User from '@/models/user.model';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || (session.user as any).role !== 'MENTOR') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const mentorId = (session.user as any).id;

    const batches = await Batch.find({ mentorIds: mentorId })
      .populate('internIds', 'name email hasCompletedOnboarding')
      .sort({ createdAt: -1 });

    return NextResponse.json(batches);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}