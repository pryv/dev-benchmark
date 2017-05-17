const request = require('superagent');
const async = require('async');
const _ = require('lodash');

let userCreateBase = {
  "hosting": "exoscale.ch-ch2",
  "appid": "dev-benchmark",
  "username": "",
  "email": "development-tests-001@bogus.tk",
  "password": "testdeuxfois",
  "invitationtoken": "enjoy"
};

let usersToCreate = [];

for (let i = 0; i < 100; i++) {
  usersToCreate.push(
    _.extend(_.clone(userCreateBase), {
      username: 'testuser2-' + i,
      email: 'testuser2-' + i + '@benchmark.tk',
      password: 'testuser2-' + i
    })
  )
}
let usersStripped = [];
usersToCreate.forEach((u) => {
  usersStripped.push(_.pick(u, ['username', 'password']));
});


const fs = require('fs');
fs.writeFileSync('users.json', JSON.stringify(usersStripped));


async.eachSeries(usersToCreate, (user, cb) => {
  request.post('https://reg.pryv.li/user')
    .send(user)
    .set('Content-Type', 'application/json')
    .end((err, res) => {
      if (err) {
        console.log('error, failed to create user:', user.username);
      }
      console.log('res', res.body)
      cb();
    });
});
