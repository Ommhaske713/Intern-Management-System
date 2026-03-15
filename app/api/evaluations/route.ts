import { NextRequest } from 'next/server';
import { evaluationController } from '@/server/controllers/evaluation.controller';

export async function GET(req: NextRequest) {
  return await evaluationController.getSummaries(req);
}

export async function POST(req: NextRequest) {
  return await evaluationController.createEvaluation(req);
}