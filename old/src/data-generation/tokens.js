const request = require('superagent');
const async = require('async');
const _ = require('lodash');
const fs = require('fs');

const usersFile = __dirname + '/../../json-data/users.json';
const users = require(usersFile);

let loginUsers = [];
users.forEach((u) => {
  loginUsers.push(_.extend(u, {appId: 'pryv-benchmark'}));
});

let usersWithToken = [];
async.eachSeries(loginUsers, (user, cb) => {
  request.post('https://' + user.username + '.pryv.li/auth/login')
    .send(user)
    .set('Content-Type', 'application/json')
    .set('Origin', 'https://sw.pryv.li')
    .end((err, res) => {
      console.log('user', user)
      if (err) {
        console.log('err', err.error)
      }
      console.log('res', res.body)
      usersWithToken.push({
        username: user.username,
        password: user.password,
        auth: res.body.token
      });
      cb();
    });
}, () => {
  fs.writeFileSync(usersFile, JSON.stringify(usersWithToken));
});

