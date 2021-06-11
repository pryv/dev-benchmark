const path = require('path');

const Launcher = require('./Launcher');

PATH_HW = './';

async function go() {
  const cwd = path.resolve(__dirname, PATH_HW);
  const s = new Launcher(cwd, 'node', ['./hello-mongo-server.js'], 'Ready');
  await s.ready();
  console.log('Hello Mongo Started');
  return s;
}

module.exports = {
  go: go
}