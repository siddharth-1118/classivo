import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function seed() {
  // Create department
  const department = await prisma.department.create({ data: { name: 'Computer Science' } });
  // Create class
  const cls = await prisma.class.create({ data: { name: 'CS1A', departmentId: department.id } });
  // Create subject
  const sub = await prisma.subject.create({ data: { name: 'Data Structures', departmentId: department.id, classId: cls.id } });

  // Seed admin user (admin registration is normally restricted)
  const adminPwdHash = await bcrypt.hash('admin123', 12);
  await prisma.user.create({
    data: {
      name: 'Admin User',
      email: 'admin@classivo.edu',
      passwordHash: adminPwdHash,
      role: Role.ADMIN,
    }
  });

  console.log('Seeded department, class, subject, and admin user.');
}
seed().finally(() => prisma.$disconnect());