import "dotenv/config";
import { faker } from "@faker-js/faker";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";
import { hashPassword } from "../src/utils/password";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is required");
}

const adapter = new PrismaPg({
  connectionString
});

const prisma = new PrismaClient({
  adapter
});

const categoryNames = [
  "Food",
  "Transport",
  "Housing",
  "Utilities",
  "Healthcare",
  "Education",
  "Shopping",
  "Entertainment",
  "Travel",
  "Personal Care",
  "Subscriptions",
  "Other"
];

async function main() {
  await prisma.expense.deleteMany();
  await prisma.budget.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  const categories = [];

  for (const name of categoryNames) {
    categories.push(
      await prisma.category.create({
        data: {
          name,
          description: `${name} related expenses`
        }
      })
    );
  }

  const adminPassword = await hashPassword("Admin@12345");

  const admin = await prisma.user.create({
    data: {
      name: "Retain Administrator",
      email: "admin@retain.local",
      password: adminPassword,
      role: "ADMIN"
    }
  });

  const users = [];

  for (let i = 0; i < 15; i += 1) {
    const password = await hashPassword("User@12345");

    users.push(
      await prisma.user.create({
        data: {
          name: faker.person.fullName(),
          email: faker.internet.email().toLowerCase(),
          password,
          role: "USER"
        }
      })
    );
  }

  const paymentMethods = [
    "CASH",
    "MOBILE_MONEY",
    "DEBIT_CARD",
    "CREDIT_CARD",
    "BANK_TRANSFER",
    "OTHER"
  ] as const;

  for (const user of users) {
    await prisma.budget.create({
      data: {
        userId: user.id,
        amount: faker.finance.amount({
          min: 300,
          max: 2500,
          dec: 2
        }),
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear()
      }
    });

    for (let i = 0; i < 20; i += 1) {
      const category =
        categories[
          faker.number.int({
            min: 0,
            max: categories.length - 1
          })
        ];

      if (!category) {
        continue;
      }

      await prisma.expense.create({
        data: {
          userId: user.id,
          categoryId: category.id,
          title: faker.commerce.productName(),
          description: faker.lorem.sentence(),
          amount: faker.finance.amount({
            min: 5,
            max: 500,
            dec: 2
          }),
          paymentMethod:
            paymentMethods[
              faker.number.int({
                min: 0,
                max: paymentMethods.length - 1
              })
            ],
          expenseDate: faker.date.recent({
            days: 90
          }),
          notes: faker.lorem.sentence()
        }
      });
    }
  }

  console.log("Seed completed");
  console.log("Admin:");
  console.log("Email: admin@retain.local");
  console.log("Password: Admin@12345");
  console.log(`Created ${users.length} demo users`);
  console.log("Demo user password: User@12345");
  console.log(`Created ${categories.length} categories`);
  console.log(`Created demo data for ${admin.email}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });