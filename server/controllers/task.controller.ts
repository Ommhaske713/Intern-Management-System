import { NextResponse } from 'next/server';
import { taskService } from '../services/task.service';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/core/auth/authOptions';
import User, { UserRole } from '@/models/user.model';
import dbConnect from '@/core/db/dbConnect';

export class TaskController {
  
  async createTask(req: Request) {
    try {
      await dbConnect();
      const session = await getServerSession(authOptions);
      if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      if (session.user.role !== UserRole.ADMIN && session.user.role !== UserRole.HR) {
        // return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }

      const body = await req.json();
      const task = await taskService.createTask({
        ...body,
        assignedBy: session.user.id,
      });

      return NextResponse.json(task, { status: 201 });
    } catch (error: any) {
      console.error('Error creating task:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  async getTasks(req: Request) {
    try {
      await dbConnect();
      const session = await getServerSession(authOptions);
      if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      
      const user = await User.findById(session.user.id);
      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      const tasks = await taskService.getTasksForUser(user._id.toString(), user.role);
      return NextResponse.json(tasks, { status: 200 });
    } catch (error: any) {
      console.error('Error fetching tasks:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }
}

export const taskController = new TaskController();