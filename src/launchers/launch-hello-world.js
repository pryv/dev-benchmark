const path = require('path');

const Launcher = require('./Launcher');

PATH_HW = './';


async function go() {
  const cwd = path.resolve(__dirname, PATH_HW);
  const s = new Launcher(cwd, 'node', ['./hello-server.js'], 'Ready');
  await s.ready();
  console.log('Hello World Started');
  return s;
}

if (true) {
  (async () => {
    const s = await go();
    await s.kill();
    console.log('Server Killed');
  })();
}


module.exports = {
  go: go
}