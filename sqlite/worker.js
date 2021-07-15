/**
 * Open sqlite connection and perform writes
 */
 const sqlite3 = require('better-sqlite3');
 
const DB_OPTIONS = {

};

const db = new sqlite3('testDB.sqlite', DB_OPTIONS);
db.pragma('journal_mode = WAL');
db.prepare('CREATE TABLE IF NOT EXISTS data ( line TEXT );').run();
 
const insertStatement = db.prepare('INSERT INTO data (line) VALUES (@line)');

const name = process.argv[2] || Math.random();

console.log('Ready', name);
setTimeout(go, 100);


function go() {
  console.log('Go', name);
  for (let i = 0; i < 10000; i++) {
    setTimeout(write(i), i);
  }
  console.log('Launched', name);
}

function write(n) {
  return function() {
    if ((n % 100) === 0) console.log('>', name, n);
    insertStatement.run({line: 'hello'});
  }
}

