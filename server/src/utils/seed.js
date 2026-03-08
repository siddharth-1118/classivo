const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create admin user
  const existingAdmin = await prisma.user.findUnique({ where: { email: 'admin@classivo.com' } });
  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash('Admin@123', 12);
    await prisma.user.create({
      data: {
        name: 'Admin',
        email: 'admin@classivo.com',
        passwordHash,
        role: 'ADMIN',
        phone: '9999999999',
      },
    });
    console.log('✅ Admin user created: admin@classivo.com / Admin@123');
  } else {
    console.log('ℹ️  Admin user already exists');
  }

  console.log('✅ Seed complete');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
