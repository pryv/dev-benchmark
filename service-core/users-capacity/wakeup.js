const request = require('superagent');
const fs = require('fs');
const readline = require('readline');
const bluebird = require('bluebird');

const PASSWORD = 't3st-Z3r0';
const URL_ENDPOINT = 'https://co3.pryv.li'

const aa = fs.readFileSync('users.txt', { encoding: 'utf-8'});

let users = aa.split('\n');
users.pop()

console.log('loaded', users.length, 'users')

allezy()
  .then(() => {
    console.log('done')
    console.log(stats)
  })

function allezy() {
  console.log('going to log', users.length, 'users')
  return bluebird.map(users, actionPerUser, {
    concurrency: 10,
  });
}

const stats = {
  logins: {
    ok: 0,
    fails: 0,
  },
  streams: {
    ok: 0,
    fails: 0,
  },
  events: {
    ok: 0,
    fails: 0,
  },
}

async function actionPerUser(user, idx) {
  try {
    const token = await login(user, idx);
    await createStream(user, token, idx);
    await createEvent(user, token, idx);
  } catch (e) {
  }
}

async function login(username, idx) {
  
    try {
      const res = await request.post(URL_ENDPOINT + '/' + username + '/auth/login')
        .set('Content-Type', 'application/json')
        .send({
          username: username,
          password: PASSWORD,
          appId: 'pryv-browser'
        });
      console.log(idx, 'logged ');
      stats.logins.ok++;
      return res.body.token;
    } catch (e) {
      console.log(idx, 'error logging');
      stats.logins.fails++;
    }
}

async function createStream(username, token, idx) {

  try {
    const res = await request.post(URL_ENDPOINT + '/' + username + '/streams')
      .set('Content-Type', 'application/json')
      .set('authorization', token)
      .send({
        id: 'diary',
        name: 'diary',
      });
    console.log(idx, 'created stream');
    stats.streams.ok++;
  } catch (e) {
    console.log(idx, 'error stream', e.response.body.error);
    stats.streams.fails++;
  }
}

async function createEvent(username, token, idx) {

  try {
    const res = await request.post(URL_ENDPOINT + '/' + username + '/events')
      .set('Content-Type', 'application/json')
      .set('authorization', token)
      .send({
        streamId: 'diary',
        type: 'note/txt',
        content: 'yolo'
      });
    console.log(idx, 'created event');
    stats.events.ok++;
  } catch (e) {
    console.log(idx, 'error event', e.response.body.error);
    stats.events.fails++;
  }
}

