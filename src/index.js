const globals = require('./globals');
const accounts = require('./accounts');
const accesses = require('./accesses');
const streams = require('./streams');

const autocannon = require('autocannon');
const Pryv = require('pryv');

const fs = require('fs');

const d = new Date();
const baseFileName = d.toISOString().replace(/:/g, '-').replace(/\./g, '-');

// async/await
async function go(defaults) {
  await globals.init();
  const account = await accounts.create();
  pryv.account = account;
  const access = await accesses.create();
  pryv.access = access;
  const apiEndpoint = await pryv.service.apiEndpointFor(pryv.account.username, pryv.access.token);
  const stream = await streams.create(apiEndpoint);
  console.log(stream);
  console.log(pryv);



  const results = { data: pryv.meta, runs: [] };
  const abstract = { defaults: defaults, runs: [] };


  async function runs(settings) {
    const params = Object.assign({}, defaults);
    Object.assign(params, settings);
    const res = await autocannon(params)
    results.runs.push(res);
    abstract.runs.push({
      title: settings.title,
      rate: Math.round(res.requests.sent / res.duration)
    })

    // let existing call end
    await new Promise(r => setTimeout(r, 1000));
  }

  await runs({
    title: 'helloWorld',
    url: 'http://localhost:8080/'
  });

  await runs({
    title: 'events.create',
    url: apiEndpoint + 'events',
    body: JSON.stringify({ type: 'note/txt', streamId: stream.id, content: 'Hello World' })
  });

  await runs({
    title: 'events.get',
    url: apiEndpoint + 'events?limit=100',
  });

  

  
  //fs.writeFileSync('results/' + baseFileName + '.json', JSON.stringify(results, null, 2));
  //fs.writeFileSync('results/' + baseFileName + '-abstract.json', JSON.stringify(abstract, null, 2));
  console.log(abstract);
  return abstract;
}

(async function () {
  let csvRes = 'connections,pipelining,duration,workers,HelloWorld,EventsCreate,EventsGet';
  for (let connections = 1; connections < 11; connections += 3) {
    for (let pipelining = 1; pipelining < 11; pipelining += 3) {
      for (let workers = 1; workers < 11; workers += 3) {
        const res = await go({
          connections: connections, //default
          pipelining: pipelining, // default
          duration: 10, // default
          workers: workers
        });
        csvRes += '\n' + Object.values(res.defaults).join(',') + ',';
        csvRes += res.runs.map(x => x.rate).join(',')
        console.log(workers, connections);
      }
    }
  }
  fs.writeFileSync('results/' + baseFileName + '-exploration.csv', csvRes);
})();



