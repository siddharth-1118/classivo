console.log('--- Test Prisma ---');
const { PrismaClient } = require('@prisma/client');
console.log('PrismaClient loaded');
const prisma = new PrismaClient();
console.log('Instance created');
console.log('--- Done ---');
