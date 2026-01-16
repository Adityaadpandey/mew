import { PrismaClient } from '../generated/prisma'
import { PrismaPg } from '@prisma/adapter-pg'

const connectionString = `${process.env.DATABASE_URL}`

// Create adapter with connection pooling configuration
const adapter = new PrismaPg({ connectionString })

// Create Prisma client with optimized settings
const prismaClientSingleton = () => {
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development'
      ? ['warn', 'error']
      : ['error'],
  })
}

// Declare global type for the Prisma client singleton
declare const globalThis: {
  prismaGlobal: ReturnType<typeof prismaClientSingleton>
} & typeof global

// Use singleton pattern to prevent multiple instances in development
const db = globalThis.prismaGlobal ?? prismaClientSingleton()

if (process.env.NODE_ENV !== 'production') {
  globalThis.prismaGlobal = db
}

export { db }
