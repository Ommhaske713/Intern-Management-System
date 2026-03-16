import { NextResponse } from 'next/server';
import dbConnect from '@/core/db/dbConnect';
import Batch from '@/models/batch.model';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/core/auth/authOptions';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);

    const body = await req.json();
    const { userId, role } = body;
    const batchId = params.id;

    if (!userId || !role || !batchId) {
      return NextResponse.json({ error: 'User ID, Role, and Batch ID required' }, { status: 400 });
    }

    await dbConnect();

    if (!session || !session.user || (session.user as any).role !== 'ADMIN') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const batch = await Batch.findById(batchId);
    if (!batch) return NextResponse.json({ error: 'Batch not found' }, { status: 404 });
    
    if (batch.companyId.toString() !== (session?.user as any).companyId) {
         return NextResponse.json({ error: 'Unauthorized batch access' }, { status: 403 });
    }
    
    const updateField = role === 'MENTOR' ? 'mentorIds' : 'internIds';

    await Batch.findByIdAndUpdate(batchId, {
        $pull: { [updateField]: userId }
    });

    return NextResponse.json({ message: 'User removed from batch successfully' });

  } catch (error: any) {
    console.error('Error removing user from batch:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}