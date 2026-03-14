import { NextResponse } from 'next/server';
import dbConnect from '@/core/db/dbConnect';
import User, { UserRole } from '@/models/user.model';
import Company from '@/models/company.model';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  try {
    await dbConnect();
    const body = await req.json();
    const { companyName, industryDomain, name, email, password } = body;

    if (!companyName || !name || !email || !password) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const publicDomains = [
      'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 
      'aol.com', 'icloud.com', 'protonmail.com', 'zoho.com', 
      'yandex.com', 'mail.com', 'gmx.com'
    ];
    
    const emailDomain = email.split('@')[1]?.toLowerCase();
    
    if (publicDomains.includes(emailDomain)) {
       return NextResponse.json({ 
         error: 'Please use a valid work email address. Public email domains (e.g., gmail.com) are not allowed for company registration.' 
       }, { status: 400 });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ error: 'User with this email already exists' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const company = await Company.create({
      name: companyName,
      industryDomain: industryDomain || 'Technology',
      isActive: true,
    });

    const user = await User.create({
      companyId: company._id,
      name,
      email,
      password: hashedPassword,
      role: UserRole.ADMIN,
      isActive: true,
      hasCompletedOnboarding: true,
    });

    return NextResponse.json(
      { message: 'Registration successful', companyId: company._id, userId: user._id },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: error.message || 'Registration failed' }, { status: 500 });
  }
}