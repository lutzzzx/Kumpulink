import { PrismaClient } from '@prisma/client'
import bcryptjs from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Clean database
  await prisma.link.deleteMany()
  await prisma.domain.deleteMany()
  await prisma.user.deleteMany()

  // Hash password
  const passwordHash = await bcryptjs.hash('password123', 12)

  // Create test user
  const user = await prisma.user.create({
    data: {
      name: 'Test User',
      email: 'test@example.com',
      passwordHash,
    },
  })

  // Create domain
  const domain = await prisma.domain.create({
    data: {
      userId: user.id,
      name: 'github.com',
      displayName: 'GitHub',
      faviconUrl: 'https://www.google.com/s2/favicons?domain=github.com&sz=64',
    },
  })

  // Create links
  await prisma.link.create({
    data: {
      userId: user.id,
      domainId: domain.id,
      url: 'https://github.com/trending',
      title: 'GitHub Trending',
      description: 'See what the GitHub community is most excited about today.',
      faviconUrl: 'https://www.google.com/s2/favicons?domain=github.com&sz=64',
      isDead: false,
    },
  })

  await prisma.link.create({
    data: {
      userId: user.id,
      domainId: domain.id,
      url: 'https://github.com/features/actions',
      title: 'GitHub Actions',
      description: 'Automate, customize, and execute your software development workflows.',
      faviconUrl: 'https://www.google.com/s2/favicons?domain=github.com&sz=64',
      isDead: false,
    },
  })

  console.log('Database seeded successfully.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
