const async = require('async');
const pryv = require('pryv');
const _ = require('lodash');
const fs = require('fs');

const params = {
  emfitBatchSize: 100,
  emfitUsers: 10,
  emfitConcurrent: 6,
  domoSize: 3,
  domoConcurrent: 20,
  ecgSize: 2,
  ecgConcurrent: 20,
};



const users = require('../data/users-medium-instance.json');
let connections = [];

for (let i=0; i<params.emfitUsers; i++) {
  connections.push(new pryv.Connection(_.extend({domain: 'pryv.li'}, users[i])));
}

const numericBatch = createNumericBatch(params.emfitBatchSize);

let results = {};
results.params = params;
results.startTime = new Date((new Date().toUTCString()) + ' UTC').toString()
results.startTimeMs = Date.now();
results.emfitBatches = {};

async.eachOfLimit(connections, params.emfitConcurrent, (conn, key, done) => {
  results.emfitBatches[conn.username] = {};
  results.emfitBatches[conn.username].startMs = Date.now();
  console.log('user:', conn.username, 'batch create', results.emfitBatches[conn.username]);
  conn.batchCall(numericBatch, function (err, batchRes) {
    if (err) {
      console.log('user:', conn.username, 'got error', err);
      results.emfitBatches[conn.username].error = err;
      return done();
    }
    console.log('user:', conn.username, 'got results, length:',batchRes.length);
    results.emfitBatches[conn.username].endMs = Date.now();
    results.emfitBatches[conn.username].diffMs = results.emfitBatches[conn.username].endMs - results.emfitBatches[conn.username].startMs;
    done();
  })
}, (err) => {
  if (err) {
    console.log('got err in parallel call', err);
  }
  results.endTimeMs = Date.now();
  results.diffTimeMs = results.endTimeMs - results.startTimeMs;

  console.log('results');
  console.log(results);
  fs.writeFileSync(__dirname + '/../../results/domo-safety/' + results.startTime + '.json', JSON.stringify(results));
});


/*
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
*/

function createNumericBatch(size) {
  let batch = [];

  for (let i = 0; i < size; i++) {
    batch.push({
      method: 'events.create',
      params: {
        streamId: 'weight',
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
