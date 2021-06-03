const launchApiServer = require('./launch-api-server');
const globals = require('./globals');
const accounts = require('./accounts');
const accesses = require('./accesses');
const streams = require('./streams');
const os = require('os');
const Pryv = require('pryv');
const async = require('async');

const fs = require('fs');

const d = new Date();
const baseFileName = d.toISOString().replace(/:/g, '-').replace(/\./g, '-') + '-' + os.hostname();

let fillTask = 0;
// async/await
async function fill(access, streamscount, eventsPerStreams, id) {

  const connection = new Pryv.Connection(access.apiEndpoint);
 
  const apiCalls = [{
    "method": "streams.create",
    "params": { "id": 'z', "name": "zz", "parentId": "z" }
  }];
  for (let i = 0; i < streamscount; i++) {
    const parentId = null;
    apiCalls.push(
      {
        "method": "streams.create",
        "params": { "id": id + "z" + i, "name": id + "name" + i, "parentId": 'z' }
      });
    for (let j = 0; j < eventsPerStreams; j++) {
      apiCalls.push(
        {
          "method": "events.create",
          "params": { "streamId": id + "z" + i, "type": "note/txt", "content": "Hello World" }
        });
    }
  }
  console.time("api");
  const result = await connection.api(apiCalls);
  console.timeEnd("api");

}


(async () => {
  await globals.init();
  
  //const server = await launchApiServer.withConfig({ 'basic': {} }, true);
  //const account = await accounts.create();
  //pryv.account = account;
  //const access = await accesses.create();
  //console.log(access);
  const access = {
    name: 'Erich Kuphal',
    permissions: [ { streamId: '*', level: 'manage' } ],
    type: 'shared',
    token: 'ckmuryn8h000c059ybt0td612',
    created: 1617033444.641,
    createdBy: 'ckmuryn6c0002059ycjjui98b',
    modified: 1617033444.641,
    modifiedBy: 'ckmuryn6c0002059ycjjui98b',
    id: 'ckmuryn8i000d059y1nzhu6x9',
    apiEndpoint: 'http://ckmuryn8h000c059ybt0td612@localhost:3000/6xkfugq/'
  }
  
  for (let i = 0; i < 100; i++) {
    await fill(access, 100, 2, i);
  }
  //await server.kill();
  //process.exit(0);

})();

