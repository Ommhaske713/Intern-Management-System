import User, { IUser, UserRole } from '@/models/user.model';

export class UserService {
  
  async getAllUsers(role?: UserRole): Promise<IUser[]> {
    const query = role ? { role } : {};
    return await User.find(query).select('-password');
  }

  async getUserById(id: string): Promise<IUser | null> {
    return await User.findById(id).select('-password');
  }

  async getUserByEmail(email: string): Promise<IUser | null> {
    return await User.findOne({ email });
  }
}

export const userService = new UserService();