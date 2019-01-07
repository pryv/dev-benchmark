const request = require('superagent');
const bluebird = require('bluebird');
const cuid = require('cuid');

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
const READS_INTERVAL = 1000;

const URL_ENDPOINT = 'http://localhost:11223';

const errors = {
  createUser: 0,
  createPool: 0,
  login: 0,
  createStream: 0,
  createEvent: 0,
  read: 0,
}

let backgroundReads;
let readSuccesses = 0;

let poolTime;
let totalTime;

const startTime = Date.now();

bluebird.resolve(scenario(NUM_USERS, POOL_SIZE))
  .finally(() => {
    if (backgroundReads) clearInterval(backgroundReads);
    totalTime = computeTimeSeconds(startTime);
    computeResults();
  });

function computeResults() {
  console.log('***********************************************************');
  console.log('Total time:', totalTime);
  console.log('Pool creation time:', poolTime);
  console.log('Total time without pool creation:', totalTime - poolTime);
  console.log('Nbr of users:', NUM_USERS);
  console.log('Pool size:', POOL_SIZE);
  console.log('Errors count:', errors);
  console.log('Reads:', readSuccesses);
  console.log('Reads interval', READS_INTERVAL);
  console.log('Concurrency:', CONCURRENCY);
  console.log('Concurrency (pool):', CONCURRENCY_POOL);
  console.log('***********************************************************');
}

async function scenario(usersNbr, poolSize) {
  const startPool = Date.now();
  await bluebird.map(new Array(poolSize), createPoolUser, {
    concurrency: CONCURRENCY_POOL,
  });
  poolTime = computeTimeSeconds(startPool);
  if (READS_INTERVAL) backgroundReads = setInterval(backgroundRead, READS_INTERVAL);
  return await bluebird.map(new Array(usersNbr), actionPerUser, {
    concurrency: CONCURRENCY,
  });
}

async function actionPerUser(user, idx) {
  try {
    const username = await createUser();
    const token = await loginUser(username);
    await createStream(username, token);
    await createEvent(username, token);
    console.log('done user ok', idx)
    return bluebird.resolve();
  } catch (e) {
    console.log('done user not ok ' + idx, e)
    return bluebird.accept(e);
  }
}

function createPoolUser(user, index) {
  return new bluebird((accept, reject) => {
    request.post(URL_ENDPOINT + '/system/pool/create-user')
      .set('Content-Type', 'application/json')
      .set('Authorization', 'OVERRIDE ME')
      .send({}).then(() => {
        console.log('done pool', index)
        accept();
      })
      .catch((e) => {
        console.log('got err', e)
        errors.createPool++;
        accept();
      })
  });
}

function createUser() {
  return new bluebird((accept, reject) => {
    const username = cuid().slice(10);

    request.post(URL_ENDPOINT + '/system/create-user')
      .set('Content-Type', 'application/json')
      .set('Authorization', 'OVERRIDE ME')
      .send({
        username: username,
        passwordHash: PASSWORD_HASH,
        email: username + '@test.com',
        language: 'en'
      }).then(() => {
        accept(username);
      })
      .catch((e) => {
        errors.createUser++;
        console.log('user create error', e)
        accept();
      })
  });
}

function loginUser(username) {
  return new bluebird((accept, reject) => {
    request.post(URL_ENDPOINT + '/' + username + '/auth/login')
      .set('Content-Type', 'application/json')
      .send({
        username: username,
        password: PASSWORD,
        appId: 'pryv-browser'
      }).then((res) => {
        accept(res.body.token);
      })
      .catch((e) => {
        errors.login++;
        accept();
      })
  });
}

function createStream(username, token) {
  return new bluebird((accept, reject) => {
    request.post(URL_ENDPOINT + '/' + username + '/streams')
      .set('Content-Type', 'application/json')
      .set('Authorization', token)
      .send({
        id: 'diary',
        name: 'note/txt',
      }).then(() => {
        accept();
      })
      .catch((e) => {
        errors.createStream++;
        accept();
      })
  });
}

function createEvent(username, token) {
  return new bluebird((accept, reject) => {
    request.post(URL_ENDPOINT + '/' + username + '/events')
      .set('Content-Type', 'application/json')
      .set('Authorization', token)
      .send({
        streamId: 'diary',
        type: 'note/txt',
        content: 'This is an example.'
      }).then(() => {
        accept();
      })
      .catch((e) => {
        errors.createEvent++;
        accept();
      })
  });
}

function backgroundRead() {
  return new bluebird((accept, reject) => {
    request.post(URL_ENDPOINT + '/system/pool/size')
      .set('Content-Type', 'application/json')
      .set('Authorization', 'OVERRIDE ME')
      .send({}).then(() => {
        readSuccesses++;
        accept();
      })
      .catch((e) => {
        errors.read++;
        accept();
      })
  });
}

function computeTimeSeconds(start) {
  return (Date.now() - start) / 1000;
}