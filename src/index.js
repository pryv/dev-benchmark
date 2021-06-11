const launchApiServer = require('./launchers/launch-api-server');
const launchHelloWorld = require('./launchers/launch-hello-world');
const launchHelloMongo = require('./launchers/launch-hello-mongo');
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
async function go(config, autocanonConfig) {
  const server = await launchApiServer.withConfig(config);
  await globals.init();
  const user = await users.create();
  const access = await accesses.create(user.apiEndpoint);
  // eventually reconstruct apiEnpoint (for older API Versionss)
  const apiEndpoint = access.apiEndpoint || await pryv.service.apiEndpointFor(user.username, access.token);
  const stream = await streams.create(apiEndpoint);
 
  const results = { data: pryv.meta, config: config, defaults: autocanonConfig, runs: [] };
  const abstract = { version: pryv.meta.apiVersion, config: config, runs: [] };

  /**
   * Run one of tests 
   * @param {*} settings 
   */
  async function runs(settings) {
    const params = Object.assign({}, autocanonConfig);
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

  const hmServer = await launchHelloMongo.go();
  await runs({
    title: 'mongoGet20',
    url: 'http://localhost:8080/'
  });
  await runs({
    title: 'mongoCreate1',
    url: 'http://localhost:8080/',
    body: JSON.stringify({"streamIds":["weight"],"type":"mass/kg","content":90})
  });
  await hmServer.kill();

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

  await server.kill();
  return { abstract: abstract, results: results};
}


(async () => {
  const autocanonConfig = {
    connections: 10, 
    pipelining: 1, 
    duration: 10, 
    workers: 4
  }
  
  const configs = {
    //'audit-storage-only': {audit: {storage: {active: false}}}, 
    //'audit-syslog-only': {audit: {syslog: {active: false}}},
    //'audit-none': {audit: {syslog: {active: false}, storage: {active: false}}},
    'basic': {}
  };
  
  for (let name of Object.keys(configs)) {  
    const res = await go(configs[name], autocanonConfig);
    fs.writeFileSync('results/' + baseFileName + '-' + name + '-full.json',  JSON.stringify(res.results,null,2));
    fs.writeFileSync('results/' + baseFileName + '-' + name + '.json',  JSON.stringify(res.abstract,null,2));

    let output = name + ':>> ';
    let errors = [];
    for (const run of res.abstract.runs) {
      output += run.title + ': ' + run.rate;
      if (run.errors) output += ' with ' + run.errors + ' errors |';
      output += '  ';
    }
    console.log(output);
  }
  process.exit(0);
})();

