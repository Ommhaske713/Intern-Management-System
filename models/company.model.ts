import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICompany extends Document {
  name: string;
  industryDomain: string;
  internshipApproach: string;
  isActive: boolean;
  programDirectorName?: string;
  programDirectorSignatureUrl?: string;
  companyLogoUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const CompanySchema: Schema<ICompany> = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a company name'],
      trim: true,
    },
    industryDomain: {
      type: String,
      required: [true, 'Please provide an industry domain'],
    },
    internshipApproach: {
      type: String,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    programDirectorName: {
        type: String,
    },
    programDirectorSignatureUrl: {
        type: String,
    },
    companyLogoUrl: {
        type: String,
    },
  },
  {
    timestamps: true,
  }
);

const Company: Model<ICompany> = mongoose.models.Company || mongoose.model<ICompany>('Company', CompanySchema);

export default Company;