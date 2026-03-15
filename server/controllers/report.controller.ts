import { NextResponse } from 'next/server';
import { reportService } from '../services/report.service';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/core/auth/authOptions';
import User, { UserRole } from '@/models/user.model';
import dbConnect from '@/core/db/dbConnect';
import Batch from '@/models/batch.model';
import { sendReportNotificationEmail } from '@/lib/email';

export class ReportController {
  
  async createReport(req: Request) {
    try {
      await dbConnect();
      const session = await getServerSession(authOptions);
      if (!session || !session.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const userId = session.user.id;
      const body = await req.json();

      const batch = await Batch.findOne({ internIds: userId }).populate('mentorIds', 'email name');
      if (!batch) {
        return NextResponse.json({ error: 'Intern not assigned to any batch' }, { status: 400 }); 
      }

      const report = await reportService.createReport({
        ...body,
        internId: userId,
        batchId: batch._id,
      });

      const mentors = batch.mentorIds as any[];
      const reportLink = `${process.env.NEXTAUTH_URL}/dashboard/mentor/reports/${report._id}`;

      Promise.all(mentors.map(mentor => {
        if (mentor.email) {
          return sendReportNotificationEmail(
            mentor.email, 
            session.user.name || "Intern", 
            body.weekNumber, 
            reportLink
          );
        }
      })).catch(err => console.error("Failed to send notification emails:", err));

      return NextResponse.json(report, { status: 201 });
    } catch (error: any) {
      console.error('Error creating report:', error);
      if (error.code === 11000) {
        return NextResponse.json({ error: "Report for this week already submitted." }, { status: 400 });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  async getReports(req: Request) {
    try {
      await dbConnect();
      const session = await getServerSession(authOptions);
      if (!session || !session.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const userId = session.user.id;
      const userRole = session.user.role;

      if (userRole === UserRole.INTERN) {
        const reports = await reportService.getReportsForIntern(userId);
        return NextResponse.json(reports);
      } else if (userRole === UserRole.MENTOR || userRole === UserRole.ADMIN) {

        const url = new URL(req.url);
        const requestBatchId = url.searchParams.get('batchId');

        let batches;
        if (userRole === UserRole.ADMIN) {
            batches = await Batch.find({}); 
        } else {
            batches = await Batch.find({ mentorIds: userId });
        }

        const accessibleBatchIds = batches.map(b => b._id.toString());
        const requestInternId = url.searchParams.get('internId');

        if (requestInternId) {

            const internBatches = await Batch.find({ internIds: requestInternId });
            const internBatchIds = internBatches.map(b => b._id.toString());
            
            const hasAccess = internBatchIds.some(id => accessibleBatchIds.includes(id));

            if (!hasAccess && userRole !== UserRole.ADMIN) {
                 return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
            }

            const reports = await reportService.getReportsForInternInBatches(requestInternId, accessibleBatchIds);
            return NextResponse.json(reports);
        }

        if (requestBatchId) {

            if (!accessibleBatchIds.includes(requestBatchId) && userRole !== UserRole.ADMIN) {
                 return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
            }
            
            const reports = await reportService.getReportsForBatch(requestBatchId);
            return NextResponse.json(reports);
        }

        const reports = await reportService.getReportsForBatches(accessibleBatchIds);
        return NextResponse.json(reports);
      }

      return NextResponse.json({ error: 'Invalid operation' }, { status: 400 });
      
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  async getReport(req: Request, { params }: { params: { id: string } }) {
    try {
      await dbConnect();
      const session = await getServerSession(authOptions);
      if (!session || !session.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const report = await reportService.getReportById(params.id);
      if (!report) {
        return NextResponse.json({ error: 'Report not found' }, { status: 404 });
      }

      if (session.user.role === UserRole.INTERN && report.internId._id.toString() !== session.user.id) {
         return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }

      return NextResponse.json(report);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  async updateReport(req: Request, { params }: { params: { id: string } }) {
    try {
        await dbConnect();
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        if (session.user.role !== UserRole.MENTOR && session.user.role !== UserRole.ADMIN) {
             return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const body = await req.json();
        const { mentorFeedback, status } = body;

        const report = await reportService.updateReport(params.id, { 
            mentorFeedback,
            status: status || 'REVIEWED'
        });
        
        return NextResponse.json(report);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }
}

export const reportController = new ReportController();