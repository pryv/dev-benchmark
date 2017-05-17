const request = require('superagent');
const async = require('async');
const _ = require('lodash');
const fs = require('fs');

const OUTPUT_USERS_FILE = __dirname + '/../../json-data/users.json';

let argv = require('minimist')(process.argv.slice(2));

let domain = argv.domain;
let hosting = argv.hosting;
let prefix = argv.prefix;
let numUsers = argv.num;

console.log(argv);

if (! domain) {
  domain = 'pryv.li';
}
if (! hosting) {
  hosting = 'exoscale.ch-ch2';
}
if (! prefix) {
  prefix = 'testuser-';
}
if (! numUsers) {
  numUsers = 100;
}

let userCreateBase = {
  hosting: hosting,
  appid: 'dev-benchmark',
  username: '',
  email: '',
  password: '',
  invitationtoken: 'enjoy'
};

let usersToCreate = [];

for (let i = 0; i < numUsers; i++) {
  usersToCreate.push(
    _.extend(_.clone(userCreateBase), {
      username: prefix + i,
      email: prefix + i + '@benchmark.tk',
      password: prefix + i
    })
  )
}
let usersStripped = [];
usersToCreate.forEach((u) => {
  usersStripped.push(_.pick(u, ['username', 'password']));
});

fs.writeFileSync(OUTPUT_USERS_FILE, JSON.stringify(usersStripped));

createUsers(usersToCreate);

function createUsers (users) {
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
}