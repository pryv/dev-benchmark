/**
 * @license
 * Copyright (C) Pryv https://pryv.com
 * This file is part of Pryv.io and released under BSD-Clause-3 License
 * Refer to LICENSE file
 */
const path = require('path');

const Launcher = require('./Launcher');

PATH_HW = './';

async function go(speak) {
  const cwd = path.resolve(__dirname, PATH_HW);
  const s = new Launcher(cwd, 'node', ['./hello-mongo-server.js'], 'Ready', speak);
  await s.ready();
  console.log('Hello Mongo Started');
  return s;
}

module.exports = {
  go: go
}