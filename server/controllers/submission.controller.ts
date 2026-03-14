import { NextResponse } from 'next/server';
import { submissionService } from '../services/submission.service';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/core/auth/authOptions';
import { UserRole } from '@/models/user.model';

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
}

export const submissionController = new SubmissionController();