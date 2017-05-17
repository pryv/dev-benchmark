const async = require('async');
const pryv = require('pryv');
const _ = require('lodash');

const stream = {
  id: 'heart',
  name: 'Heart'
};

const users = require('../../json-data/users.json');
let connections = [];

for (let i=0; i<100; i++) {
  connections.push(new pryv.Connection(_.extend({domain: 'pryv.li'}, users[i])));
}

async.eachOfLimit(connections, 10, (conn, key, done) => {
  conn.streams.create(stream, function (err, s) {
    console.log('callback for ', conn.username);
    if (err) {
      console.log('got error', err);
      return done();
    }
    console.log('stream created', s.getData());
    done(null, s.getData);
  })
}, (err, results) => {
  if (err) {
    console.log('got err in parallel call', err);
  }
  console.log('results', results);
});


// Issue with currying, can't submit callback to callee for async flow control
/*
let streamCreates = [];
connections.forEach((c) => { // where is my fucking callback
  streamCreates.push(c.streams.create.bind(c.streams, stream, function (err, s) {
    console.log('callback for ', c.username);
    if (err) {
      return console.log('got error', err);
    }
    console.log('got results, size:', s.getData());
  }));
});

console.log('got', streamCreates.length, 'streamCreates')

async.parallelLimit(streamCreates, 10, (err, results) => {
  if (err) {
    console.log('got err in parallel call', err);
  }
  console.log('results', results);
});
*/