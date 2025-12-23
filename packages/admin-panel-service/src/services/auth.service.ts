import prisma from '../prisma';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { ROLES, DEFAULT_PERMISSIONS } from '../utils/permissions';

export class AuthService {
    async login(identifier: string, secret: string) {
        // identifier can be phone or email
        const admin = await prisma.admin.findFirst({
            where: {
                OR: [
                    { email: identifier },
                    { phone: identifier }
                ]
            }
        });

        if (!admin) {
            throw new Error('Invalid credentials');
        }

        if (!admin.is_active) {
            throw new Error('Account inactive');
        }

        // Verify secret (password or OTP if implemented, simple password for now as per schema)
        const isMatch = await bcrypt.compare(secret, admin.password);
        if (!isMatch) {
            throw new Error('Invalid credentials');
        }

        // Generate Token
        const token = jwt.sign(
            { id: admin.admin_id.toString(), role: admin.role },
            config.jwtSecret,
            { expiresIn: '1d' }
        );

        return {
            token,
            admin: {
                id: admin.admin_id.toString(),
                name: admin.name,
                email: admin.email,
                role: admin.role
            }
        };
    }

    async getProfile(adminId: string) {
        const admin = await prisma.admin.findUnique({
            where: { admin_id: BigInt(adminId) },
            include: { permissions: true }
        });

        if (!admin) throw new Error('Admin not found');

        // Convert BigInts
        const { password, ...rest } = admin;
        return {
            ...rest,
            admin_id: rest.admin_id.toString(),
            permissions: {
                ...rest.permissions,
                id: rest.permissions?.id.toString(),
                admin_id: rest.permissions?.admin_id.toString()
            }
        };
    }
}
