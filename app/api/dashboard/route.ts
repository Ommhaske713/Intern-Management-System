import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/core/auth/authOptions';
import { UserRole } from '@/models/user.model';
import dbConnect from '@/core/db/dbConnect';
import { dashboardService } from '@/server/services/dashboard.service';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    let data;
    if (session.user.role === UserRole.ADMIN) {
        data = await dashboardService.getAdminStats();
    } else if (session.user.role === UserRole.MENTOR) {
        data = await dashboardService.getMentorStats(session.user.id);
    } else {
        return NextResponse.json({ message: "Welcome Intern" });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Dashboard Stats Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}