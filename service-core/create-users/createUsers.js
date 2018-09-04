const request = require('superagent');
const bluebird = require('bluebird');
const fs = require('fs');
const pryv = require('pryv');

const DOMAIN = 'obpm-dev.io';
const REG_URL = 'https://reg.' + DOMAIN;
const HOSTING = 'azure.com-nl2';
const CONCURRENCY = 4;

//const USERS_FILE = './users.json';
//const usersPool = require(USERS_FILE);

if (process.argv.length < 3) {
  console.log('please provide a number');
  process.exit(1);
}
let NUM_USERS = process.argv[2];

console.log('idx,username,password,token');

const usernames = [];
for (let i = 0; i < NUM_USERS; i++) {
  const username = generateUsername();
  usernames.push(username);
}

const startTime = Date.now();

createUsers(usernames)
  .then(() => {
    console.log('done in', computeTimeSeconds(), 'seconds.');
    ;
  })
  .catch((e) => {
    console.log('done in', computeTimeSeconds(), 'seconds.');
  });

async function createUsers(usernames) {
  const userCredentials = await bluebird.map(usernames, createUserWithToken, {
    concurrency: CONCURRENCY,
  });
  //writeToJSON(userCredentials, './users' + generateUsername() + '.json');
}

async function createUserWithToken(username, idx) {
  try {
    const createdUsername = await createUser(username);
    const userCredentials = await createToken(createdUsername);
    await createStreams(userCredentials);
    console.log(idx + ',' + createdUsername + ',' + createdUsername + ',' + userCredentials.token);
    return bluebird.resolve(userCredentials);
  } catch (e) {
    return bluebird.accept(e);
  }

}

function createStreams(creds, idx) {
  return new bluebird((accept, reject) => {
    if (creds.token == null) return accept();
    let con = new pryv.Connection({
      username: creds.username,
      auth: creds.token,
      domain: DOMAIN
    });
    con.batchCall({
      method: 'streams.create',
      params: {
        id: 'diary',
        name: 'Diary',
      }
    }, (err, results) => {
      if (err) {
        return accept();
      }
      results.forEach((r) => {
        if (r.err && r.err.id !== 'item-already-exists') {
          //return console.log(idx, 'error creating stream', r.err.message)
        }
        if (r.err && r.err.id === 'item-already-exists') {
          //return console.log('error: stream already exists', r.err.message)
        }
        //console.log(idx, 'created stream for ', creds.username, ', streamId:', r.stream.id)
      });
      accept();
    })
  });
}

function writeToJSON(userCredentials, file) {
  userCredentials.forEach((c) => {
    usersPool.push({
      username: c.username,
      password: c.password,
      token: c.token
    });
  });
  fs.writeFileSync(file, JSON.stringify(usersPool));
}

function createToken(username, idx) {
  return new bluebird((accept, reject) => {
    if (username == null) return accept();
    request.post('https://' + username + '.' + DOMAIN + '/auth/login')
      .set('Origin', 'https://sw.' + DOMAIN)
      .send({
        appId: 'benchmark-hook',
        username: username,
        password: username
      }).then((res) => {
        createSharedToken(username, username, res.body.token, idx)
          .then((credentials) => {
            accept(credentials);
          })
      })
      .catch((e) => {
        accept({
          username: username,
          password: username,
        });
      })
  });
}

function createSharedToken(username, password, personalToken, idx) {
  return new bluebird((accept, reject) => {
    if ((username == null) || (personalToken == null)) return accept();
    request.post('https://' + username + '.' + DOMAIN + '/accesses')
      .set('Authorization', personalToken)
      .send({
        name: 'benchmark-access',
        permissions: [
          {
            streamId: '*',
            level: 'manage'
          }
        ]
      })
      .end(function (err, res) {
        if (err) {
          return accept({
            username: username,
            password: password
          });
        }
        let appToken = res.body.access.token;
        //  console.log(idx, 'App token created successfully', appToken);
        accept({
          username: username,
          password: password,
          token: appToken
        });
      });
  });
}


async function createUser(username, idx) {
  //return new bluebird((accept, reject) => {
  var userData = {
    hosting: HOSTING,
    appid: 'benchmark-hooks-users',
    username: username,
    email: username + '@' + DOMAIN, // should not be necessary
    password: username,
    invitationtoken: 'enjoy'
  };
  //console.log('creatin', username)
  try {
    const response = await request.post(REG_URL + '/user').send(userData)
    //console.log('youhou', response.body)
    return username;
  } catch (err) {
    if (err) {
      //console.log('got error creatin', username)
      if (err.response && err.response.body && ((err.response.body.id === 'EXISTING_USER_NAME') ||
        (err.response.body.id === 'INVALID_DATA')
        || (err.response.body.id === 'INTERNAL_ERROR'))) {
        //console.log('user exists');
        return await createUser(generateUsername(), idx);
      }
      console.log('got other error')
      if (err.response)
        console.log('response', err.response.body)
      return null
    }
  }
}

function generateUsername() {

  var username = '';
  var dictionnary = 'abcdefghijklmnopqrstuvwxyz0123456789';

  for (var i = 0; i < 23; i++) {
    username += dictionnary.charAt(Math.floor(Math.random() * dictionnary.length));
  }
  return username;
}

function computeTimeSeconds() {
  return (Date.now() - startTime) / 1000;
}