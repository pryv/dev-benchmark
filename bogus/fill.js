/**
 * @license
 * Copyright (C) Pryv https://pryv.com
 * This file is part of Pryv.io and released under BSD-Clause-3 License
 * Refer to LICENSE file
 */
/**
 * Fill an account 
 */

const launchApiServer = require('../src/launchers/launch-api-server');
const globals = require('../src/lib/globals');
const users = require('../src/lib/users');
const os = require('os');
const async = require('async');

const fs = require('fs');

const d = new Date();
const baseFileName = d.toISOString().replace(/:/g, '-').replace(/\./g, '-') + '-' + os.hostname();

let fillTask = 0;
// async/await
async function fill(streamscount, eventscount) {
  const myid = fillTask++ + 0;
  
  const account = await users.create();
  console.log(account)
  const connection = await pryv.service.login(account.username, account.password, account.appid);
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

