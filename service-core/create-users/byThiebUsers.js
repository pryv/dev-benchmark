const request = require('superagent');
const bluebird = require('bluebird');
const cuid = require('cuid');
const fs = require('fs');

if (process.argv.length < 4) {
  console.log('please provide the nbr of users and pool size');
  process.exit(1);
}
const NUM_USERS = parseInt(process.argv[2]);
const POOL_SIZE = parseInt(process.argv[3]);
const CONCURRENCY = 10;
const CONCURRENCY_POOL = 5;
const PASSWORD = 't3st-Z3r0';
const PASSWORD_HASH = '$2a$10$t2GLJUNIDl34ru4V2adFv.aAabBgy7yC2FVJSjl0oazfP4O6H.7v2';
const BACKGROUND_INTERVAL = 1000;

const URL_ENDPOINT = 'http://localhost:11223';

const stats = {
  unit: 'ms',
  main: {
    poolTime: 0,
    usageTime: 0,
    totalTime: 0,
  },
  pool: {
    creationTimes: {
      values: [
        {
          timestamp: 0,
          requestTime: 0
        }
      ],
      mean: 0,
      min: 99999999999,
      max: 0,
    },
  },
  usage: {
    userCreations: {
      values: [
        {
          timestamp: 0,
          requestTime: 0
        }
      ],
      mean: 0,
      min: 99999999999,
      max: 0,
    },
    logins: {
      values: [
        {
          timestamp: 0,
          requestTime: 0
        }
      ],
      mean: 0,
      min: 99999999999,
      max: 0,
    },
    streamCreations: {
      values: [
        {
          timestamp: 0,
          requestTime: 0
        }
      ],
      mean: 0,
      min: 99999999999,
      max: 0,
    },
    eventCreations: {
      values: [
        {
          timestamp: 0,
          requestTime: 0
        }
      ],
      mean: 0,
      min: 99999999999,
      max: 0,
    },
  },
  background: {
    reads: {
      mean: 0,
      min: 99999999,
      max: 0,
      values: [
        {
          timestamp: 0,
          requestTime: 0,
          status: 0
        }
      ]
    },
    writes: {
      mean: 0,
      min: 99999999,
      max: 0,
      values: [
        {
          timestamp: 0,
          requestTime: 0,
          status: 0
        }
      ]
    },
  }
};

stats.pool.creationTimes.values = [];
stats.usage.userCreations.values = [];
stats.usage.logins.values = [];
stats.usage.streamCreations.values = [];
stats.usage.eventCreations.values = [];

const errors = {
  createUser: 0,
  createPool: 0,
  login: 0,
  createStream: 0,
  createEvent: 0,
  read: 0,
  write: 0,
}

const backgroundUser = {
  username: '',
  token: '',
  streamId: 'diary',
};

let backgroundReads;
let backgroundWrites;
let readSuccesses = 0;
let writeSuccesses = 0;

let poolTime;
let totalTime;
let startPool;
let startUsage;

const startTime = Date.now();

bluebird.resolve(scenario(NUM_USERS, POOL_SIZE))
  .finally(() => {
    if (backgroundReads) clearInterval(backgroundReads);
    if (backgroundWrites) clearInterval(backgroundWrites);
    totalTime = computeTimeSeconds(startTime);
    computeResults();
    writeStats();
  });

