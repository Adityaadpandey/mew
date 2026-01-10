import { PrismaClient } from '../generated/prisma'

import "dotenv/config";
import { PrismaPg } from '@prisma/adapter-pg'

const connectionString = `${process.env.DATABASE_URL}`

const adapter = new PrismaPg({ connectionString })
const db = new PrismaClient({ adapter })

export { db }