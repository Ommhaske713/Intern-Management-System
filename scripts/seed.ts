import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

import mongoose from 'mongoose';
import Company from '../models/company.model';
import User, { UserRole } from '../models/user.model';
import dbConnect from '../core/db/dbConnect';
import bcrypt from 'bcryptjs';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('Please define the MONGODB_URI environment variable');
  process.exit(1);
}

const seed = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const company = await Company.create({
      name: 'TechCorp Solutions',
      industryDomain: 'Software Development',
      internshipApproach: 'Agile & Mentorship Driven',
    });
    console.log('Company Created:', company.name, `(ID: ${company._id})`);

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);

    const admin = await User.create({
      companyId: company._id,
      name: 'System Admin',
      email: 'admin@techcorp.com',
      password: hashedPassword,
      role: UserRole.ADMIN,
      isActive: true,
      hasCompletedOnboarding: true,
    });
    console.log('Admin Created:', admin.email, `(Password: admin123)`);

    console.log('\nSeeding Complete! You can now use these credentials to login or use the Company ID.');
    process.exit(0);

  } catch (error) {
    console.error('Seeding Error:', error);
    process.exit(1);
  }
};

seed();