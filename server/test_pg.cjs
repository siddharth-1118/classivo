const { Client } = require('pg');
const connectionString = "postgresql://postgres.butsaksbshvdpcehyksl:u62bafZrONmkVsCn@aws-1-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require";

async function main() {
  const client = new Client({
    connectionString: connectionString,
  });
  console.log('Testing connection with pg...');
  try {
    await client.connect();
    console.log('✅ Connection successful with pg');
    const res = await client.query('SELECT NOW()');
    console.log('Result:', res.rows[0]);
  } catch (e) {
    console.error('❌ Connection failed with pg:', e);
  } finally {
    await client.end();
  }
}

main();
