/**
 * @license
 * Copyright (C) Pryv https://pryv.com
 * This file is part of Pryv.io and released under BSD-Clause-3 License
 * Refer to LICENSE file
 */
const superagent = require('superagent');
const charlatan = require('charlatan');

async function create(apiEndPoint, permissions) {
  permissions = permissions || [{streamId: '*', level: 'manage'}];
  try {
    const data = {
      name: charlatan.Name.name(),
      permissions: permissions
    };

    const res = await superagent.post(apiEndPoint + 'accesses').send(data);
    return res.body.access;
  } catch (e) {
    const msg = e.response ? e.response.text : e.message;
    console.log( msg);
  }
}

module.exports = {
  create: create,

};