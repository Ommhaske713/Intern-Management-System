import { NextResponse } from 'next/server';
import { certificateService } from '@/server/services/certificate.service';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/core/auth/authOptions';
import User, { UserRole } from '@/models/user.model';
import dbConnect from '@/core/db/dbConnect';
import Certificate from '@/models/certificate.model';

export class CertificateController {
  
  async issueCertificate(req: Request) {
    try {
      await dbConnect();
      const session = await getServerSession(authOptions);
      if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const body = await req.json();
      const { internId, batchId, evaluationId } = body;

      if (!internId || !batchId || !evaluationId) {
        return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
      }

      if (session.user.role === UserRole.INTERN && session.user.id !== internId) {
          return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }

      const certificate = await certificateService.issueCertificate(internId, batchId, evaluationId);
      return NextResponse.json(certificate, { status: 201 });
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  async downloadCertificate(req: Request, { params }: { params: { id: string } }) {
    try {
      await dbConnect();
      const session = await getServerSession(authOptions);
      if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const certificateId = params.id;
      const certificate = await Certificate.findById(certificateId);
      
      if (!certificate) {
          return NextResponse.json({ error: 'Certificate not found' }, { status: 404 });
      }

      if (session.user.role === UserRole.INTERN && certificate.internId.toString() !== session.user.id) {
          return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }

      const pdfBuffer = await certificateService.generateCertificatePDF(certificateId);
      
      return new NextResponse(pdfBuffer, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="certificate-${certificate.verificationCode}.pdf"`,
        },
      });

    } catch (error: any) {
      console.error("Certificate Generation Error:", error);
      return NextResponse.json({ error: 'Generation Failed' }, { status: 500 });
    }
  }
}

export const certificateController = new CertificateController();