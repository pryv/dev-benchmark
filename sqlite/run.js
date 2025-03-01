/**
 * @license
 * Copyright (C) Pryv https://pryv.com
 * This file is part of Pryv.io and released under BSD-Clause-3 License
 * Refer to LICENSE file
 */
const Launcher = require('../src/launchers/Launcher');

const workers = [];
async function launchServers(n) {
  for (let i = 1; i < (n + 1); i++) {
    const s = new Launcher(__dirname, 'node', ['./workerAsync.js', i], 'Ready', 'worker' + i); 
    await s.ready();
    workers.push(s);
  }
}

process.on('SIGINT', function () {
  console.log('Closing ALL');
  (async () => {
    for (const worker of workers) {
      await server.kill();
    }
    process.exit();
  });
});


(async () => {
  await launchServers(3);
  console.log('passed');
})();