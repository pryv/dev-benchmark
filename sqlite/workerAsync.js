/**
 * @license
 * Copyright (C) Pryv https://pryv.com
 * This file is part of Pryv.io and released under BSD-Clause-3 License
 * Refer to LICENSE file
 */
/**
 * Open sqlite connection and perform writes
 */
 const sqlite3 = require('better-sqlite3');
 
const DB_OPTIONS = {

};

const db = new sqlite3('testDB.sqlite', DB_OPTIONS);
db.pragma('journal_mode = WALL');
db.pragma('busy_timeout = 0');
db.prepare('CREATE TABLE IF NOT EXISTS data ( line TEXT );').run();
 
const insertStatement = db.prepare('INSERT INTO data (line) VALUES (@line)');

const name = process.argv[2] || Math.random();

console.log('Ready', name);
setTimeout(go, 1);

let startTime;
function go() {
  startTime = Date.now();
  console.log('Go', name);
  for (let i = 0; i < 10000; i++) {
    //write(i)();
    setTimeout(write(i), 1);
  }
  console.log('Launched', name);
}

let busyCount = 0;
let maxTime = 0;
let recoveredCount = 0;
let failedCount = 0;
let recoveryMax = 0;

function write(n) {
  return async function() {
    const time = Date.now();

    const insertMany = db.transaction((lines) => {
      for (const line of lines) insertStatement.run(line);
    });
   
    const lines = [];
    for (let i = 0; i < 3; i++) {
      lines.push({ line: 'Joey' });
    }

     await execWriteStatement(() => { insertMany(lines) }, 10000);
   
    const tt = Date.now() - time;
    if (tt > maxTime) maxTime = tt;
  }
}

 async function execWriteStatement(statement, retries) {
  for (let i = 0; i < retries; i++) {
    try {
      statement();
      if (i > 0) recoveredCount++;
      if (i > recoveryMax) recoveryMax = i;
      return; // close loop and return
    } catch (err) {
      if (err.code === 'SQLITE_BUSY') {
        await new Promise((r) => setTimeout(r, 1));
        busyCount++
      } else {
        throw err;
      }
    }
  }
  failedCount++;
  //console.log('Failed after ' + retries + ' tries');
}

process.on('exit', function () {
  console.log('Closing',name, 
  'busyCount:', busyCount, 
  'recovered', recoveredCount, 
  'recoveryMax retry', recoveryMax,
  'failedCount', failedCount, 
  'maxTime (ms)', maxTime,
  'processTime (ms)', Date.now() - startTime);
});
