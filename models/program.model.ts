import mongoose, { Schema, Document, Model } from 'mongoose';

export enum InternshipType {
  TECHNICAL = 'TECHNICAL',
  DESIGN = 'DESIGN',
  RESEARCH = 'RESEARCH',
}

export enum EvaluationCriteriaApplicability {
  ALL = 'ALL',
  TECHNICAL = 'TECHNICAL',
  DESIGN = 'DESIGN',
  RESEARCH = 'RESEARCH',
}

export enum ProofOfWorkType {
  GITHUB_REPOSITORY = 'GITHUB_REPOSITORY',
  FIGMA_LINK = 'FIGMA_LINK',
  PDF_DOCUMENT = 'PDF_DOCUMENT',
  DEPLOYED_URL = 'DEPLOYED_URL',
  GOOGLE_DOC = 'GOOGLE_DOC',
  OTHER = 'OTHER',
}

export interface IEvaluationCriteria {
  key: string;
  label: string;
  weight: number;
  applicableTo: EvaluationCriteriaApplicability[];
}

export interface IProgramDefinition extends Document {
  companyId: mongoose.Types.ObjectId;
  title: string;
  internshipType: InternshipType;
  durationPolicy: {
    minimumWeeks: number;
    maximumWeeks: number;
  };
  evaluationCriteria: IEvaluationCriteria[];
  allowedProofOfWorkTypes: ProofOfWorkType[];
  weeklyReportingEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ProgramDefinitionSchema: Schema<IProgramDefinition> = new Schema(
  {
    companyId: {
      type: Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    internshipType: {
      type: String,
      enum: Object.values(InternshipType),
      required: true,
    },
    durationPolicy: {
      minimumWeeks: { type: Number, default: 4 },
      maximumWeeks: { type: Number, default: 24 },
    },
    evaluationCriteria: [
      {
        key: String,
        label: String,
        weight: Number,
        applicableTo: [String],
      },
    ],
    allowedProofOfWorkTypes: [
      {
        type: String,
        enum: Object.values(ProofOfWorkType),
      },
    ],
    weeklyReportingEnabled: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const ProgramDefinition: Model<IProgramDefinition> =
  mongoose.models.ProgramDefinition ||
  mongoose.model<IProgramDefinition>('ProgramDefinition', ProgramDefinitionSchema);

export default ProgramDefinition;
