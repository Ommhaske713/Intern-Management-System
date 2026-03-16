// server/services/certificate.service.ts
import PDFDocument from 'pdfkit';
import { Stream } from 'stream';
import crypto from 'crypto';
import Certificate, { ICertificate } from '@/models/certificate.model';
import User from '@/models/user.model';
import Batch from '@/models/batch.model';
import Evaluation from '@/models/evaluation.model';
import Company from '@/models/company.model';
import { sendCertificateEmail } from '@/lib/email';
import Task, { TaskPriority } from '@/models/task.model';

export class CertificateService {
  async issueCertificateForTask(taskId: string, internId?: string): Promise<ICertificate | null> {
    const task = await Task.findById(taskId);
    if (!task || task.priority !== TaskPriority.FINAL) {
      return null;
    }

    const targetInternId = internId || task.assignedTo?.toString();
    const batchId = task.batchId?.toString();

    if (!targetInternId || !batchId) return null;

    const existing = await Certificate.findOne({ internId: targetInternId, batchId });
    if (existing) return existing;
    
    const verificationCode = crypto.randomBytes(8).toString('hex').toUpperCase();
    
    const certificate = new Certificate({
      internId: targetInternId,
      batchId,
      taskId,
      verificationCode, 
    });
    
    const savedCert = await certificate.save();
    
    try {
        const intern = await User.findById(internId);
        if (intern && intern.email) {
            const pdfBuffer = await this.generateCertificatePDF(savedCert._id);
            await sendCertificateEmail(intern.email, intern.name, pdfBuffer);
        }
    } catch (error) {
       console.error("Certificate email failed", error);
    }
    return savedCert;
  }

  async issueCertificate(internId: string, batchId: string, evaluationId: string): Promise<ICertificate> {
    const existing = await Certificate.findOne({ internId, batchId });
    if (existing) return existing;

    const evaluation = await Evaluation.findById(evaluationId);
    if (!evaluation || !evaluation.evaluationCompleted) {
      throw new Error("Cannot issue certificate: Evaluation incomplete or missing.");
    }

    if (evaluation.internId.toString() !== internId) {
        throw new Error("Evaluation does not belong to this intern.");
    }

    const verificationCode = crypto.randomBytes(8).toString('hex').toUpperCase();
    const certificate = new Certificate({
      internId,
      batchId,
      evaluationId,
      verificationCode, 
    });
    
    const savedCert = await certificate.save();

    try {
        const intern = await User.findById(internId);
        if (intern && intern.email) {
            const pdfBuffer = await this.generateCertificatePDF(savedCert._id);
            await sendCertificateEmail(intern.email, intern.name, pdfBuffer);
        }
    } catch (error) {
       console.error("Certificate email failed", error);
    }
    
    return savedCert;
  }

