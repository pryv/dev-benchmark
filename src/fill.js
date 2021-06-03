const launchApiServer = require('./launch-api-server');
const launchHelloWorld = require('./launch-hello-world');
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
async function fill(streamscount, eventscount) {
  const myid = fillTask++ + 0;
  
  const account = await accounts.create();
  /** 
  pryv.account = account;
  const access = await accesses.create();
  pryv.access = access;
  const apiEndpoint = await pryv.service.apiEndpointFor(pryv.account.username, pryv.access.token);
  const connection = new Pryv.Connection(apiEndpoint);
  */
  const connection = await pryv.service.login(account.username, account.password, account.appId);
  const apiCalls = [];

  // average events per streams 
  let eventsPerStreams = eventscount / streamscount;
  
  for (let i = 0; i < streamscount; i++) {
    const parentId =  i ? "c"+(i -1) : null ;
    apiCalls.push(
      {
        "method": "streams.create",
        "params": { "id": "c"+i, "name": "name"+i , "parentId": parentId}
      });
    for (let j = 0; j < eventsPerStreams; j++) {
      apiCalls.push(
        {
          "method": "events.create",
          "params": { "streamId": "c"+i, "type": "note/txt" , "content": "Hello World"}
        });
    }
  }
  console.time("api" + myid);
  const result = await connection.api(apiCalls);
  console.log(myid);
  console.timeEnd("api" + myid);
  
}


(async () => {
 const server = await launchApiServer.withConfig({'basic': {}}, true);

  
  async function myTask () {
    await fill(22, 30 * 30 * 2);
  }
  const n = 1;
  const taskLists = Array(n).fill(myTask);

  await globals.init();
  console.time("batch of " + n);
  await async.parallelLimit(taskLists, 1);
  console.timeEnd("batch of " + n);
  await server.kill();
  process.exit(0);

})();

