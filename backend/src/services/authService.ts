import { prisma } from '../config/prisma.js';
import { comparePassword, hashPassword } from '../utils/password.js';
import { signToken } from '../utils/jwt.js';

export async function signup(name: string, email: string, password: string) {
  const normalizedEmail = email.trim().toLowerCase();

  const existingUser = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (existingUser) {
    throw new Error('An account with this email already exists');
  }

  const passwordHash = await hashPassword(password);

  const user = await prisma.user.create({
    data: {
      name: name.trim(),
      email: normalizedEmail,
      password: passwordHash,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
    },
  });

  const token = signToken({
    userId: user.id,
    role: user.role,
  });

  return { user, token };
}

export async function signin(email: string, password: string) {
  const normalizedEmail = email.trim().toLowerCase();

  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (!user) {
    throw new Error('Invalid email or password');
  }

  const passwordMatches = await comparePassword(password, user.password);

  if (!passwordMatches) {
    throw new Error('Invalid email or password');
  }

  const token = signToken({
    userId: user.id,
    role: user.role,
  });

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    token,
  };
}

export async function getCurrentUser(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });
}
