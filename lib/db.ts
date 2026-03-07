import { PrismaClient } from '@prisma/client'

// Lazy singleton — PrismaClient is only instantiated when the first API request
// arrives, not at module-load / build time. This prevents the build from failing
// when DATABASE_URL is not yet configured (e.g. Phase 1 / no-auth deploy).
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export function getPrisma(): PrismaClient {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    })
  }
  return globalForPrisma.prisma
}
