import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

type UserType = 'customer' | 'admin';

function generateUniqueId(userType: UserType): string {
  const prefix = userType === 'admin' ? 'ADM' : 'CUST';
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}

async function main() {
  const adminPinHash = await bcrypt.hash('1234', 10);
  const customerPinHash = await bcrypt.hash('1234', 10);

  const admin = await prisma.user.upsert({
    where: { phone: '9999999999' },
    update: {},
    create: {
      uniqueId: generateUniqueId('admin'),
      userType: 'admin',
      firstName: 'Admin',
      lastName: 'User',
      phone: '9999999999',
      email: 'admin@example.com',
      profileExtras: {
        pinHash: adminPinHash,
      },
    },
  });

  const customer = await prisma.user.upsert({
    where: { phone: '8888888888' },
    update: {},
    create: {
      uniqueId: generateUniqueId('customer'),
      userType: 'customer',
      firstName: 'Customer',
      lastName: 'Example',
      phone: '8888888888',
      email: 'customer@example.com',
      profileExtras: {
        pinHash: customerPinHash,
      },
    },
  });

  console.log('Seeded admin:', admin.uniqueId);
  console.log('Seeded customer:', customer.uniqueId);
}

main()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


