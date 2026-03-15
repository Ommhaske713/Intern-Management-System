import { reportController } from '@/server/controllers/report.controller';
import { NextRequest } from "next/server";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return reportController.getReport(req, { params: { id } });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return reportController.updateReport(req, { params: { id } });
}