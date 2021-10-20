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

// keys for runs 
const R = { MONGO: 'mongo', HELLO: 'hello', EVENTS: 'events', STREAMS: 'streams', STREAMS_CREATE: 'streams_c', BATCH_EVENTS_CREATE: 'b_events', BATCH_STREAMS_CREATE: 'b_streams'};

// async/await
async function go(config, autocanonConfig) {
  const todos = config.do;
  delete config.do;

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
  if (todos.includes(R.HELLO)) {
    const hwServer = await launchHelloWorld.go();
    await runs({
      title: 'helloWorld',
      url: 'http://localhost:8080/'
    });
    await hwServer.kill();
  }

  //-------------- Hello Mongo ---------//
  if (todos.includes(R.MONGO)) {
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
  }

  //-------------- Service Core ---------//
  if (todos.includes(R.EVENTS)) {
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
  }

  if (todos.includes(R.STREAMS)) {
    await resetUser();
    // create a tree of 50 streams
    let parentId = null;
    for (let i = 0; i < 50; i++) {
      const id = i + 'aaaa';
      await streams.create(apiEndpoint, {id: id, name: id, parentId : parentId});
      parentId = id;
    }

    await runs({
      title: 'streams.get',
      url: apiEndpoint + 'streams',
      //requests: [{onResponse: path.resolve(__dirname, './lib/on-response/to-console.js')}],
    });
  }

  if (todos.includes(R.STREAMS_CREATE)) {
    await resetUser();
    await runs({
      title: 'streams.create',
      url: apiEndpoint + 'streams',
      method: 'POST',
      body: JSON.stringify({ name: '[<id>]' }),
      idReplacement: true,
      //requests: [{onResponse: path.resolve(__dirname, './lib/on-response/to-console.js')}],
    });
  }

  if (todos.includes(R.BATCH_STREAMS_CREATE)) {
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
  }

  if (todos.includes(R.BATCH_EVENTS_CREATE)) {
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
  }
  if (typeof server != 'undefined')  await server.kill();
  return { abstract: abstract, results: results};
}


(async () => {
  const autocanonConfig = {
    connections: 10, 
    pipelining: 1, 
    duration: 10, 
    workers: 4
  }
  
  const defaults = { 
    do: [R.MONGO, R.HELLO, R.EVENTS,  R.STREAMS, R.STREAMS_CREATE, R.BATCH_EVENTS_CREATE, R.BATCH_STREAMS_CREATE],
    trace: { enable: true }
  };

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
      caching: {isActive: true}
    },
    'light-no-cache': {
      backwardCombackwardCompatibility: {
        systemStreams: {prefix: {isActive: false}},
        tags: {isActive: false} 
      },
      audit: {syslog: {active: false}, storage: {active: false}},
      integrity: { isActive: false},
      caching: {isActive: false}
    },
    'fat': {
      skip: false,
      audit: {syslog: {active: true}, storage: {active: true}},
      integrity: { isActive: true},
      caching: {isActive: false}
    },
    'basic': {
      skip: false
    }
  };
  

  for (let name of Object.keys(configs)) {  
    const config = Object.assign(Object.assign({}, defaults), configs[name]);
    if (config.skip) continue;
    delete config.skip;

    if (config.trace?.enable) config.trace.tags = { benchmark: name};

    const res = await go(config, autocanonConfig);  

    await resultTools.save(TEST_SUITE_NAME, name , res);
    resultTools.show(name, res);
  }
  process.exit(0);
})();

