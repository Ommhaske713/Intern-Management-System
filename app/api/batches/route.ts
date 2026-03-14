import { NextResponse } from 'next/server';
import dbConnect from '@/core/db/dbConnect';
import Batch, { BatchStatus } from '@/models/batch.model';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/core/auth/authOptions';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    // Fetch batches for this company
    const batches = await Batch.find({ companyId: (session.user as any).companyId })
      .sort({ createdAt: -1 })
      .populate('mentorIds', 'name email role')
      .populate('internIds', 'name email role');

    return NextResponse.json(batches);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, startDate, durationInWeeks } = await req.json();

    if (!name || !startDate) {
      return NextResponse.json({ error: 'Name and Start Date are required' }, { status: 400 });
    }

    await dbConnect();

    const newBatch = await Batch.create({
      companyId: (session.user as any).companyId,
      name,
      startDate: new Date(startDate),
      durationInWeeks: durationInWeeks || 12,
      currentStatus: BatchStatus.PLANNED,
      mentorIds: [],
      internIds: [],
    });

    return NextResponse.json(newBatch, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}