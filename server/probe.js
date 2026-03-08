console.log('--- Environment Probe ---');
console.log('CWD:', process.cwd());
console.log('Main:', require.main?.filename);
console.log('Args:', process.argv);
console.log('--- Attempting simple require ---');
try {
  const path = require('path');
  console.log('Require path: success');
} catch (e) {
  console.log('Require path: failed', e.message);
}
console.log('--- Done ---');
