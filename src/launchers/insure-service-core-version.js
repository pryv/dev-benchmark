const child_process = require('child_process');
const path = require('path');
const config = require('../../config.json');

const cwd = path.resolve(__dirname, '../../' + config.serviceCorePath);

async function insure(desiredHash) {
  const shortHash = child_process.execSync('git rev-parse --short HEAD', {cwd: cwd}).toString().trim();
  if (desiredHash === shortHash) return;
  child_process.execSync('git checkout ' + desiredHash, {cwd: cwd, stdio: 'inherit'});
  child_process.execSync('rm -rf node_modules; rm -rf components/**/node_modules; rm -rf dist; yarn setup; yarn release', {cwd: cwd, stdio: 'inherit'});
}

module.exports = insure;

(async () => {
  await insure('2c7b3217');
})()