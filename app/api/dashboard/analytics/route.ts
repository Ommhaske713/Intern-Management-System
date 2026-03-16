import { NextResponse } from 'next/server';
import dbConnect from '@/core/db/dbConnect';
import { dashboardService } from '@/server/services/dashboard.service';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/core/auth/authOptions';
import { UserRole } from '@/models/user.model';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    if (session.user.role !== UserRole.ADMIN && session.user.role !== UserRole.MENTOR) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await dbConnect();
    
    const mentorId = session.user.role === UserRole.MENTOR ? session.user.id : undefined;
    
    const analytics = await dashboardService.getAnalyticsData(mentorId);

    return NextResponse.json(analytics);
  } catch (error: any) {
    console.error("Dashboard Analytics Error:", error);
    return NextResponse.json({ 
        error: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
}