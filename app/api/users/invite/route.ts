import { NextResponse } from 'next/server';
import crypto from 'crypto';
import dbConnect from '@/core/db/dbConnect';
import User, { UserRole } from '@/models/user.model';
import Company from '@/models/company.model';
import { sendInviteEmail } from '@/lib/email';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/core/auth/authOptions';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || (session.user as any).role !== UserRole.ADMIN) {
      return NextResponse.json({ error: 'Unauthorized: Only Admins can invite users' }, { status: 401 });
    }

    const { name, email, role } = await req.json();
    const adminCompanyId = (session.user as any).companyId;

    if (!name || !email || !role) {
      return NextResponse.json(
        { error: 'Missing required fields: name, email, role' }, 
        { status: 400 }
      );
    }

    if (!adminCompanyId) {
        return NextResponse.json({ error: 'Admin has no company associated' }, { status: 400 });
    }

    await dbConnect();

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    const token = crypto.randomBytes(32).toString('hex');
    const tokenExpiry = new Date();
    tokenExpiry.setHours(tokenExpiry.getHours() + 48);

    const newUser = await User.create({
      companyId: adminCompanyId,
      name,
      email,
      role,
      inviteToken: token,
      inviteTokenExpiry: tokenExpiry,
      hasCompletedOnboarding: false,
      isActive: true,
    });

    const emailSent = await sendInviteEmail(email, token, name);
    
    if (!emailSent) {
      console.warn(`Failed to send email to ${email}`);
    }

    return NextResponse.json({
      message: 'User invited successfully',
      userId: newUser._id,
      emailSent: emailSent
    }, { status: 201 });

  } catch (error: any) {
    console.error('User creation error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}