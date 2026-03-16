import { NextRequest } from 'next/server';
import { certificateController } from '@/server/controllers/certificate.controller';

export async function GET(req: NextRequest) {
  return await certificateController.getCertificate(req);
}

export async function POST(req: NextRequest) {
  const result = await certificateController.issueCertificate(req);
  return result;
}