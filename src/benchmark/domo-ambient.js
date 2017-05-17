const async = require('async');
const pryv = require('pryv');
const _ = require('lodash');
const fs = require('fs');

const params = {
  domoUsers: 20,
  domoConcurrent: 20,
  domoPeriodSeconds: 20, // each 20 seconds / 3 per minute
  ecgUsers: 20,
  ecgConcurrent: 20,
  ecgPeriodSeconds: 360, // each 360 seconds / each 6 minutes / 10 per hour
};

// need domo request
const users = require('../data/users-medium-instance.json');

runECGcreations(params, users);

function runECGcreations(params, users) {
  let connections = [];
  for (let i = 0; i < params.ecgUsers; i++) {
    connections.push(new pryv.Connection(_.extend({domain: 'pryv.li'}, users[i])));
  }
  const event = {
    type: 'picture/attached',
    streamId: 'valid-stream-id',
    description: 'This is a description.'
  };
  const file = createImagePayload(__dirname + '/../data/1mb-file.dat');

  connections['testuser2-0'].events.createWithAttachment(event, file, (err, event) => {

  });

  async.eachOfLimit(connections, 10, (conn, key, done) => {
    conn.events.createWithAttachment(event, file, function (err, event) {
      console.log('callback for ', conn.username);
      if (err) {
        console.log('got error', err);
        return done();
      }
      console.log('stream created', event.getData());
      done(null, event.getData);
    })
  }, (err, results) => {
    if (err) {
      console.log('got err in parallel call', err);
    }
    console.log('results', results);
  });
}


function createImagePayload(imagePath) {

  var pictureData = fs.readFileSync(imagePath);
  var formData = pryv.utility.forgeFormData('attachment-id', pictureData, {
    type: 'image/jpg',
    filename: 'attachment'
  });
  return formData;
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
