var async = require('async'),
    creds = require('../credentials.json'),
    request = require('superagent'),
    inspect = require('util').inspect;


var baseUrl = 'http://127.0.0.1:3000/' + creds.username + '/';
    //baseUrl = 'https://testuser.pryv.li'  'ciypvpa530000kb57acjwwp04'

batch = [];

for(var i=0; i<3000; i++) {
  batch.push(
  {
    method: 'events.create',
    params: {
      streamId: 'rootStream',
      type: 'count/generic',
      content: i
    }
  });
}

var start = Date.now();

async.timesLimit(1000, 3, function (n, cb) {
  request.post(baseUrl + '?auth=' + creds.token)
    .send(batch)
    .set('Content-Type', 'application/json')
    .end(function (err, res) {
      if (err) {
        return console.error('got err', err);
      }
      console.log('finished',n);
      cb();
    });
}, function (err, res) {
  if (err) {
    return console.error('got err', err);
  }
  console.log('finished in ' + (Date.now()-start));
});

