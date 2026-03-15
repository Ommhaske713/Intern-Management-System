import WeeklyReport, { IWeeklyReport } from '@/models/weeklyReport.model';
import mongoose from 'mongoose';

export class ReportService {
  async createReport(data: Partial<IWeeklyReport>): Promise<IWeeklyReport> {
    const report = new WeeklyReport(data);
    return await report.save();
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

  async getReportsForInternInBatches(internId: string, batchIds: string[]): Promise<IWeeklyReport[]> {
    return await WeeklyReport.find({ internId, batchId: { $in: batchIds } })
      .sort({ weekNumber: -1, submittedAt: -1 })
      .populate('internId', 'name email')
      .populate('tasksWorkingOn', 'title status');
  }
}

export const reportService = new ReportService();