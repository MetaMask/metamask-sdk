const fs = require('fs');
const path = require('path');

const files = [
  'dist/browser/es/metamask-sdk.js',
  'dist/browser/umd/metamask-sdk.js',
  'dist/react-native/es/metamask-sdk.js',
  'dist/node/cjs/metamask-sdk.js',
  'dist/node/es/metamask-sdk.js'
];

files.forEach(file => {
  const filepath = path.join(__dirname, file);
  if (fs.existsSync(filepath)) {
    const stats = fs.statSync(filepath);
    console.log(`${file}: ${(stats.size / 1024).toFixed(2)} KB`);
  } else {
    console.log(`${file}: File does not exist`);
  }
});
