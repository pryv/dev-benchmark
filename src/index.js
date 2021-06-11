const launchApiServer = require('./launchers/launch-api-server');
const launchHelloWorld = require('./launchers/launch-hello-world');
const globals = require('./lib/globals');
const users = require('./lib/users');
const accesses = require('./lib/accesses');
const streams = require('./lib/streams');
const os = require('os');

const autocannon = require('autocannon');
const Pryv = require('pryv');

const fs = require('fs');

const d = new Date();
const baseFileName = d.toISOString().replace(/:/g, '-').replace(/\./g, '-') + '-' + os.hostname();

// async/await
async function go(config, defaults) {
  const server = await launchApiServer.withConfig(config);
  await globals.init();
  const user = await users.create();
  const access = await accesses.create(user.apiEndpoint);
  // eventually reconstruct apiEnpoint (for older API Versionss)
  const apiEndpoint = access.apiEndpoint || await pryv.service.apiEndpointFor(user.username, access.token);
  const stream = await streams.create(apiEndpoint);
 
  const results = { config: config, data: pryv.meta, runs: [] };
  const abstract = { config: config, defaults: defaults, runs: [] };

  /**
   * Run one of tests 
   * @param {*} settings 
   */
  async function runs(settings) {
    const params = Object.assign({}, defaults);
    Object.assign(params, settings);
    const res = await autocannon(params)
    results.runs.push(res);
    abstract.runs.push({
      title: settings.title,
      rate: Math.round(res.requests.sent / res.duration),
      errors: res.errors
    })

    // let existing call end
    await new Promise(r => setTimeout(r, 1000));
  }

  const hwServer = await launchHelloWorld.go();
  await runs({
    title: 'helloWorld',
    url: 'http://localhost:8080/'
  });
  await hwServer.kill();

  await runs({
    title: 'events.create',
    url: apiEndpoint + 'events',
    body: JSON.stringify({ type: 'note/txt', streamId: stream.id, content: 'Hello World' })
  });

  await runs({
    title: 'events.get',
    url: apiEndpoint + 'events?limit=100',
  });

  await runs({
    title: 'streams.create',
    url: apiEndpoint + 'streams',
    body: JSON.stringify({ name: '[<id>]' })
  });

  console.log(abstract);
  await server.kill();
  return { abstract: abstract, results: results};
}



async function explore () {
  let csvRes = 'connections,pipelining,duration,workers,HelloWorld,EventsCreate,EventsGet, STreamsCreate';
  for (let connections = 1; connections < 11; connections += 3) {
    for (let pipelining = 1; pipelining < 11; pipelining += 3) {
      for (let workers = 1; workers < 11; workers += 3) {
        const fullres = await go({}, {
          connections: connections, //default
          pipelining: pipelining, // default
          duration: 10, // default
          workers: workers
        });
        const res = fullres.abstract;
        csvRes += '\n' + Object.values(res.defaults).join(',') + ',';
        csvRes += res.runs.map(x => x.rate).join(',')
        console.log(workers, connections);
      }
    }
  }
  fs.writeFileSync('results/' + baseFileName + '-exploration.csv', csvRes);
};


async function basic(name, config) {
  const res = await go(config, {
    connections: 10, 
    pipelining: 1, 
    duration: 10, 
    workers: 4
  });
  fs.writeFileSync('results/' + baseFileName + '-' + name + '-full.json',  JSON.stringify(res.results,null,2));
  fs.writeFileSync('results/' + baseFileName + '-' + name + '.json',  JSON.stringify(res.abstract,null,2));
}

(async () => {
  
  
  const configs = {
    //'audit-storage-only': {audit: {storage: {active: false}}}, 
    //'audit-syslog-only': {audit: {syslog: {active: false}}},
    //'audit-none': {audit: {syslog: {active: false}, storage: {active: false}}},
    'basic': {}
  };
  
  for (let name of Object.keys(configs)) {  
    await basic(name, configs[name]);
  }
  process.exit(0);
})();