function computeResults() {
  stats.pool.creationTimes.values.forEach((a) => {
    stats.pool.creationTimes.mean += a.requestTime;
    if (a.requestTime < stats.pool.creationTimes.min) stats.pool.creationTimes.min = a.requestTime;
    if (a.requestTime > stats.pool.creationTimes.max) stats.pool.creationTimes.max = a.requestTime;
  });
  stats.pool.creationTimes.mean = stats.pool.creationTimes.mean / stats.pool.creationTimes.values.length;
  stats.usage.userCreations.values.forEach((a) => {
    stats.usage.userCreations.mean += a.requestTime;
    if (a.requestTime < stats.usage.userCreations.min) stats.usage.userCreations.min = a.requestTime;
    if (a.requestTime > stats.usage.userCreations.max) stats.usage.userCreations.max = a.requestTime;
  });
  stats.usage.userCreations.mean = stats.usage.userCreations.mean / stats.usage.userCreations.values.length;
  stats.usage.logins.values.forEach((a) => {
    stats.usage.logins.mean += a.requestTime;
    if (a.requestTime < stats.usage.logins.min) stats.usage.logins.min = a.requestTime;
    if (a.requestTime > stats.usage.logins.max) stats.usage.logins.max = a.requestTime;
  });
  stats.usage.logins.mean = stats.usage.logins.mean / stats.usage.logins.values.length;
  stats.usage.streamCreations.values.forEach((a) => {
    stats.usage.streamCreations.mean += a.requestTime;
    if (a.requestTime < stats.usage.streamCreations.min) stats.usage.streamCreations.min = a.requestTime;
    if (a.requestTime > stats.usage.streamCreations.max) stats.usage.streamCreations.max = a.requestTime;
  });
  stats.usage.streamCreations.mean = stats.usage.streamCreations.mean / stats.usage.streamCreations.values.length;
  stats.usage.eventCreations.values.forEach((a) => {
    stats.usage.eventCreations.mean += a.requestTime;
    if (a.requestTime < stats.usage.eventCreations.min) stats.usage.eventCreations.min = a.requestTime;
    if (a.requestTime > stats.usage.eventCreations.max) stats.usage.eventCreations.max = a.requestTime;
  });
  stats.usage.eventCreations.mean = stats.usage.eventCreations.mean / stats.usage.eventCreations.values.length;

  stats.background.reads.values.forEach((a) => {
    stats.background.reads.mean += a.requestTime;
    if (a.requestTime < stats.background.reads.min) stats.background.reads.min = a.requestTime;
    if (a.requestTime > stats.background.reads.max) stats.background.reads.max = a.requestTime;
  });
  stats.background.reads.mean = stats.background.reads.mean / stats.background.reads.values.length;
  stats.background.writes.values.forEach((a) => {
    stats.background.writes.mean += a.requestTime;
    if (a.requestTime < stats.background.writes.min) stats.background.writes.min = a.requestTime;
    if (a.requestTime > stats.background.writes.max) stats.background.writes.max = a.requestTime;
  });
  stats.background.writes.mean = stats.background.writes.mean / stats.background.writes.values.length;
  
  stats.main.unit = 's';
  stats.main.totalTime = totalTime;
  stats.main.poolTime = poolTime;
  stats.main.usageTime = totalTime - poolTime;
  stats.main.poolSize = POOL_SIZE;
  stats.main.poolConcurrency = CONCURRENCY_POOL;
  stats.main.usersSize = NUM_USERS;
  stats.main.usageConcurrency = CONCURRENCY;
  stats.main.background = {
    interval: BACKGROUND_INTERVAL,
    unit: 'ms' ,
    reads: {
      successes: readSuccesses,
    },
    writes: {
      successes: writeSuccesses,
    }
  };
  stats.main.errors = errors;

  console.log('***********************************************************');
  console.log('Total time (s):', totalTime);
  console.log('Pool creation time (s):', poolTime);
  console.log('Total time without pool creation (s):', totalTime - poolTime);
  console.log('Nbr of users:', NUM_USERS);
  console.log('Pool size:', POOL_SIZE);
  console.log('Errors count:', errors);
  console.log('Reads:', readSuccesses);
  console.log('Background interval (ms)', BACKGROUND_INTERVAL);
  console.log('Concurrency:', CONCURRENCY);
  console.log('Concurrency (pool):', CONCURRENCY_POOL);
  console.log('###############');
  console.log('Latencies: mean/min/max (ms)');
  console.log('pool:', stats.pool.creationTimes.mean, '/', stats.pool.creationTimes.min, '/', stats.pool.creationTimes.max); 
  console.log('userCreations:', stats.usage.userCreations.mean, '/', stats.usage.userCreations.min, '/', stats.usage.userCreations.max);
  console.log('logins:', stats.usage.logins.mean, '/', stats.usage.logins.min, '/', stats.usage.logins.max);
  console.log('streamCreations:', stats.usage.streamCreations.mean, '/', stats.usage.streamCreations.min, '/', stats.usage.streamCreations.max);
  console.log('eventCreations:', stats.usage.eventCreations.mean, '/', stats.usage.eventCreations.min, '/', stats.usage.eventCreations.max);
  console.log('***********************************************************');
}

