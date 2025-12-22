import { Prisma, PrismaClient } from '@prisma/client';
import { prisma } from '../lib/prisma';

export interface CreateUserData {
  uniqueId: string;
  userType: 'customer' | 'admin';
  firstName: string;
  lastName?: string;
  phone: string;
  email?: string;
  sex?: string;
  pinHash?: string;
  aadhaarStatus?: string;
}

export class UserService {
  async createUser(data: CreateUserData): Promise<Prisma.UserGetPayload<{}>> {
    const profileExtras: Record<string, any> = {};

    if (data.pinHash) {
      profileExtras.pinHash = data.pinHash;
    }

    const user = await prisma.user.create({
      data: {
        uniqueId: data.uniqueId,
        userType: data.userType,
        firstName: data.firstName,
        lastName: data.lastName,
        sex: data.sex,
        phone: data.phone,
        email: data.email,
        aadhaarStatus: data.aadhaarStatus || 'unverified',
        profileExtras: profileExtras,
      },
    });

    return user;
  }

  async findUserByPhone(phone: string) {
    return prisma.user.findUnique({
      where: { phone },
    });
  }

  async findUserByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
    });
  }

  async findUserByUniqueId(uniqueId: string) {
    return prisma.user.findUnique({
      where: { uniqueId },
    });
  }
}

export const userService = new UserService();

