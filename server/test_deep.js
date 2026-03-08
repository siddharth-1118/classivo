try {
  console.log('Deep testing AuthRoutes import...');
  const authRoutes = require('./src/routes/authRoutes');
  console.log('AuthRoutes imported successfully');
} catch (e) {
  console.error('Import Error Trace:');
  console.error(e.stack || e);
  process.exit(1);
}