function writeStats() {
  fs.writeFileSync(new Date().toISOString() + '-stats.json', JSON.stringify(stats));
}

async function scenario(usersNbr, poolSize) {
  await createBackgroundUser();
  startPool = Date.now();
  await bluebird.map(new Array(poolSize), createPoolUser, {
    concurrency: CONCURRENCY_POOL,
  });
  poolTime = computeTimeSeconds(startPool);
  startUsage = Date.now();
  if (BACKGROUND_INTERVAL) backgroundReads = setInterval(backgroundRead, BACKGROUND_INTERVAL);
  if (BACKGROUND_INTERVAL) backgroundWrites = setInterval(backgroundWrite, BACKGROUND_INTERVAL);
  return await bluebird.map(new Array(usersNbr), actionPerUser, {
    concurrency: CONCURRENCY,
  });
}

async function actionPerUser(user, idx) {
  try {
    const username = await createUser();
    const token = await loginUser(username, idx);
    await createStream(username, token, idx);
    await createEvent(username, token, idx);
    console.log('done user ok', idx)
    return bluebird.resolve();
  } catch (e) {
    console.log('done user not ok ' + idx, e)
    return bluebird.accept(e);
  }
}

function createPoolUser(user, index) {
  return new bluebird((accept, reject) => {
    const s = Date.now();
    request.post(URL_ENDPOINT + '/system/pool/create-user')
      .set('Content-Type', 'application/json')
      .set('Authorization', 'OVERRIDE ME')
      .send({}).then((res) => {
        console.log('done pool', index)
        stats.pool.creationTimes.values.push({
          timestamp: Date.now() - startPool,
          requestTime: Date.now() - s,
          status: res.status,
        })
        accept();
      })
      .catch((e) => {
        console.log('got err', e)
        errors.createPool++;
        stats.pool.creationTimes.values.push({
          timestamp: Date.now() - startPool,
          requestTime: Date.now() - s,
          status: e.status,
        })
        accept();
      })
  });
}

function createUser(prefix) {
  return new bluebird((accept, reject) => {
    prefix = prefix || '';
    const username = prefix + cuid().slice(10);
    const s = Date.now();
    request.post(URL_ENDPOINT + '/system/create-user')
      .set('Content-Type', 'application/json')
      .set('Authorization', 'OVERRIDE ME')
      .send({
        username: username,
        passwordHash: PASSWORD_HASH,
        email: username + '@test.com',
        language: 'en'
      }).then((res) => {
        stats.usage.userCreations.values.push({
          timestamp: Date.now() - startUsage,
          requestTime: Date.now() - s,
          status: res.status,
        });
        accept(username);
      })
      .catch((e) => {
        errors.createUser++;
        stats.usage.userCreations.values.push({
          timestamp: Date.now() - startUsage,
          requestTime: Date.now() - s,
          status: e.status,
        });
        accept();
      })
  });
}

