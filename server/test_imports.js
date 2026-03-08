try {
  console.log('Testing imports...');
  require('express');
  console.log('Express: OK');
  require('cors');
  console.log('CORS: OK');
  require('dotenv').config();
  console.log('Dotenv: OK');
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
  console.log('All imports successful!');
} catch (e) {
  console.error('Import failed:', e);
  process.exit(1);
}
