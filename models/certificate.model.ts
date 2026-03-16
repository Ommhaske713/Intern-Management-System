import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICertificate extends Document {
  internId: mongoose.Types.ObjectId;
  batchId: mongoose.Types.ObjectId;
  evaluationId?: mongoose.Types.ObjectId;
  taskId?: mongoose.Types.ObjectId; 
  issuedAt: Date;
  verificationCode: string;
}

const CertificateSchema: Schema<ICertificate> = new Schema(
  {
    internId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    batchId: {
      type: Schema.Types.ObjectId,
      ref: 'Batch',
      required: true,
    },
    evaluationId: {
      type: Schema.Types.ObjectId,
      ref: 'Evaluation',
      required: false, 
    },
    taskId: {
        type: Schema.Types.ObjectId,
        ref: 'Task',
        required: false
    },
    issuedAt: {
      type: Date,
      default: Date.now,
    },
    verificationCode: {
      type: String,
      unique: true,
      required: true,
    },
  },
  { timestamps: true }
);

if (mongoose.models.Certificate) {
  delete mongoose.models.Certificate;
}

export default (mongoose.models.Certificate as Model<ICertificate>) ||
  mongoose.model<ICertificate>('Certificate', CertificateSchema);