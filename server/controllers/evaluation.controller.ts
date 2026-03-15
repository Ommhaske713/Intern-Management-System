import { NextResponse } from 'next/server';
import { evaluationService } from '@/server/services/evaluation.service';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/core/auth/authOptions';
import User, { UserRole } from '@/models/user.model';
import { sendEvaluationNotificationEmail } from '@/lib/email';
import Batch from '@/models/batch.model';

export class EvaluationController {
  
  async getSummaries(req: Request) {
    try {
      const session = await getServerSession(authOptions);
      if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

      const url = new URL(req.url);
      const internId = url.searchParams.get('internId');
      const findBatchForIntern = async (internId: string, mentorId?: string) => {
          const query: any = { internIds: internId };
          if (mentorId) query.mentorIds = mentorId;
          return await Batch.findOne(query);
      };

      if (internId) {
          if (session.user.role === UserRole.INTERN && session.user.id !== internId) {
              return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
          }
          
          const mentorId = session.user.role === UserRole.ADMIN || session.user.role === UserRole.INTERN ? undefined : session.user.id;
          const batch = await findBatchForIntern(internId, mentorId);
          
          if (!batch) {
             return NextResponse.json({ error: 'Intern/Batch not found or access denied' }, { status: 404 });
          }

          const evaluation = await evaluationService.getEvaluation(internId, batch._id.toString());
          if (!evaluation) {
              return NextResponse.json(null);
          }
          return NextResponse.json(evaluation);
      }

      if (session.user.role === UserRole.INTERN) {
         const batch = await findBatchForIntern(session.user.id);
         if (!batch) return NextResponse.json({ error: "No active batch found" }, { status: 404 });
         
         const evaluation = await evaluationService.getEvaluation(session.user.id, batch._id.toString());
         return NextResponse.json(evaluation ? [evaluation] : []);
      }

      const mentorId = session.user.role === UserRole.ADMIN ? undefined : session.user.id;
      const summaries = await evaluationService.getInternSummaries(mentorId);
      return NextResponse.json(summaries);
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  async createEvaluation(req: Request) {
    try {
      const session = await getServerSession(authOptions);
      if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

      const body = await req.json();
      
      let batchId = body.batchId;
      if (!batchId || batchId === "TODO_RESOLVE_ON_SERVER") {
         const query: any = { internIds: body.internId };
         if (session.user.role !== UserRole.ADMIN) {
            query.mentorIds = session.user.id;
         }
         
         const batch = await Batch.findOne(query);
         
         if (!batch) {
            return NextResponse.json({ error: 'Intern does not belong to any batch you are authorized to evaluate.' }, { status: 400 });
         }
         batchId = batch._id;
      }

      const evaluation = await evaluationService.createEvaluation({
        ...body,
        batchId,
        mentorId: session.user.id,
        evaluatedAt: new Date(),
        evaluationCompleted: true,
      });
      
      const intern = await User.findById(body.internId);
      if (intern && intern.email) {
          const evaluationLink = `${process.env.NEXTAUTH_URL}/dashboard/evaluations/${evaluation._id}`;
          const dashboardLink = `${process.env.NEXTAUTH_URL}/dashboard/intern`;
          
          sendEvaluationNotificationEmail(
            intern.email,
            intern.name,
            dashboardLink
          ).catch(err => console.error("Failed to send evaluation email:", err));
      }

      return NextResponse.json(evaluation, { status: 201 });
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }
}

export const evaluationController = new EvaluationController();