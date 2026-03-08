console.log('--- Test 1: Express ---');
require('express');
console.log('Success');

console.log('--- Test 2: DB ---');
require('./src/services/db');
console.log('Success');

console.log('--- Test 3: authRoutes ---');
require('./src/routes/authRoutes');
console.log('Success');

console.log('--- Test 4: studentRoutes ---');
require('./src/routes/studentRoutes');
console.log('Success');

console.log('--- Test 5: resourceRoutes ---');
require('./src/routes/resourceRoutes');
console.log('Success');

console.log('--- Test 6: dashboardRoutes ---');
require('./src/routes/dashboardRoutes');
console.log('Success');

console.log('--- Test 7: aiRoutes ---');
require('./src/routes/aiRoutes');
console.log('Success');
