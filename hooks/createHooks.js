const fs = require('fs');
const _ = require('lodash');
const path = require('path');

const enqueueHook = require('./enqueueHook/enqueue');
const enqueuePersistentState = require('./enqueueHook/enqueue.json');

const DOMAIN = 'obpm-dev.io';
const HOSTNAME = 'queue-api';
const PORT = 9000;
const PATH = '/queue';
const AUTH = 'MgA27MeEu4qb68YZLU8wdUhQh2ThPDQGLCXDCqpUZvHxia';
const HOOK_FOLDER = './hooks';


const usersCredentials = JSON.parse(fs.readFileSync('../parse/users.json'));

console.log('got users');

const inspect = require('util').inspect;

usersCredentials.forEach((u) => {
    let enqueuePersistentStateInstance = _.cloneDeep(enqueuePersistentState);
      enqueuePersistentStateInstance.user.username = u.username;
      enqueuePersistentStateInstance.user.token = u.token;
      enqueuePersistentStateInstance.user.domain = DOMAIN;
      enqueuePersistentStateInstance.system.queue.hostname = HOSTNAME;
      enqueuePersistentStateInstance.system.queue.port = PORT;
      enqueuePersistentStateInstance.system.queue.path = PATH;
      enqueuePersistentStateInstance.system.queue.headers.Authorization = AUTH;

    const folderName = path.join(HOOK_FOLDER, u.username + '.' + DOMAIN + '+' + u.token);
    const hookContent = path.join(folderName, enqueueHook.id + '.js');
    const hookPeristentState = path.join(folderName, enqueueHook.id + '.json');
    mkdirSync(folderName);
    fs.writeFileSync(hookContent, 'module.exports = ' + inspect(enqueueHook, false, 2, false) + ';'),
    fs.writeFileSync(hookPeristentState, JSON.stringify(enqueuePersistentStateInstance));
})

function mkdirSync (dirPath) {
    try {
      fs.mkdirSync(dirPath)
    } catch (err) {
      if (err.code !== 'EEXIST') throw err
    }
  }
  

