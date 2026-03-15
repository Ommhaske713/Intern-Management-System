import { NextResponse } from 'next/server';
import Company from '@/models/company.model';
import dbConnect from '@/core/db/dbConnect';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/core/auth/authOptions';
import { UserRole } from '@/models/user.model';

export class CompanyController {
  
  async updateCompany(req: Request) {
    try {
      await dbConnect();
      const session = await getServerSession(authOptions);
      if (!session || session.user.role !== UserRole.ADMIN) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
      }
      
      const body = await req.json();
      const { 
          id, 
          programDirectorName, 
          programDirectorSignatureUrl,
          companyLogoUrl 
      } = body;

      if (!id) return NextResponse.json({ error: 'Company ID required' }, { status: 400 });

      const company = await Company.findByIdAndUpdate(id, {
        programDirectorName,
        programDirectorSignatureUrl,
        companyLogoUrl
      }, { new: true });
      
      return NextResponse.json(company);

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  async getCompany(req: Request) {
      try {
        await dbConnect();
        let company = await Company.findOne();
        
        if (!company) {
            company = await Company.create({
                name: "My Organization",
                industryDomain: "Technology",
                isActive: true
            });
        }
        
        return NextResponse.json(company);
      } catch (error: any) {
         return NextResponse.json({ error: error.message }, { status: 500 });
      }
  }
}

export const companyController = new CompanyController();