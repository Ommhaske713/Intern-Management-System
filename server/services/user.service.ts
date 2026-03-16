import User, { IUser, UserRole } from '@/models/user.model';
import bcrypt from 'bcryptjs';

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

  async updateUser(id: string, updates: Partial<IUser>): Promise<IUser | null> {
    return await User.findByIdAndUpdate(id, updates, { new: true }).select('-password');
  }

  async updatePassword(id: string, newPassword: string): Promise<boolean> {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    const result = await User.findByIdAndUpdate(id, { password: hashedPassword });
    return !!result;
  }

  async verifyPassword(id: string, password: string): Promise<boolean> {
    const user = await User.findById(id).select('+password');
    if (!user || !user.password) return false;
    return await bcrypt.compare(password, user.password);
  }
}



export const userService = new UserService();