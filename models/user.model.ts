import mongoose, { Schema, Document, Model } from 'mongoose';

export enum UserRole {
  ADMIN = 'ADMIN',
  MENTOR = 'MENTOR',
  INTERN = 'INTERN',
  HR = "HR",
}

export interface IUser extends Document {
  companyId: mongoose.Types.ObjectId;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  isActive: boolean;
  inviteToken?: string;
  inviteTokenExpiry?: Date;
  hasCompletedOnboarding: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema<IUser> = new Schema(
  {
    companyId: {
      type: Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
    },
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      select: false,
    },
    role: {
      type: String,
      enum: Object.values(UserRole),
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    inviteToken: {
      type: String,
      select: false,
    },
    inviteTokenExpiry: {
      type: Date,
      select: false,
    },
    hasCompletedOnboarding: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
