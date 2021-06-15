const path = require('path');
const Launcher = require('../src/launchers/Launcher');
const autocannon = require('autocannon');


const startingPort = 3300;

const servers = [];
async function launchServers(n) {
  for (let i = 1; i < (n + 1); i++) {
    const s = new Launcher(__dirname, 'node', ['./server.js', startingPort + i], 'Ready', 'server' + i);
    await s.ready();
    servers.push(s);
  }
}

process.on('SIGINT', function() {
  console.log('Closing ALL');
  ( async () => {
    for (const server of servers) {
      await server.kill();
    }
    process.exit();
  });
});

async function fire(n) {
  const NUMBER_OF_USERS = 50;
  const urls = [];
  for (let i = 0; i < NUMBER_OF_USERS; i++) {
    const port = startingPort + i % 3 + 1;
    urls.push('http://toto' + i+ '.rec.la:' + port);
  }
  console.log(urls);
  const instance = autocannon({
    url: urls,
    connections: 200, //default
    pipelining: 1, // default
    duration: 10, // default
    workers: 10
  })
}

let x = null;
(async () => {
  await launchServers(3);
  fire();
  console.log('passed');
})();