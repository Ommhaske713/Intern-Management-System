import mongoose, { Schema, Document, Model } from 'mongoose';

export enum UserRole {
  ADMIN = 'admin',
  MENTOR = 'mentor',
  INTERN = 'intern',
}

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string; // Optional if using OAuth, but requirement says "created by HR" implies credentials
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  // Relationships
  assignedMentor?: mongoose.Types.ObjectId; // For interns
}

const UserSchema: Schema<IUser> = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      trim: true,
      maxlength: [50, 'Name cannot be more than 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email',
      ],
    },
    password: {
      type: String,
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // Don't return password by default
    },
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.INTERN,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    assignedMentor: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      // required: function (this: IUser) { // Logic specific: Interns might be created before assignment
      //   return this.role === UserRole.INTERN;
      // },
    },
  },
  {
    timestamps: true,
  }
);

// Prevent overwrite if compiled multiple times
const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;