function loginUser(username) {
  return new bluebird((accept, reject) => {
    const s = Date.now();
    request.post(URL_ENDPOINT + '/' + username + '/auth/login')
      .set('Content-Type', 'application/json')
      .send({
        username: username,
        password: PASSWORD,
        appId: 'pryv-browser'
      }).then((res) => {
        stats.usage.logins.values.push({
          timestamp: Date.now() - startUsage,
          requestTime: Date.now() - s,
          status: res.status,
        });
        accept(res.body.token);
      })
      .catch((e) => {
        errors.login++;
        stats.usage.logins.values.push({
          timestamp: Date.now() - startUsage,
          requestTime: Date.now() - s,
          status: e.status,
        });
        accept();
      })
  });
}

function createStream(username, token) {
  return new bluebird((accept, reject) => {
    const s = Date.now();
    request.post(URL_ENDPOINT + '/' + username + '/streams')
      .set('Content-Type', 'application/json')
      .set('Authorization', token)
      .send({
        id: 'diary',
        name: 'note/txt',
      }).then((res) => {
        stats.usage.streamCreations.values.push({
          timestamp: Date.now() - startUsage,
          requestTime: Date.now() - s,
          status: res.status,
        });
        accept();
      })
      .catch((e) => {
        errors.createStream++;
        stats.usage.streamCreations.values.push({
          timestamp: Date.now() - startUsage,
          requestTime: Date.now() - s,
          status: e.status,
        });
        accept();
      })
  });
}

function createEvent(username, token) {
  return new bluebird((accept, reject) => {
    const s = Date.now();
    request.post(URL_ENDPOINT + '/' + username + '/events')
      .set('Content-Type', 'application/json')
      .set('Authorization', token)
      .send({
        streamId: 'diary',
        type: 'note/txt',
        content: 'This is an example.'
      }).then((res) => {
        stats.usage.eventCreations.values.push({
          timestamp: Date.now() - startUsage,
          requestTime: Date.now() - s,
          status: res.status,
        });
        accept();
      })
      .catch((e) => {
        errors.createEvent++;
        stats.usage.eventCreations.values.push({
          timestamp: Date.now() - startUsage,
          requestTime: Date.now() - s,
          status: e.status,
        });
        accept();
      })
  });
}

async function createBackgroundUser() {
  backgroundUser.username = await createUser('bkgrnd-');
  backgroundUser.token = await loginUser(backgroundUser.username);
  await createStream(backgroundUser.username, backgroundUser.token);
}

function backgroundRead() {
  return new bluebird((accept, reject) => {
    const s = Date.now();
    request.get(URL_ENDPOINT + '/' + backgroundUser.username + '/events/')
      .set('Content-Type', 'application/json')
      .set('Authorization', backgroundUser.token)
      .send({}).then((res) => {
        readSuccesses++;
        stats.background.reads.values.push({
          timestamp: Date.now() - startUsage,
          requestTime: Date.now() - s,
          status: res.status,
        });
        accept();
      })
      .catch((e) => {
        errors.read++;
        stats.background.reads.values.push({
          timestamp: Date.now() - startUsage,
          requestTime: Date.now() - s,
          status: e.status,
        });
        accept();
      })
  });
}

function backgroundWrite() {
  return new bluebird((accept, reject) => {
    const s = Date.now();
    request.post(URL_ENDPOINT + '/' + backgroundUser.username + '/events/')
      .set('Content-Type', 'application/json')
      .set('Authorization', backgroundUser.token)
      .send({ streamId: 'diary', type: 'note/txt', content: 'a'})
      .then((res) => {
        writeSuccesses++;
        stats.background.writes.values.push({
          timestamp: Date.now() - startUsage,
          requestTime: Date.now() - s,
          status: res.status,
        });
        accept();
      })
      .catch((e) => {
        errors.write++;
        stats.background.writes.values.push({
          timestamp: Date.now() - startUsage,
          requestTime: Date.now() - s,
          status: e.status,
        });
        accept();
      })
  });
}

function computeTimeSeconds(start) {
  return (Date.now() - start) / 1000;
}