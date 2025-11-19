import { PrismaClient, Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma';

export class UserService {
  async findUserByUniqueId(uniqueId: string) {
    return prisma.user.findUnique({
      where: { uniqueId },
    });
  }

  async updateUserProfile(
    uniqueId: string,
    data: {
      addressLine1?: string;
      addressLine2?: string;
      city?: string;
      state?: string;
      pincode?: string;
      emergencyName?: string;
      emergencyPhone?: string;
      profession?: string;
    }
  ) {
    return prisma.user.update({
      where: { uniqueId },
      data,
    });
  }
}

export const userService = new UserService();

