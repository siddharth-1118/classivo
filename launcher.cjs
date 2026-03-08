const { execSync, spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Add node.exe directory to PATH
const nodeDir = path.dirname(process.execPath);
process.env.PATH = nodeDir + path.delimiter + (process.env.PATH || '');

const node = process.execPath;
const npmCli = 'C:\\Users\\saisi\\AppData\\Local\\Temp\\npm-bootstrap\\package\\bin\\npm-cli.js';
const prismaCmd = path.join('c:', 'student helper', 'server', 'node_modules', '.bin', 'prisma.cmd');

/*
console.log('--- Phase 1: Database Migration ---');
try {
  execSync('"' + prismaCmd + '" migrate dev --name init --skip-generate', {
    cwd: 'c:\\student helper\\server',
    stdio: 'inherit',
    shell: 'cmd.exe'
  });
  console.log('Migration successful!\n');
} catch (e) {
  console.error('Migration failed (database might not be reachable). Continuing anyway...\n');
}

console.log('--- Phase 2: Database Seeding ---');
try {
  execSync('"' + node + '" src/utils/seed.js', {
    cwd: 'c:\\student helper\\server',
    stdio: 'inherit'
  });
  console.log('Seeding successful!\n');
} catch (e) {
  console.error('Seeding failed. Continuing Anyway...\n');
}
*/

console.log('--- Phase 3: Starting Servers ---');

// Start Backend
console.log('Starting Backend (Express)...');
const backend = spawn('"' + node + '"', ['server.js'], {
  cwd: 'c:\\student helper\\server',
  stdio: 'inherit',
  shell: true
});

// Start Frontend
console.log('Starting Frontend (Next.js)...');
const frontend = spawn('"' + node + '"', ['"' + npmCli + '"', 'run', 'dev'], {
  cwd: 'c:\\student helper\\client',
  stdio: 'inherit',
  shell: true,
  env: { ...process.env, npm_execpath: npmCli }
});

backend.on('error', (err) => console.error('Backend Error:', err.message));
frontend.on('error', (err) => console.error('Frontend Error:', err.message));

process.on('SIGINT', () => {
  backend.kill();
  frontend.kill();
  process.exit();
});
