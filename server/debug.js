console.log("Server file logic started");
const fs = require('fs');
console.log("Current directory:", process.cwd());
console.log("server.js exists:", fs.existsSync('server.js'));
console.log("Environment variables loaded:", Object.keys(process.env).length);
