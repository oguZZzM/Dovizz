import { PrismaClient } from '@prisma/client';

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
// Learn more: https://pris.ly/d/help/next-js-best-practices

// Check if DATABASE_URL is set
if (!process.env.DATABASE_URL) {
  console.warn('DATABASE_URL is not set. Using default SQLite database at ./dev.db');
  process.env.DATABASE_URL = 'file:./dev.db';
}

const globalForPrisma = global as unknown as { prisma: PrismaClient };

// Use a try-catch block to handle potential initialization errors
let prismaClient: PrismaClient;

try {
  prismaClient = globalForPrisma.prisma || new PrismaClient({
    log: ['query', 'error', 'warn'],
  });
} catch (error) {
  console.error('Failed to initialize PrismaClient:', error);
  // Provide a fallback or throw a more informative error
  throw new Error('Database connection failed. Please check your DATABASE_URL environment variable.');
}

export const prisma = prismaClient;

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
