import prisma from '../prisma';
import bcrypt from 'bcrypt';
import { ROLES, DEFAULT_PERMISSIONS } from '../utils/permissions';
import { AdminPermissions } from '../generated/client';

export class AdminService {
    async createAdmin(data: any) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(data.password, salt);

        // Start transaction to create admin and permissions
        return await prisma.$transaction(async (tx) => {
            const admin = await tx.admin.create({
                data: {
                    name: data.name,
                    email: data.email,
                    phone: data.phone,
                    role: data.role || ROLES.ADMIN,
                    password: hashedPassword,
                }
            });

            // Assign default permissions based on role
            const defaultPerms = DEFAULT_PERMISSIONS[data.role] || DEFAULT_PERMISSIONS[ROLES.ADMIN];

            const permissions = await tx.adminPermissions.create({
                data: {
                    admin_id: admin.admin_id,
                    ...defaultPerms
                }
            });

            return {
                admin: { ...admin, admin_id: admin.admin_id.toString() },
                permissions: { ...permissions, id: permissions.id.toString(), admin_id: permissions.admin_id.toString() }
            };
        });
    }

    async listAdmins() {
        const admins = await prisma.admin.findMany({
            select: {
                admin_id: true,
                name: true,
                email: true,
                phone: true,
                role: true,
                is_active: true,
                created_at: true
            }
        });
        return admins.map(a => ({ ...a, admin_id: a.admin_id.toString() }));
    }

    async updateStatus(id: string, isActive: boolean) {
        const admin = await prisma.admin.update({
            where: { admin_id: BigInt(id) },
            data: { is_active: isActive }
        });
        return { ...admin, admin_id: admin.admin_id.toString() };
    }

    async updatePermissions(id: string, permissions: Partial<AdminPermissions>) {
        // Remove restricted fields
        const { id: _, admin_id, created_at, updated_at, ...updateData } = permissions as any;

        const updated = await prisma.adminPermissions.update({
            where: { admin_id: BigInt(id) },
            data: updateData
        });
        return { ...updated, id: updated.id.toString(), admin_id: updated.admin_id.toString() };
    }
}
