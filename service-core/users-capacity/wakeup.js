const request = require('superagent');
const fs = require('fs');
const readline = require('readline');
const bluebird = require('bluebird');
const socketIO = require('socket.io-client');

const PASSWORD = 't3st-Z3r0';
const URL_ENDPOINT = 'http://l.rec.la:5000'
function userUrl(user) { return 'http://' + user +'.rec.la:5000'; }

const aa = fs.readFileSync('users.txt', { encoding: 'utf-8'});


var userList = [];

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
   await attachSocket(user, token, idx);
   await createStream(user, token, idx);
    await createEvent(user, token, idx);
  } catch (e) {
  }
}

async function login(username, idx) {
  
    try {
      const res = await request.post(URL_ENDPOINT + '/' + username + '/auth/login')
        .set('Content-Type', 'application/json')
        .set('Origin', 'https://l.rec.la/')
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

async function attachSocket(username, token, idx) {
	let promise = new Promise((resolve, reject) => {
		var url = userUrl(username) + '/' + username +'?auth=' + token + '&resource=/' + username;

		const socket = socketIO.connect(url);
		// I expect this event to be triggered
		socket.on('connect_error', function(error){
				console.log('Connection Error ' + error );
				socket.close();
				reject(error);
		});
		
		
		socket.on('eventsChanged', function (from, msg) {
						console.log('eventsChanged > ' + username);
				 });
		
		socket.on('connect', function () {
			console.log('socket connection ' + username);
				resolve(socket);
				
			});
 		});
 		
 }


