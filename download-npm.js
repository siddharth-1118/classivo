const https = require('https');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const os = require('os');

const npmTarUrl = 'https://registry.npmjs.org/npm/-/npm-10.9.2.tgz';
const tmpDir = os.tmpdir();
const tarPath = path.join(tmpDir, 'npm.tgz');
const npmDir = path.join(tmpDir, 'npm-extracted');

console.log('Downloading npm to', tarPath);
const file = fs.createWriteStream(tarPath);
https.get(npmTarUrl, (res) => {
  res.pipe(file);
  file.on('finish', () => {
    file.close();
    console.log('Downloaded');
    fs.mkdirSync(npmDir, { recursive: true });
    try {
      execSync('tar -xzf ' + tarPath + ' -C ' + npmDir, { stdio: 'inherit' });
      const npmCli = path.join(npmDir, 'package', 'bin', 'npm-cli.js');
      console.log('npm-cli.js exists:', fs.existsSync(npmCli));
      console.log('npm-cli path:', npmCli);
    } catch(e) { console.error('Extract error:', e.message); }
  });
}).on('error', (e) => console.error('Error:', e.message));
