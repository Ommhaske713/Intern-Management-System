import { NextRequest, NextResponse } from 'next/server';
import { reportController } from '@/server/controllers/report.controller';

export async function POST(req: NextRequest) {
  return await reportController.createReport(req);
}

export async function GET(req: NextRequest) {
  return await reportController.getReports(req);
}