import { NextRequest } from 'next/server';
import { certificateController } from '@/server/controllers/certificate.controller';

export async function GET(
    req: NextRequest, 
    { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const result = await certificateController.downloadCertificate(req, { params: { id } });
  return result;
}