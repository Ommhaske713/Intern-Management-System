import { NextResponse } from 'next/server';
import { submissionService } from '../services/submission.service';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/core/auth/authOptions';
import User, { UserRole } from '@/models/user.model';
import { sendTaskGradedNotification } from '@/lib/email';
import Task, { ITask } from '@/models/task.model';

export class SubmissionController {
  
  async createSubmission(req: Request) {
    try {
      const session = await getServerSession(authOptions);
      if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const body = await req.json();
      const submission = await submissionService.createSubmission({
        ...body,
        internId: session.user.id
      });

      return NextResponse.json(submission, { status: 201 });
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  async getMySubmissions(req: Request) {
    try {
      const session = await getServerSession(authOptions);
      if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      if (session.user.role === UserRole.ADMIN || session.user.role === UserRole.MENTOR) {
         const submissions = await submissionService.getAllSubmissions();
         return NextResponse.json(submissions);
      }

      const submissions = await submissionService.getSubmissionsForIntern(session.user.id);
      return NextResponse.json(submissions);
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  async reviewSubmission(req: Request, { params }: { params: { id: string } }) {
    try {
      const session = await getServerSession(authOptions);
      if (!session || !session.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const { role } = session.user;
      if (role !== UserRole.ADMIN && role !== UserRole.MENTOR) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }

      const body = await req.json();
      const { status, feedback } = body;

      const submission = await submissionService.reviewSubmission(params.id, status, feedback);
      if (!submission) {
        return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
      }

      const intern = submission.internId as any;
      const task = submission.taskId as any;

      if (intern && intern.email && task) {
        sendTaskGradedNotification(
            intern.email,
            intern.name || "Intern",
            task.title || "Task",
            status,
            feedback
        ).catch(err => console.error("Failed to send task graded email:", err));
      }

      return NextResponse.json(submission);
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }
}

export const submissionController = new SubmissionController();