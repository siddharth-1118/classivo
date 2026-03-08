try {
  console.log('Testing route imports by bypassing dotenv...');
  require('./src/routes/authRoutes');
  console.log('AuthRoutes: OK');
  require('./src/routes/studentRoutes');
  console.log('StudentRoutes: OK');
  require('./src/routes/resourceRoutes');
  console.log('ResourceRoutes: OK');
  require('./src/routes/dashboardRoutes');
  console.log('DashboardRoutes: OK');
  require('./src/routes/aiRoutes');
  console.log('AiRoutes: OK');
  console.log('All route imports successful!');
} catch (e) {
  console.error('Import failed:', e);
  process.exit(1);
}
