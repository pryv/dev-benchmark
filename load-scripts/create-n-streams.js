/**
 * @license
 * Copyright (C) Pryv https://pryv.com
 * This file is part of Pryv.io and released under BSD-Clause-3 License
 * Refer to LICENSE file
 */

const Pryv = require('pryv');

const connection = new Pryv.Connection('https://ckmc47hw600052ms1arhh0rlo@iliakebets.pryv.addmin.com/');

/**
 * Create 'n' streams in a sucession of parents and child
 * @param {*} n 
 */
async function createStream(n) {
  const baseId = Math.round(Math.random()*100000000)+'';

  const apiCalls = [];
  for (let i = 0; i < n; i++) {
    
    const parentId =  i ? baseId+'c'+(i -1) : null ;
    apiCalls.push(
      {
        'method': 'streams.create',
        'params': { 'id': baseId+'c'+i, 'name': baseId+ 'name'+i , 'parentId': parentId}
      });
  }
  const msg = 'Created ' + n + ' streams in';
  console.time(msg);
  const result = await connection.api(apiCalls);
  console.timeEnd(msg);
}

(async () => {
  for (let i = 0; i < 50; i++) {
    await createStream(i);
  }
})();


