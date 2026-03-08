const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://postgres.butsaksbshvdpcehyksl:u62bafZrONmkVsCn@aws-1-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true&sslmode=require"
    }
  }
});

async function main() {
  console.log('Testing connection...');
  try {
    await prisma.$connect();
    console.log('✅ Connection successful');
    const userCount = await prisma.user.count();
    console.log('User count:', userCount);
  } catch (e) {
    console.error('❌ Connection failed:', e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
