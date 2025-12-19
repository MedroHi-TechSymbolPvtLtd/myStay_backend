import dotenv from 'dotenv';

dotenv.config();

export const config = {
    port: process.env.PORT || 3003,
    jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
    env: process.env.NODE_ENV || 'development',
};
