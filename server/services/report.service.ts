import { sendReportNotificationEmail } from '@/lib/email';
import Batch from '@/models/batch.model';
import User from '@/models/user.model';
import WeeklyReport, { IWeeklyReport } from '@/models/weeklyReport.model';
import mongoose from 'mongoose';

export class ReportService {
  async createReport(data: Partial<IWeeklyReport>): Promise<IWeeklyReport> {
    const report = new WeeklyReport(data);
    const savedReport = await report.save();

    try {
        const batch = await Batch.findById(data.batchId).populate('mentorIds', 'email name');
        const intern = await User.findById(data.internId).select('name');
        
        if (batch && batch.mentorIds && intern) {
            const mentors = batch.mentorIds as any[];
            await Promise.allSettled(mentors.map(mentor => {
                if (mentor.email) {
                    return sendReportNotificationEmail(
                        mentor.email,
                        intern.name,
                        data.weekNumber || 0,
                        `${process.env.NEXTAUTH_URL}/dashboard/mentor/reports/${savedReport._id}`
                    );
                }
            }));
        }
    } catch (error) {
        console.error("Failed to send report notification emails:", error);
    }

    return savedReport;
  }

  async getReportsForIntern(internId: string): Promise<IWeeklyReport[]> {
    return await WeeklyReport.find({ internId })
      .sort({ weekNumber: -1 })
      .populate('internId', 'name email')
      .populate('tasksWorkingOn', 'title status'); 
  }

  async getReportsForBatch(batchId: string): Promise<IWeeklyReport[]> {
    return await WeeklyReport.find({ batchId })
      .sort({ weekNumber: -1, submittedAt: -1 })
      .populate('internId', 'name email')
      .populate('tasksWorkingOn', 'title status');
  }

  async getReportsForBatches(batchIds: string[]): Promise<IWeeklyReport[]> {
    return await WeeklyReport.find({ batchId: { $in: batchIds } })
      .sort({ weekNumber: -1, submittedAt: -1 })
      .populate('internId', 'name email')
      .populate('tasksWorkingOn', 'title status');
  }

  async getReportsForInternInBatches(internId: string, allowedBatchIds: string[]): Promise<IWeeklyReport[]> {
    return await WeeklyReport.find({ 
        internId,
        batchId: { $in: allowedBatchIds }
    })
      .sort({ weekNumber: -1 })
      .populate('tasksWorkingOn', 'title status');
  }

  async getReportById(id: string): Promise<IWeeklyReport | null> {
    return await WeeklyReport.findById(id)
      .populate('internId', 'name email')
      .populate('tasksWorkingOn', 'title status');
  }

  async updateReport(id: string, data: Partial<IWeeklyReport>): Promise<IWeeklyReport | null> {
    return await WeeklyReport.findByIdAndUpdate(id, data, { new: true })
      .populate('internId', 'name email')
      .populate('tasksWorkingOn', 'title status');
  }
}

export const reportService = new ReportService();