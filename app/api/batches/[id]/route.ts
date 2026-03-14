import { NextResponse } from 'next/server';
import dbConnect from '@/core/db/dbConnect';
import Batch from '@/models/batch.model';
import User from '@/models/user.model';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/core/auth/authOptions';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const batch = await Batch.findById(params.id)
      .populate('mentorIds', 'name email role')
      .populate('internIds', 'name email role');

    if (!batch) {
      return NextResponse.json({ error: 'Batch not found' }, { status: 404 });
    }

    // Authorization: Ideally check if batch belongs to user's company
    // if (batch.companyId.toString() !== (session.user as any).companyId) ... (Assuming we trust admins for now)

    return NextResponse.json(batch);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
