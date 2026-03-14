import { NextRequest, NextResponse } from 'next/server';
import { submissionController } from '@/server/controllers/submission.controller';

export async function POST(req: NextRequest) {
  return await submissionController.createSubmission(req);
}

export async function GET(req: NextRequest) {
  return await submissionController.getMySubmissions(req);
}