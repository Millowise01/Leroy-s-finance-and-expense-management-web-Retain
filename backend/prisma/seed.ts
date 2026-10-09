import 'dotenv/config';
import { faker } from '@faker-js/faker';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client.js';
import { hashPassword } from '../src/utils/password.js';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL is required');
}

if (process.env.NODE_ENV !== 'development' || process.env.SEED_DEMO_DATA !== 'true') {
  throw new Error(
    'Demo seeding is disabled. Set NODE_ENV=development and SEED_DEMO_DATA=true explicitly.',
  );
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

const categoryNames = [
  'Food',
  'Transport',
  'Housing',
  'Utilities',
  'Healthcare',
  'Education',
  'Shopping',
  'Entertainment',
  'Travel',
  'Personal Care',
  'Subscriptions',
  'Other',
] as const;

const paymentMethods = [
  'CASH',
  'MOBILE_MONEY',
  'DEBIT_CARD',
  'CREDIT_CARD',
  'BANK_TRANSFER',
  'OTHER',
] as const;

async function main() {
  faker.seed(20261009);

  const categories = [];

  for (const name of categoryNames) {
    const category = await prisma.category.upsert({
      where: { name },
      update: { description: `${name} related expenses` },
      create: {
        name,
        description: `${name} related expenses`,
      },
    });

    categories.push(category);
  }

  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? 'admin@retain.local';
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? 'Admin@12345';
  const userPassword = process.env.SEED_USER_PASSWORD ?? 'User@12345';

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      name: 'Retain Administrator',
      role: 'ADMIN',
      password: await hashPassword(adminPassword),
    },
    create: {
      name: 'Retain Administrator',
      email: adminEmail,
      password: await hashPassword(adminPassword),
      role: 'ADMIN',
    },
  });

  const users = [];

  for (let userIndex = 1; userIndex <= 15; userIndex += 1) {
    const email = `demo.user${String(userIndex).padStart(2, '0')}@retain.local`;
    const user = await prisma.user.upsert({
      where: { email },
      update: {
        name: `Retain Demo User ${userIndex}`,
        role: 'USER',
        password: await hashPassword(userPassword),
      },
      create: {
        name: `Retain Demo User ${userIndex}`,
        email,
        password: await hashPassword(userPassword),
        role: 'USER',
      },
    });

    users.push(user);
  }

  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  for (const [userIndex, user] of users.entries()) {
    await prisma.budget.upsert({
      where: {
        userId_month_year: {
          userId: user.id,
          month,
          year,
        },
      },
      update: {
        amount: faker.finance.amount({ min: 300, max: 2500, dec: 2 }),
      },
      create: {
        userId: user.id,
        amount: faker.finance.amount({ min: 300, max: 2500, dec: 2 }),
        month,
        year,
      },
    });

    for (let expenseIndex = 1; expenseIndex <= 20; expenseIndex += 1) {
      const category = categories[(userIndex * expenseIndex) % categories.length];
      const paymentMethod = paymentMethods[(userIndex + expenseIndex) % paymentMethods.length];

      if (!category || !paymentMethod) {
        continue;
      }

      await prisma.expense.upsert({
        where: { id: `retain-demo-expense-${user.id}-${expenseIndex}` },
        update: {
          categoryId: category.id,
          title: faker.commerce.productName(),
          description: faker.lorem.sentence(),
          amount: faker.finance.amount({ min: 5, max: 500, dec: 2 }),
          paymentMethod,
          expenseDate: faker.date.recent({ days: 90 }),
          notes: faker.lorem.sentence(),
        },
        create: {
          id: `retain-demo-expense-${user.id}-${expenseIndex}`,
          userId: user.id,
          categoryId: category.id,
          title: faker.commerce.productName(),
          description: faker.lorem.sentence(),
          amount: faker.finance.amount({ min: 5, max: 500, dec: 2 }),
          paymentMethod,
          expenseDate: faker.date.recent({ days: 90 }),
          notes: faker.lorem.sentence(),
        },
      });
    }
  }

  console.log(`Seeded demo data for ${admin.email} without deleting existing records.`);
  console.log(`Created or updated ${users.length} demo users and ${categories.length} categories.`);
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
