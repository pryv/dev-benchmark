/**
 * @license
 * Copyright (C) Pryv https://pryv.com
 * This file is part of Pryv.io and released under BSD-Clause-3 License
 * Refer to LICENSE file
 */
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

process.on('SIGINT', function () {
  console.log('Closing ALL');
  (async () => {
    for (const server of servers) {
      await server.kill();
    }
    process.exit();
  });
});

function fire(n) {
  const NUMBER_OF_USERS = 20;
  const urls = [];

  for (let i = 0; i < NUMBER_OF_USERS; i++) {
    const url = 'http://toto' + i + '.rec.la:' + startingPort;
    urls.push(url);
  }
  const instance = autocannon({
    url: urls,
    connections: 200, //default
    pipelining: 1, // default
    duration: 10, // default
    workers: 5
  });
  autocannon.track(instance, { renderProgressBar: false })
};

async function killLastServer() {
  console.log('Kill one');
  const s = servers.pop();
  await s.kill();
}

let x = null;
(async () => {
  await launchServers(3);

  fire();
  //setTimeout(killLastServer, 5000); // kill one server after 5 s
  console.log('passed');
})();