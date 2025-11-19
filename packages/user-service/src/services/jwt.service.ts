import jwt from 'jsonwebtoken';

export interface JWTPayload {
  userId: string;
  uniqueId: string;
  userType: string;
}

export class JWTService {
  private readonly secret: string;

  constructor() {
    this.secret = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
  }

  verify(token: string): JWTPayload {
    try {
      return jwt.verify(token, this.secret) as JWTPayload;
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }
}

export const jwtService = new JWTService();

