const async = require('async');
const pryv = require('pryv');
const _ = require('lodash');

const params = {
  emfitSize: 3,
  emfitConcurrent: 1,
  domoSize: 3,
  domoConcurrent: 20,
  ecgSize: 2,
  ecgConcurrent: 20,
};



const users = require('../data/users-micro-instance.json');
let connections = [];

for (let i=0; i<params.emfitConcurrent; i++) {
  connections.push(new pryv.Connection(_.extend({domain: 'pryv.li'}, users[i])));
}

const numericBatch = createNumericBatch(params.emfitSize);

let eventsCreates = [];
connections.forEach((c) => {
  eventsCreates.push(c.batchCall.bind(c, numericBatch, (err, results) => {
    if (err) {
      return console.log('got error', err);
    }
    console.log('got results, size:', results);
  }));
});


async.parallelLimit(eventsCreates, params.emfitConcurrent, (err, results) => {
  if (err) {
    console.log('got err in parallel call', err);
  }
  console.log('results', results);
});

function createNumericBatch(size) {
  let batch = [];

  for (let i = 0; i < size; i++) {
    batch.push({
      method: 'events.create',
      params: {
        streamId: 'heart',
        type: 'mass/kg',
        content: i
      }
    })
  }
  return batch;
}

// TODO
function createFileBatch(size) {

}

function createDomoBatch(size) {
  let batch = [];

  for (let i = 0; i < size; i++) {
    batch.push({
      method: 'events.create',
      params: {
        streamId: 'heart',
        type: 'mass/kg',
        content: i
      }
    })
  }
  return batch;
}
