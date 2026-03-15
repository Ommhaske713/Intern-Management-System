import { NextRequest } from 'next/server';
import { certificateController } from '@/server/controllers/certificate.controller';

export async function POST(req: NextRequest) {
  const result = await certificateController.issueCertificate(req);
  return result;
}