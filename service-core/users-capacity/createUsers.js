const request = require('superagent');
const bluebird = require('bluebird');
const fs = require('fs');

if (process.argv.length < 3) {
  console.log('please provide the nbr of users');
  process.exit(1);
}
const NUM_USERS = parseInt(process.argv[2]);
const CONCURRENCY = 5;
const PASSWORD = 't3st-Z3r0';
const PASSWORD_HASH = '$2a$10$t2GLJUNIDl34ru4V2adFv.aAabBgy7yC2FVJSjl0oazfP4O6H.7v2';

const URL_ENDPOINT = 'http://l.rec.la:5000';


bluebird.resolve(scenario(NUM_USERS));

async function scenario(usersNbr, poolSize) {
  startUsage = Date.now();
  return await bluebird.map(new Array(usersNbr), actionPerUser, {
    concurrency: CONCURRENCY,
  });
}

async function actionPerUser(user, idx) {
  try {
    const username = await createUser('yolo2-', idx);
    //const token = await loginUser(username, idx);
    //await createStream(username, token, idx);
    //await createEvent(username, token, idx);
    console.log(username)
    return bluebird.resolve();
  } catch (e) {
    //console.log('done user not ok ' + idx, e)
    return bluebird.accept(e);
  }
}

function createUser(prefix, idx) {
  return new bluebird((accept, reject) => {
    prefix = prefix || '';
    const username = prefix + idx;
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
        accept(username);
      })
      .catch((e) => {
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
        accept(res.body.token);
      })
      .catch((e) => {
        accept();
      })
  });
}

function computeTimeSeconds(start) {
  return (Date.now() - start) / 1000;
}