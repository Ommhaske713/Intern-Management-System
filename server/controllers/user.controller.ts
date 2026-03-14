import { NextResponse } from 'next/server';
import { userService } from '../services/user.service';
import User, { UserRole } from '@/models/user.model';
import dbConnect from '@/core/db/dbConnect';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/core/auth/authOptions';

export class UserController {
  
  async getUsers(req: Request) {
    try {
      await dbConnect();
      const session = await getServerSession(authOptions);
      if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      if (session.user.role !== UserRole.ADMIN && session.user.role !== UserRole.MENTOR) {
        
      }

      const { searchParams } = new URL(req.url);
      const role = searchParams.get('role') as UserRole | undefined;

      const users = await userService.getAllUsers(role);
      return NextResponse.json(users);
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }
}

export const userController = new UserController();