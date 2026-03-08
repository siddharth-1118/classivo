const { spawn } = require('child_process');
const path = require('path');

console.log("Starting server in clean environment...");

// Clean environment
const cleanEnv = { ...process.env };
delete cleanEnv.NODE_OPTIONS;
delete cleanEnv.DOTENV_CONFIG_PATH;

const serverPath = path.join(__dirname, 'server.js');

const child = spawn('node', [serverPath], {
  env: cleanEnv,
  stdio: 'inherit',
  shell: true
});

child.on('error', (err) => {
  console.error('Failed to start server:', err);
});

child.on('exit', (code) => {
  console.log('Server process exited with code:', code);
});
