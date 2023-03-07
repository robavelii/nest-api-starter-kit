import { User } from '../entities/user.entity';
import { Request } from 'express';
export interface UserInformation {
  id?: string;
  email: string;
  role?: string;
  password: string;
}

export interface AuthenticatedRequest extends Request {
  user: User;
}
