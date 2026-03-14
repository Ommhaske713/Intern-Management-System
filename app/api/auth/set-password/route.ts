import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import dbConnect from '@/core/db/dbConnect';
import User from '@/models/user.model';

export async function POST(req: Request) {
  try {
    const { token, password } = await req.json();

    if (!token || !password) {
      return NextResponse.json(
        { error: 'Missing token or password' },
        { status: 400 }
      );
    }

    await dbConnect();

    const user = await User.findOne({
      inviteToken: token,
      inviteTokenExpiry: { $gt: new Date() },
    }).select('+inviteToken +inviteTokenExpiry'); 

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid or expired invitation token' },
        { status: 400 }
      );
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user.password = hashedPassword;
    user.inviteToken = undefined;
    user.inviteTokenExpiry = undefined;
    user.isActive = true;
    user.hasCompletedOnboarding = true;

    await user.save();

    return NextResponse.json({ message: 'Password set successfully' }, { status: 200 });

  } catch (error: any) {
    console.error('Set password error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
