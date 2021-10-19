const launchApiServer = require('./launchers/launch-api-server');
const launchHelloWorld = require('./launchers/launch-hello-world');
const launchHelloMongo = require('./launchers/launch-hello-mongo');
const globals = require('./lib/globals');
const users = require('./lib/users');
const accesses = require('./lib/accesses');
const streams = require('./lib/streams');
const resultTools = require('./lib/resultTools');

const path = require('path');

const autocannon = require('autocannon');
const Pryv = require('pryv');

const TEST_SUITE_NAME = 'v2';
const PAUSE_BETWEEN_RUNS = 2 ; // in seconds

// async/await
async function go(config, autocanonConfig) {
  const server = await launchApiServer.withConfig(config, false);
  await globals.init();

  let user, access, apiEndpoint, stream;

  async function resetUser() {
    user = await users.create();
    access = await accesses.create(user.apiEndpoint);
    // eventually reconstruct apiEnpoint (for older API Versionss)
    apiEndpoint = access.apiEndpoint || await pryv.service.apiEndpointFor(user.username, access.token);
    stream = await streams.create(apiEndpoint);
  }
 
  const results = { data: pryv.meta, config: config, defaults: autocanonConfig, runs: [] };
  const abstract = { version: pryv.meta.apiVersion, config: config, runs: [] };

  /**
   * Run one of tests 
   * @param {*} settings 
   */
  async function runs(settings) {
    const params = Object.assign({headers: {'Content-Type': 'application/json'}}, autocanonConfig);
    Object.assign(params, settings);
    const res = await autocannon(params)
    results.runs.push(res);
    abstract.runs.push({
      title: settings.title,
      rate: res.requests.average,
      errors: res.errors
    })

    // let existing call end
    await new Promise(r => setTimeout(r, PAUSE_BETWEEN_RUNS * 1000));
  }

  //--------- HERE COMES THE TEST - SUITE -----------//
  //--------- IF CHANGED ALSO CHANGE ITS NAME IN THE HEADERS -------//

  //-------------- Hello World ---------//
  const hwServer = await launchHelloWorld.go();
  await runs({
    title: 'helloWorld',
    url: 'http://localhost:8080/'
  });
  await hwServer.kill();

  //-------------- Hello Mongo ---------//
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

  //-------------- Service Core ---------//
  await resetUser();
  await runs({
    title: 'events.create',
    url: apiEndpoint + 'events',
    method: 'POST',
    body: JSON.stringify({ type: 'note/txt', streamId: stream.id, content: 'Hello World' }),
    //requests: [{setupRequest: path.resolve(__dirname, './lib/setup-request/to-console.js'), onResponse: path.resolve(__dirname, './lib/on-response/to-console.js')}],
  });

  await runs({
    title: 'events.get',
    url: apiEndpoint + 'events?limit=100',
    //requests: [{onResponse: path.resolve(__dirname, './lib/on-response/to-console.js')}],
  });

  await resetUser();
  await runs({
    title: 'streams.create',
    url: apiEndpoint + 'streams',
    method: 'POST',
    body: JSON.stringify({ name: '[<id>]' }),
    idReplacement: true,
    //requests: [{onResponse: path.resolve(__dirname, './lib/on-response/to-console.js')}],
  });

  await resetUser();
  const batchStreams = [];
  let parentId = null;
  for (let i = 0; i < 10; i++) {
    const id = i + 'aaaa[<id>]';
    batchStreams.push({method: 'streams.create', params: {id: id, name: id, parentId : parentId}});
    parentId = id;
  }
  await runs({
    title: 'batch streams.create',
    url: apiEndpoint,
    method: 'POST',
    body: JSON.stringify(batchStreams),
    requests: [{
      setupRequest: path.resolve(__dirname, './lib/setup-request/batch-streams.create.js'), 
      //onResponse: path.resolve(__dirname, './lib/on-response/to-console.js')
    }],
  });

  await resetUser();
  const batchEvents = [];
  for (let i = 0; i < 10; i++) {
    batchEvents.push({method: 'events.create', params: { type: 'note/txt', streamId: stream.id, content: 'Hello World' }});
  }
  await runs({
    title: 'batch events.create',
    url: apiEndpoint ,
    method: 'POST',
    body: JSON.stringify(batchEvents),
    //requests: [{onResponse: path.resolve(__dirname, './lib/on-response/to-console.js')}],
  });

  await server.kill();
  return { abstract: abstract, results: results};
}


(async () => {
  const autocanonConfig = {
    connections: 10, 
    pipelining: 1, 
    duration: 1, 
    workers: 4
  }
  
  const defaults = { trace: { enable: false }};

  const configs = {
    //'audit-storage-only': {audit: {storage: {active: false}}}, 
    //'audit-syslog-only': {audit: {syslog: {active: false}}},
    //'audit-none': {audit: {syslog: {active: false}, storage: {active: false}}},
    'light': {
      backwardCombackwardCompatibility: {
        systemStreams: {prefix: {isActive: false}},
        tags: {isActive: false} 
      },
      audit: {syslog: {active: false}, storage: {active: false}},
      integrity: { isActive: false},
      caching: {isActive: true, localStreams: true, accesses: true}
    },
    'fat': {
      audit: {syslog: {active: true}, storage: {active: true}},
      integrity: { isActive: true},
      caching: {isActive: false, localStreams: false, accesses: false}
    },
    'basic': {}
  };
  

  for (let name of Object.keys(configs)) {  
    const config = Object.assign(configs[name], defaults);
    const res = await go(config, autocanonConfig);  

    await resultTools.save(TEST_SUITE_NAME, name , res);
    resultTools.show(name, res);
  }
  process.exit(0);
})();

