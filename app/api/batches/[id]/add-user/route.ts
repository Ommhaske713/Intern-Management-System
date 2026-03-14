import { NextResponse } from 'next/server';
import crypto from 'crypto';
import dbConnect from '@/core/db/dbConnect';
import Batch from '@/models/batch.model';
import User, { UserRole } from '@/models/user.model';
import { sendInviteEmail } from '@/lib/email';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/core/auth/authOptions';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);

    const body = await req.json();
    const { role, email, name, userId } = body;
    const batchId = params.id;

    if (!role || !batchId) {
      return NextResponse.json({ error: 'Role and Batch ID required' }, { status: 400 });
    }

    await dbConnect();

    if (!session || !session.user || (session.user as any).role !== 'ADMIN') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const adminCompanyId = (session.user as any).companyId;

    let targetUserId = userId;

    if (userId) {
        const existingUser = await User.findById(userId);
        if (!existingUser) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }
        if (existingUser.companyId.toString() !== adminCompanyId) {
             return NextResponse.json({ error: 'User does not belong to your company' }, { status: 403 });
        }
        if (existingUser.role !== role) {
             return NextResponse.json({ error: `User role is ${existingUser.role}, expected ${role}` }, { status: 400 });
        }
    } else if (email && name) {
 
        let user = await User.findOne({ email });
        
        if (user) {
             if (user.companyId.toString() !== adminCompanyId) {
                  return NextResponse.json({ error: 'User already exists in another company' }, { status: 400 });
             }
             targetUserId = user._id;
             if (user.role !== role) {
                  return NextResponse.json({ error: `User exists with role ${user.role}` }, { status: 400 });
             }
        } else {
            const token = crypto.randomBytes(32).toString('hex');
            const tokenExpiry = new Date();
            tokenExpiry.setHours(tokenExpiry.getHours() + 48);

            user = await User.create({
                companyId: adminCompanyId, 
                name,
                email,
                role,
                inviteToken: token,
                inviteTokenExpiry: tokenExpiry,
                hasCompletedOnboarding: false,
                isActive: true,
            });
             try {
                const emailSent = await sendInviteEmail(email, token, name);
                if (!emailSent) console.warn('Email failed to send');
             } catch (e) {
                console.error('Email send error', e);
             }
             targetUserId = user._id;
        }
    } else {
        return NextResponse.json({ error: 'User ID or Email/Name required' }, { status: 400 });
    }
    
    const batch = await Batch.findById(batchId);
    if (!batch) return NextResponse.json({ error: 'Batch not found' }, { status: 404 });
    
    if (batch.companyId.toString() !== (session?.user as any).companyId) {
         return NextResponse.json({ error: 'Unauthorized batch access' }, { status: 403 });
    }
    
    const updateField = role === 'MENTOR' ? 'mentorIds' : 'internIds';
    
    await Batch.findByIdAndUpdate(batchId, {
        $addToSet: { [updateField]: targetUserId }
    });

    return NextResponse.json({ message: 'User added to batch successfully', userId: targetUserId });

  } catch (error: any) {
    console.error('Error adding user to batch:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}