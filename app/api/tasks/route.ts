import { NextRequest, NextResponse } from 'next/server';
import { taskController } from '@/server/controllers/task.controller';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/core/auth/authOptions';

export async function POST(req: NextRequest) {
  const task = await taskController.createTask(req);
  return task || NextResponse.json({ error: 'Failed to create task' }, { status: 500 });
}

export async function GET(req: NextRequest) {
  return await taskController.getTasks(req);
}