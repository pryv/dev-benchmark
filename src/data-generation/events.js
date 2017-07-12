var async = require('async'),
    creds = require('../credentials.json'),
    request = require('superagent'),
    inspect = require('util').inspect;

var batchSize = process.argv[2];
var requestsCount = process.argv[3];
var parallelCount = process.argv[4];

console.log('batch size:', batchSize);
console.log('requests count:', requestsCount);
console.log('parallel requests limit:', parallelCount);

//var baseUrl = 'http://127.0.0.1:3000/' + creds.username + '/';

var baseUrl = 'https://benchmark-ssd.pryv.li';
var auth = 'cj510f9oe00050bo59wcujon5';

batch = [];

for(var i=0; i<batchSize; i++) {
  batch.push(
  {
    method: 'events.create',
    params: {
      streamId: 'diary',
      type: 'count/generic',
      content: i
    }
  });
}

var start = Date.now();

//console.log('full size', Buffer.byteLength(JSON.stringify(batch), 'utf-8'));

var times = {};


async.timesLimit(requestsCount, parallelCount, function (n, cb) {
  times[n] = {
    start: Date.now()
  };
  request.post(baseUrl + '?auth=' + auth)
    .send(batch)
    .set('Content-Type', 'application/json')
    .end(function (err, res) {
      if (err) {
        return console.error('got err', err.error);
      }
      console.log('finished',n);
      times[n].requestTime = Date.now() - times[n].start;
      cb();
    });
}, function (err, res) {
  if (err) {
    return console.error('got err', err);
  }
  var totalTime = Date.now()-start;
  console.log('total time ' + totalTime);
  console.log('requestTimes ' + inspect(times, false, null))
  var averageTime = 0;
  var numRequests = 0;
  Object.keys(times).forEach(function (t) {
    averageTime += times[t].requestTime;
    numRequests++;
  });
  console.log('average request time: ' + averageTime/numRequests);
});