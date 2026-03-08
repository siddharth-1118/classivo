const { execSync } = require('child_process');
const path = require('path');

// Add node.exe directory to PATH
const nodeDir = path.dirname(process.execPath);
process.env.PATH = nodeDir + path.delimiter + (process.env.PATH || '');

const node = process.execPath;
const prismaPath = path.join('c:', 'student helper', 'server', 'node_modules', '.bin', 'prisma.cmd');

console.log('Running prisma generate...');
try {
  // Using the cmd version of prisma on Windows
  execSync('"' + prismaPath + '" generate', {
    cwd: 'c:\\student helper\\server',
    stdio: 'inherit',
    shell: 'cmd.exe',
    env: { ...process.env }
  });
  console.log('Prisma generate successful!');
} catch (e) {
  console.error('Prisma generate failed:', e.message);
}