  async generateCertificatePDF(certificateId: string): Promise<Buffer> {
    const certificate = await Certificate.findById(certificateId)
      .populate('internId', 'name')
      .populate({
          path: 'batchId',
          select: 'name startDate endDate durationInWeeks companyId',
      });
    
    if (!certificate) {
      throw new Error("Certificate not found");
    }

    const batch = certificate.batchId as any;

    let company: any = null;

    if (batch.companyId) {
        company = await Company.findById(batch.companyId);
    }

    if (!company || !company.programDirectorSignatureUrl) {
         const richCompany = await Company.findOne({ programDirectorSignatureUrl: { $exists: true, $ne: "" } });
         if (richCompany) {
             company = richCompany;
         } else if (!company) {

             company = await Company.findOne();
         }
    }

    const doc = new PDFDocument({
      layout: 'landscape',
      size: 'A4',
      margin: 40,
      autoFirstPage: true
    });

    const fetchImage = async (url: string) => {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000); 
            const response = await fetch(url, { signal: controller.signal });
            clearTimeout(timeoutId);
            if (!response.ok) throw new Error("Failed to fetch image");
            const arrayBuffer = await response.arrayBuffer();
            return Buffer.from(arrayBuffer);
        } catch (error: any) {
            console.error(`Certificate Image Load Error (${url}):`, error.message);
            return null;
        }
    };

    let logoBuffer = null;
    let signatureBuffer = null;

    if (company?.companyLogoUrl) {
        logoBuffer = await fetchImage(company.companyLogoUrl);
    }
    
    if (company?.programDirectorSignatureUrl) {
        signatureBuffer = await fetchImage(company.programDirectorSignatureUrl);
    }

    const buffers: Buffer[] = [];
    doc.on('data', buffers.push.bind(buffers));
    
    return new Promise((resolve, reject) => {
        doc.on('end', () => resolve(Buffer.concat(buffers)));
        doc.on('error', reject);

        const { width, height } = doc.page;
        const centerX = width / 2;

        doc.rect(0, 0, width, height).fill('#ffffff');

        const borderPadding = 20;
        doc.lineWidth(3)
           .strokeColor('#1a365d')
           .rect(borderPadding, borderPadding, width - (borderPadding * 2), height - (borderPadding * 2))
           .stroke();
           
        doc.lineWidth(1)
           .strokeColor('#c5a059')
           .rect(borderPadding + 5, borderPadding + 5, width - (borderPadding * 2 + 10), height - (borderPadding * 2 + 10))
           .stroke();

        let currentY = 60;

        if (logoBuffer) {
             const logoWidth = 80;
             doc.image(logoBuffer, centerX - (logoWidth / 2), currentY, { width: logoWidth }); 
             currentY += 90;
        } else {
             currentY += 40;
        }

        doc.font('Times-Roman').fontSize(36).fillColor('#1a365d')
           .text('CERTIFICATE', 0, currentY, { align: 'center' });
        
        currentY += 40;
        doc.font('Helvetica').fontSize(16).fillColor('#c5a059')
           .text('OF COMPLETION', 0, currentY, { align: 'center', characterSpacing: 2 });

        currentY += 50;
        doc.font('Helvetica').fontSize(12).fillColor('#4a5568')
           .text('is proudly presented to', 0, currentY, { align: 'center' });

        currentY += 30;
        const internName = (certificate.internId as any).name || "Intern Name";
        doc.font('Times-BoldItalic').fontSize(32).fillColor('#2d3748')
           .text(internName, 0, currentY, { align: 'center' });

        currentY += 40;
        const nameWidth = Math.min(doc.widthOfString(internName) + 40, 400);
        doc.moveTo(centerX - (nameWidth / 2), currentY - 5)
           .lineTo(centerX + (nameWidth / 2), currentY - 5)
           .strokeColor('#c5a059').lineWidth(1).stroke();

        currentY += 20;
        const duration = batch.durationInWeeks ? `${batch.durationInWeeks} weeks` : 'the program duration';
        const batchName = batch.name || "Internship Program";
        const companyName = company?.name || "the company";
        
        doc.font('Helvetica').fontSize(13).fillColor('#4a5568')
           .text(
               `For successfully completing the ${duration} internship program as a`, 
               0, currentY, { align: 'center' }
            );
        
        currentY += 20;
        doc.font('Helvetica-Bold').fontSize(16).fillColor('#1a365d')
           .text(batchName, 0, currentY, { align: 'center' });

        currentY += 25;
        doc.font('Helvetica').fontSize(13).fillColor('#4a5568')
            .text(`at ${companyName}`, 0, currentY, { align: 'center' });

        const sigSectionY = height - 130;
        const sigLineY = sigSectionY + 40;
        const sigLabelY = sigLineY + 10;

        if (signatureBuffer) {

           doc.image(signatureBuffer, 140, sigSectionY - 20, { width: 100, height: 50, fit: [100, 50], align: 'center' }); 
        } else {
           
        }

        doc.moveTo(100, sigLineY).lineTo(280, sigLineY).strokeColor('#2d3748').lineWidth(1).stroke();
        
        const directorName = company?.programDirectorName || 'Program Director';
        
        doc.fontSize(12).font('Helvetica-Bold').fillColor('#2d3748')
           .text(directorName, 100, sigLabelY, { width: 180, align: 'center' });
        
        doc.fontSize(10).font('Helvetica').fillColor('#718096')
           .text("Program Director", 100, sigLabelY + 15, { width: 180, align: 'center' });
        
        const dateString = new Date(certificate.issuedAt).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });
        
        doc.moveTo(width - 280, sigLineY).lineTo(width - 100, sigLineY).strokeColor('#2d3748').lineWidth(1).stroke();
        
        doc.fontSize(12).font('Helvetica-Bold').fillColor('#2d3748')
           .text(dateString, width - 280, sigLabelY, { width: 180, align: 'center' });
           
        doc.fontSize(10).font('Helvetica').fillColor('#718096')
           .text("Date of Issue", width - 280, sigLabelY + 15, { width: 180, align: 'center' });

        const footerY = height - 40;
        doc.fontSize(9).font('Courier').fillColor('#a0aec0')
           .text(`Certificate ID: ${certificate._id} | Verification Code: ${certificate.verificationCode}`, 
                 0, footerY, { align: 'center' });
        
        doc.end();
    });
  }
}

export const certificateService = new CertificateService();