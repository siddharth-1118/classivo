const https = require('https');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const os = require('os');

// Add this node.exe directory to PATH so child processes (e.g. Prisma preinstall) can find 'node'
const nodeDir = path.dirname(process.execPath);
process.env.PATH = nodeDir + path.delimiter + (process.env.PATH || '');

const node = process.execPath;
const npmTarUrl = 'https://registry.npmjs.org/npm/-/npm-10.9.2.tgz';
const tmpDir = os.tmpdir();
const tarPath = path.join(tmpDir, 'npm.tgz');
const npmDir = path.join(tmpDir, 'npm-bootstrap');

console.log('Node.js:', node, process.version);
console.log('Downloading npm...');

const file = fs.createWriteStream(tarPath);
https.get(npmTarUrl, (res) => {
  res.pipe(file);
  file.on('finish', () => {
    file.close();
    console.log('Downloaded npm tarball to', tarPath);
    fs.mkdirSync(npmDir, { recursive: true });
    try {
      execSync('tar -xzf "' + tarPath + '" -C "' + npmDir + '"', { stdio: 'inherit', shell: 'cmd.exe' });
      const npmCli = path.join(npmDir, 'package', 'bin', 'npm-cli.js');
      console.log('npm-cli.js found:', fs.existsSync(npmCli));
      console.log('NPM_CLI=' + npmCli);
      
      // Now install server
      console.log('\n=== Installing server dependencies ===');
      execSync('"' + node + '" "' + npmCli + '" install', {
        cwd: 'c:\\student helper\\server',
        stdio: 'inherit',
        env: { ...process.env, npm_execpath: npmCli }
      });
      console.log('\n=== Server deps done ===');
      
      // Install client
      console.log('\n=== Installing client dependencies ===');
      execSync('"' + node + '" "' + npmCli + '" install', {
        cwd: 'c:\\student helper\\client',
        stdio: 'inherit',
        env: { ...process.env, npm_execpath: npmCli }
      });
      console.log('\n=== Client deps done ===');
    } catch(e) { console.error('Error:', e.message); }
  });
}).on('error', (e) => console.error('Download error:', e.message));
