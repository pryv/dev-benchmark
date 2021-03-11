const launchApiServer = require('./launch-api-server');
const launchHelloWorld = require('./launch-hello-world');
const globals = require('./globals');
const accounts = require('./accounts');
const accesses = require('./accesses');
const streams = require('./streams');
const os = require('os');
const Pryv = require('pryv');

const fs = require('fs');

const d = new Date();
const baseFileName = d.toISOString().replace(/:/g, '-').replace(/\./g, '-') + '-' + os.hostname();

// async/await
async function go(defaults) {
 
  await globals.init();
  const account = await accounts.create();
  pryv.account = account;
  const access = await accesses.create();
  pryv.access = access;
  const apiEndpoint = await pryv.service.apiEndpointFor(pryv.account.username, pryv.access.token);
  const connection = new Pryv.Connection(apiEndpoint);
  const apiCalls = [];
  
  for (let i = 0; i < 200; i++) {
    const parentId =  i ? "c"+(i -1) : null ;
    apiCalls.push(
      {
        "method": "streams.create",
        "params": { "id": "c"+i, "name": "name"+i , "parentId": parentId}
      });
  }
  console.time("api");
  const result = await connection.api(apiCalls);
  console.log(result);
  console.timeEnd("api");
  
}


(async () => {
  const server = await launchApiServer.withConfig({'basic': {}}, true);
  for (let i = 0; i < 6000; i++) {
    await go();
    console.log(i);
  }
  await server.kill();
  process.exit(0);

})();

