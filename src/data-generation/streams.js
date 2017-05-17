const async = require('async');
const pryv = require('pryv');
const _ = require('lodash');

const stream = {
  id: 'weight',
  name: 'Weight'
};



const users = require('../data/users-micro-instance.json');
let connections = [];

for (let i=0; i<100; i++) {
  connections.push(new pryv.Connection(_.extend({domain: 'pryv.li'}, users[i])));
}

let streamCreates = [];
connections.forEach((c) => {
  streamCreates.push(c.streams.create.bind(c.streams, stream, (err, s) => {
    if (err) {
      return console.log('got error', err);
    }
    console.log('got results, size:', s.getData());
  }));
});


async.parallelLimit(streamCreates, 10, (err, results) => {
  if (err) {
    console.log('got err in parallel call', err);
  }
  console.log('results', results);
});