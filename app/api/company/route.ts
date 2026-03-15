import { NextRequest } from 'next/server';
import { companyController } from '@/server/controllers/company.controller';

export async function GET(req: NextRequest) {
  return await companyController.getCompany(req);
}

export async function PATCH(req: NextRequest) {
  return await companyController.updateCompany(req);
}