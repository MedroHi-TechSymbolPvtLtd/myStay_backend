import jwt from 'jsonwebtoken';

export interface JWTPayload {
  userId: string;
  uniqueId: string;
  userType: string;
}

export class JWTService {
  private readonly secret: string;
  private readonly expiresIn: string;

  constructor() {
    this.secret = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
    this.expiresIn = process.env.JWT_EXPIRES_IN || '7d';
  }

  sign(payload: JWTPayload): string {
    return jwt.sign(payload, this.secret, {
      expiresIn: this.expiresIn as any,
    });
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

