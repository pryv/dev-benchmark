const Launcher = require('../src/launchers/Launcher');

const workers = [];
async function launchServers(n) {
  for (let i = 1; i < (n + 1); i++) {
    const s = new Launcher(__dirname, 'node', ['./worker.js', i], 'Ready', 'worker' + i); 
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