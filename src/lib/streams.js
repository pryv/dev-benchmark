/**
 * @license
 * Copyright (C) Pryv https://pryv.com
 * This file is part of Pryv.io and released under BSD-Clause-3 License
 * Refer to LICENSE file
 */
const superagent = require('superagent');
const charlatan = require('charlatan');

async function create(apiEndPoint, streamData) {
  streamData = streamData || {name: charlatan.Name.name() }
  try {
    const res = await superagent.post(apiEndPoint + 'streams').send(streamData);
    return res.body.stream;
  } catch (e) {
    console.log(e.response.text);
  }
}

module.exports = {
  create: create,

};