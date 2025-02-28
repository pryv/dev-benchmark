/**
 * @license
 * Copyright (C) Pryv https://pryv.com
 * This file is part of Pryv.io and released under BSD-Clause-3 License
 * Refer to LICENSE file
 */
const path = require('path');

const Launcher = require('./Launcher');

PATH_HW = './';

async function go() {
  const cwd = path.resolve(__dirname, PATH_HW);
  const s = new Launcher(cwd, 'node', ['./hello-server.js'], 'Ready');
  await s.ready();
  console.log('Hello World Started');
  return s;
}

module.exports = {
  go: go
}