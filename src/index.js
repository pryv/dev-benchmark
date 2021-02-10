const globals = require('./globals');
const accounts = require('./accounts');
const accesses = require('./accesses');
const streams = require('./streams');

const autocannon = require('autocannon');
const Pryv = require('pryv');

const fs = require('fs');

// async/await
async function foo () {
  await globals.init();
  const account = await accounts.create();
  pryv.account = account;
  const access = await accesses.create();
  pryv.access = access;
  const apiEndpoint = await pryv.service.apiEndpointFor(pryv.account.username, pryv.access.token);
  const stream = await streams.create(apiEndpoint);
  console.log(stream);
  console.log(pryv);

  const results = { data: pryv.meta , runs: []};

  const body = JSON.stringify({type: 'note/txt', streamId: stream.id, content: 'Hello World'});
  results.runs.push(await autocannon({
    title: 'events.create',
    url: apiEndpoint + 'events',
    body: body,
    connections: 10, //default
    pipelining: 1, // default
    duration: 10, // default
    workers: 1
  }));
  results.runs.push(await autocannon({
    title: 'events.get',
    url: apiEndpoint + 'events?limit=100',
    connections: 10, //default
    pipelining: 1, // default
    duration: 10, // default
    workers: 1
  }));
  const d = new Date();
  const filename = d.toISOString().replace(/:/g,'-').replace(/\./g,'-') + '.json';
  fs.writeFileSync('results/' + filename, JSON.stringify(results, null, 2));
  console.log(results);
}

foo();