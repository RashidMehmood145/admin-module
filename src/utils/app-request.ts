import { Request } from 'express';
import { User } from '../users/entities/users.model';

export interface AppRequest extends Request {
  user?: User; 
  [key: string]: any; // Allow additional custom properties
}
