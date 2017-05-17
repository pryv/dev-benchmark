const async = require('async');
const pryv = require('pryv');
const _ = require('lodash');
const fs = require('fs');

let concurrency = parseInt(process.argv[2]);

if (!concurrency) {
  concurrency = 5;
}

const params = {
  emfitBatchSize: 2000,
  emfitUsers: 10,
  emfitConcurrent: concurrency,
};

let outputFileName = __dirname + '/../../results/domo-safety/batch-'
  + params.emfitBatchSize + '-users-' + params.emfitUsers
  + '-concurrency-' + params.emfitConcurrent + '-';

const users = require('../../json-data/users.json');

runEmfitBatches(params, users);

function runEmfitBatches(params, users) {

  let connections = [];
  for (let i = 0; i < params.emfitUsers; i++) {
    connections.push(new pryv.Connection(_.extend({domain: 'pryv.li'}, users[i])));
  }

  const numericBatch = createNumericBatch(params.emfitBatchSize);

  let results = {};
  results.params = params;
  results.startTime = new Date((new Date().toUTCString()) + ' UTC').toString();
  results.startTimeMs = Date.now();
  results.emfitBatches = {};

  outputFileName +=  results.startTime + '.json';

  async.eachOfLimit(connections, params.emfitConcurrent, (conn, key, done) => {
    results.emfitBatches[conn.username] = {};
    results.emfitBatches[conn.username].startMs = Date.now();
    conn.batchCall(numericBatch, function (err, batchRes) {
      if (err) {
        console.log('user:', conn.username, 'got error', err);
        results.emfitBatches[conn.username].error = err;
        return done();
      }
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
    results.meanTimeMs = computeMeanTime(results.emfitBatches, _.map(connections, 'username'));

    console.log('results');
    console.log(results);

    fs.writeFileSync(outputFileName, JSON.stringify(results));
  });

}

function computeMeanTime(batchResults, usernames) {
  let meanTime = 0;
  usernames.forEach((u) => {
    meanTime += batchResults[u].diffMs;
  });
  return meanTime / usernames.length;
}


function createNumericBatch(size) {
  let batch = [];

  for (let i = 0; i < size; i++) {
    batch.push({
      method: 'events.create',
      params: {
        streamId: 'weight',
        type: 'mass/kg',
        content: i,
        time: Date.now(),
      }
    })
  }

  return batch;
}
