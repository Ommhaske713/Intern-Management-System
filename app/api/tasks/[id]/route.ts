import { NextRequest } from 'next/server';
import { taskController } from '@/server/controllers/task.controller';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  return await taskController.getTaskById(req, { params });
}